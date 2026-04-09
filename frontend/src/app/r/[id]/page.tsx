import { RedirectPage } from '@/components/RedirectPage'

/**
 * 分流中间页 - /r/[id]
 */
export default function RedirectRoute({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10)
  return <RedirectPage id={id} />
}
