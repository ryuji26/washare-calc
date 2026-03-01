import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Supabaseクライアントの初期化
// SSR向けの @supabase/ssr パッケージの代替として、
// SPA的に振る舞うため、明示的に localStorage をセッション保存先として指定します
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Next.jsのSSR環境では window が存在しないため判定を入れる
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "pkce",
    },
})
