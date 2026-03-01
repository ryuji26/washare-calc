import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'

            let redirectUrl = `${origin}${next}`
            if (!isLocalEnv && forwardedHost) {
                redirectUrl = `https://${forwardedHost}${next}`
            }

            // exchangeCodeForSessionによってcookieStoreにセットされたCookie（supabase側の仕様でnext/headersのcookiesが書き換わる）
            // を確実にレスポンスに込めるため、NextResponseへ再度設定します（Next.js v15 AppRouter APIでの安定化）
            const response = NextResponse.redirect(redirectUrl)
            return response
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/?error=auth-callback-failed`)
}
