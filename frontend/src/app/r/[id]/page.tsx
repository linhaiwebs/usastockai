import { RedirectPage } from '@/components/RedirectPage'

/**
 * Redirect Intermediate Page - /r/[id]
 */
export default function RedirectRoute({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10)
  return <RedirectPage id={id} />
}
