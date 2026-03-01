"use client"

import { Button } from "@/components/ui/button"
import { type User, type AuthModalMode } from "@/types"

type HeaderProps = {
    user: User | null
    onOpenAuth: (mode: AuthModalMode) => void
    onNavigateMyPage: () => void
    onNavigateHome: () => void
    onLogout: () => void
}

export const Header = ({
    user,
    onOpenAuth,
    onNavigateMyPage,
    onNavigateHome,
    onLogout,
}: HeaderProps) => {
    return (
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
                {/* ロゴ */}
                <button
                    type="button"
                    onClick={onNavigateHome}
                    className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
                        <span className="text-lg">💧</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-foreground">
                            Washare Calc
                        </h1>
                        <p className="text-[10px] text-muted-foreground">
                            見積もり作成ツール
                        </p>
                    </div>
                </button>

                {/* 右側: 認証ボタン or ログアウト */}
                <div className="flex items-center gap-2">
                    {user ? (
                        <>
                            {/* ログアウト */}
                            <button
                                type="button"
                                onClick={onLogout}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                title="ログアウト"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onOpenAuth("login")}
                                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                            >
                                ログイン
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => onOpenAuth("register")}
                                className="h-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-semibold text-white shadow-sm shadow-cyan-500/20"
                            >
                                無料登録
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
