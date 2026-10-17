import { redirect } from 'next/navigation'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const query = new URLSearchParams()
  query.set('mode', 'login')
  if (params?.redirect) query.set('redirect', String(params.redirect))
  if (params?.role) query.set('role', String(params.role))
  if (params?.next) query.set('next', String(params.next))
  
  redirect(`/register?${query.toString()}`)
}