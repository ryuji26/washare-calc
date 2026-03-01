import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    const errorMsg = searchParams.get('error')
    const errorDesc = searchParams.get('error_description')

    // Google側等ですでにエラーとしてコールバックされた場合
    if (errorMsg) {
        return NextResponse.redirect(`${origin}/?error=${errorMsg}&error_description=${errorDesc}`)
    }

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
        } else {
            // exchangeCodeForSession自体が失敗した場合（code_verifierが無いなど）
            return NextResponse.redirect(`${origin}/?error=exchange_failed&error_description=${encodeURIComponent(error.message)}`)
        }
    }

    // codeが無い、またはその他のエラー
    return NextResponse.redirect(`${origin}/?error=invalid_request&error_description=no_code_provided_in_callback`)
}
