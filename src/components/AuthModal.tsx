"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { type User, type AuthModalMode } from "@/types"
import { createClient } from "@/utils/supabase/client"
import { fetchUserProfile, updateUserProfile } from "@/lib/storage"

// 都道府県リスト
const PREFECTURES = [
    "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
    "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
    "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
    "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
    "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
    "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
    "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
]

type AuthModalProps = {
    mode: AuthModalMode
    onClose: () => void
    onLogin: (user: User) => void
}

export const AuthModal = ({ mode, onClose, onLogin }: AuthModalProps) => {
    const [activeTab, setActiveTab] = useState<"login" | "register">(mode ?? "login")

    // ログインフォーム
    const [loginEmail, setLoginEmail] = useState("")
    const [loginPassword, setLoginPassword] = useState("")

    // 登録フォーム
    const [regEmail, setRegEmail] = useState("")
    const [regPassword, setRegPassword] = useState("")
    const [regName, setRegName] = useState("")
    const [regArea, setRegArea] = useState("")

    // ローディング状態
    const [isLoading, setIsLoading] = useState(false)

    // ログイン処理
    const handleLogin = async () => {
        if (!loginEmail || !loginPassword) return
        setIsLoading(true)
        const supabase = createClient()
        try {
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword,
            })
            if (error) throw error

            if (authData.user) {
                const profile = await fetchUserProfile(authData.user.id)
                if (profile) {
                    onLogin({
                        ...profile,
                        email: loginEmail,
                    })
                } else {
                    alert("プロファイルが見つかりません。")
                }
            }
        } catch (e: any) {
            alert(e.message || "ログインに失敗しました")
        } finally {
            setIsLoading(false)
        }
    }

    // 新規登録処理
    const handleRegister = async () => {
        if (!regEmail || !regPassword || !regName || !regArea) return
        setIsLoading(true)
        const supabase = createClient()
        try {
            const { data: authData, error } = await supabase.auth.signUp({
                email: regEmail,
                password: regPassword,
            })
            if (error) throw error

            if (authData.user) {
                // profile 作成
                await updateUserProfile(authData.user.id, regName, regArea)

                // onLogin内でモーダルが閉じるはずなので、Loadingは解除
                setIsLoading(false)

                onLogin({
                    id: authData.user.id,
                    email: regEmail,
                    displayName: regName,
                    area: regArea,
                    createdAt: new Date().toISOString(),
                })
            }
        } catch (e: any) {
            console.error("SignUp/Profile Creation Error:", e)
            alert(e.message || "登録に失敗しました")
            setIsLoading(false)
        }
    }

    // Googleログイン処理
    const handleGoogleLogin = async () => {
        setIsLoading(true)
        const supabase = createClient()
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                }
            })
            if (error) throw error
        } catch (e: any) {
            console.error("Google Login Error:", e)
            alert(e.message || "Googleログインに失敗しました")
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={mode !== null} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[380px] rounded-2xl border-border/50 bg-background p-0">
                <DialogHeader className="border-b border-border/30 px-6 pt-6 pb-4">
                    <DialogTitle className="text-center text-lg font-bold">
                        Washare Calc
                    </DialogTitle>
                    <p className="text-center text-xs text-muted-foreground">
                        見積もり履歴を保存・管理できます
                    </p>
                </DialogHeader>

                <Tabs
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as "login" | "register")}
                    className="px-6 pb-6 pt-2"
                >
                    <TabsList className="mb-4 grid w-full grid-cols-2 bg-secondary/50">
                        <TabsTrigger value="login" className="text-xs">
                            ログイン
                        </TabsTrigger>
                        <TabsTrigger value="register" className="text-xs">
                            新規登録
                        </TabsTrigger>
                    </TabsList>

                    {/* ログインタブ */}
                    <TabsContent value="login" className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">メールアドレス</Label>
                            <Input
                                type="email"
                                placeholder="mail@example.com"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                className="h-11 border-border/50 bg-secondary/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">パスワード</Label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                className="h-11 border-border/50 bg-secondary/30"
                            />
                        </div>
                        <Button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="h-11 w-full bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                        >
                            {isLoading ? "処理中..." : "ログイン"}
                        </Button>

                        <div className="relative my-3">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border/30" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-background px-3 text-[10px] text-muted-foreground">
                                    または
                                </span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="h-11 w-full border-border/50 text-sm"
                            disabled={isLoading}
                            onClick={handleGoogleLogin}
                        >
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Googleでログイン
                        </Button>
                    </TabsContent>

                    {/* 新規登録タブ */}
                    <TabsContent value="register" className="space-y-3">
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">メールアドレス</Label>
                            <Input
                                type="email"
                                placeholder="mail@example.com"
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                className="h-11 border-border/50 bg-secondary/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">パスワード</Label>
                            <Input
                                type="password"
                                placeholder="8文字以上"
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                className="h-11 border-border/50 bg-secondary/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">
                                屋号 / ニックネーム
                            </Label>
                            <Input
                                type="text"
                                placeholder="例: 田中洗車サービス"
                                value={regName}
                                onChange={(e) => setRegName(e.target.value)}
                                className="h-11 border-border/50 bg-secondary/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">
                                活動エリア（都道府県）
                            </Label>
                            <Select value={regArea} onValueChange={setRegArea}>
                                <SelectTrigger className="h-11 border-border/50 bg-secondary/30">
                                    <SelectValue placeholder="選択してください" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {PREFECTURES.map((pref) => (
                                        <SelectItem key={pref} value={pref}>
                                            {pref}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={handleRegister}
                            disabled={isLoading}
                            className="h-11 w-full bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                        >
                            {isLoading ? "処理中..." : "無料で登録する"}
                        </Button>

                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border/30" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-background px-3 text-[10px] text-muted-foreground">
                                    または
                                </span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="h-11 w-full border-border/50 text-sm"
                            disabled={isLoading}
                            onClick={handleGoogleLogin}
                        >
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Googleで連携して登録
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
