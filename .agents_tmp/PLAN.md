# 1. OBJECTIVE

Fix the persistent timeout issue in `StockService` where ALL external API calls to the hosted `finance-query.com` are failing with `httpx.TimeoutException`, causing the hot stocks endpoint to return empty data and individual stock lookups to return 404. The root fix is to self-host the finance-query service (from the user's original `finance-query.yml`) within the Docker Compose stack, and add resilience patterns as defense-in-depth.

# 2. CONTEXT SUMMARY

**Affected files:**
- `docker-compose.yml` — Main compose file; missing the finance-query service
- `finance-query.yml` — Standalone compose file for self-hosted finance-query (already exists but not integrated)
- `backend/app/core/config.py` — `FINANCE_QUERY_URL` defaults to `https://finance-query.com` (hosted, currently down)
- `backend/app/services/stock_service.py` — Stock data service with HTTP client, caching, and business logic
- `backend/app/api/stocks.py` — FastAPI endpoints that call `stock_service`

**Current behavior when hosted API is down:**
1. `GET /api/stocks/hot` → tries `https://finance-query.com/v2/quotes` → timeout → falls back to 10 parallel `/v2/quote/{SYMBOL}` calls → all timeout → returns `{"stocks": []}`
2. `GET /api/stocks/{symbol}` → tries `/v2/quote/{SYMBOL}` → timeout → returns 404
3. Frontend shows "No hot stocks data available" or "Market data temporarily unavailable"

**Key technical details:**
- The user originally set up `finance-query.yml` to self-host `ghcr.io/verdenroz/finance-query:latest` but it was never integrated into the main `docker-compose.yml`
- HTTP client timeout: 8s read / 3s connect
- In-memory cache TTL: 120s (2 min); Redis cache TTL: 300s (5 min) for hot stocks
- When cache expires and API fails, `None` is returned — no stale data fallback
- No circuit breaker; every request hits the failing API
- Hot stocks fallback makes 10 parallel requests after batch already failed, compounding the problem

# 3. APPROACH OVERVIEW

**Two-phase approach — root fix + resilience:**

**Phase A — Self-host finance-query (root fix):** Integrate the finance-query service into the main `docker-compose.yml` and point `FINANCE_QUERY_URL` to the internal Docker network address (`http://finance-query:8000`). This eliminates the dependency on the external hosted service at `finance-query.com`.

**Phase B — Add resilience patterns (defense-in-depth):** Even with a self-hosted service, the API can go down. Add stale-while-revalidate and circuit breaker patterns so the system degrades gracefully:
1. **Stale cache fallback**: Serve expired cache data when the API is unreachable
2. **Circuit breaker**: Skip API calls after consecutive failures for a cooldown period
3. **Smart fallback skip**: Skip individual `/v2/quote/{SYMBOL}` fallback when batch already timed out
4. **Extended stale TTL in Redis**: Keep stale data for 30 min as fallback

Rationale: Self-hosting fixes the root cause (external service dependency), while resilience patterns protect against future self-hosted service outages.

# 4. IMPLEMENTATION STEPS

### Step 1: Add finance-query service to docker-compose.yml
**Goal:** Self-host the finance-query API within the Docker stack, eliminating dependency on the external hosted service.
**Method:** Add the finance-query service definition from `finance-query.yml` into `docker-compose.yml`. Use the image `ghcr.io/verdenroz/finance-query:latest`, expose port 8002 externally, use the existing `app-network`. Add health check using `/v2/health` endpoint. Set the backend's `FINANCE_QUERY_URL` environment variable to `http://finance-query:8000` (Docker internal DNS). Make the backend service depend on finance-query being healthy.
**Reference:** `docker-compose.yml`, `finance-query.yml`

### Step 2: Update FINANCE_QUERY_URL default in config
**Goal:** Change the default `FINANCE_QUERY_URL` from the hosted service to the self-hosted Docker internal address.
**Method:** In `backend/app/core/config.py`, change `FINANCE_QUERY_URL` default from `"https://finance-query.com"` to `"http://finance-query:8000"`. Also update the `docker-compose.yml` backend environment to use `http://finance-query:8000`. Update `.env.example` accordingly.
**Reference:** `backend/app/core/config.py`, `docker-compose.yml`, `.env.example`

### Step 3: Add stale cache retrieval methods
**Goal:** Allow the service to return expired cache data as a fallback when the API is unavailable.
**Method:** Add `_get_stale_from_cache()` and `_get_stale_from_redis()` methods that retrieve data regardless of TTL expiration. For Redis, also check a secondary `stale:` prefixed key with a longer TTL (30 min).
**Reference:** `backend/app/services/stock_service.py` — new methods after the existing cache methods (lines ~53-93)

### Step 4: Add circuit breaker state
**Goal:** Prevent repeated attempts to reach a failing upstream API.
**Method:** Add instance variables `_consecutive_failures: int`, `_circuit_open_until: Optional[datetime]`, and constants `CIRCUIT_THRESHOLD = 3`, `CIRCUIT_COOLDOWN = 60`. Add methods `_is_circuit_open() -> bool`, `_record_failure()`, `_record_success()`.
**Reference:** `backend/app/services/stock_service.py` — `StockService.__init__()` and new methods

### Step 5: Modify `_make_request()` to use stale-while-revalidate + circuit breaker
**Goal:** When API calls fail, serve stale cache; when circuit is open, skip API entirely.
**Method:**
1. Check `_is_circuit_open()` at the top — if true, return stale cache immediately
2. If the HTTP request fails (timeout or error), attempt to return stale cache
3. Call `_record_failure()` on failure, `_record_success()` on success
**Reference:** `backend/app/services/stock_service.py` — `_make_request()` method (lines 97-139)

### Step 6: Modify `get_hot_stocks()` to skip fallback on timeout
**Goal:** Avoid 10 redundant timeout requests when the batch endpoint already timed out.
**Method:** When `_make_request("/v2/quotes", ...)` returns `None` and the circuit breaker indicates a timeout pattern, skip the individual `/v2/quote/{SYMBOL}` fallback and return stale cache instead. Only attempt the individual fallback if the batch failed for a non-timeout reason.
**Reference:** `backend/app/services/stock_service.py` — `get_hot_stocks()` method (lines 200-259)

### Step 7: Extend Redis stale TTL for hot stocks
**Goal:** Keep stale hot stock data available in Redis for longer to survive extended outages.
**Method:** When saving to Redis, also save a secondary key with `stale:` prefix and TTL of 1800s (30 min). In `_get_stale_from_redis()`, check the stale key as well.
**Reference:** `backend/app/services/stock_service.py` — `_save_to_redis()` and `_get_stale_from_redis()`

# 5. TESTING AND VALIDATION

**Deployment verification:**
1. Run `docker-compose up -d` and confirm the `finance-query` container starts and passes health checks
2. Verify `GET http://localhost:8002/v2/health` returns 200 (external health check)
3. Verify backend logs show successful responses from `http://finance-query:8000/v2/quotes`
4. Confirm `/api/stocks/hot` returns populated stock data with prices

**Resilience verification (simulate API failure):**
1. Stop the finance-query container: `docker-compose stop finance-query`
2. Confirm `/api/stocks/hot` returns stale cached data instead of `[]`
3. Confirm after 3 failures, circuit breaker trips and requests return immediately (no 8s wait)
4. Confirm logs show `Serving stale cache` and `Circuit breaker tripped` messages
5. Restart finance-query: `docker-compose start finance-query`
6. Confirm circuit breaker resets after cooldown and fresh data is fetched

**Expected API responses (with self-hosted service running):**
- `GET /api/stocks/hot` → `200 OK` with live stock data
- `GET /api/stocks/aapl` → `200 OK` with AAPL quote

**Expected API responses (with self-hosted service down but stale cache exists):**
- `GET /api/stocks/hot` → `200 OK` with stale stock data
- `GET /api/stocks/aapl` → `200 OK` with stale quote data (instead of 404)
