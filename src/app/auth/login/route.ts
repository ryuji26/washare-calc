import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const url = new URL(request.url)
    const baseUrl = `${url.protocol}//${url.host}`
    const supabase = await createClient()

    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${baseUrl}/auth/callback`,
                // サーバー環境での自動リダイレクトを避けてURL文だけを取得する
                skipBrowserRedirect: true,
            },
        })

        if (error) {
            console.error('Server-side OAuth Init Error:', error.message)
            return NextResponse.redirect(`${baseUrl}/?error=oauth_init_failed&error_description=${encodeURIComponent(error.message)}`)
        }

        if (data?.url) {
            // 取得したGoogleのログインURLへユーザーをリダイレクトさせる（HTTP 302）
            return NextResponse.redirect(data.url)
        }

        return NextResponse.redirect(`${baseUrl}/?error=no_url_returned`)
    } catch (e: any) {
        console.error('Server-side OAuth Exception:', e)
        return NextResponse.redirect(`${baseUrl}/?error=oauth_exception&error_description=${encodeURIComponent(e.message)}`)
    }
}
