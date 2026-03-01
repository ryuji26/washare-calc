import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
    const supabase = await createClient()

    // サーバー側でCookieからセッション情報を削除する
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('Sign out error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Next.jsの仕様上、リダイレクトはフロント側で行うか、ここで302を返すか選べる
    // 今回はフロント側（fetch）からのコールを想定し、成功レスポンスを返す
    return NextResponse.json({ success: true })
}
