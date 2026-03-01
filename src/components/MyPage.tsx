"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { type User, type SavedEstimate, type EstimateFormData } from "@/types"
import { formatPrice } from "@/lib/calculator"

type MyPageProps = {
    user: User
    estimates: SavedEstimate[]
    onViewEstimate: (formData: EstimateFormData) => void
    onDeleteEstimate: (estimateId: string) => void
    onNavigateHome: () => void
}

export const MyPage = ({
    user,
    estimates,
    onViewEstimate,
    onDeleteEstimate,
    onNavigateHome,
}: MyPageProps) => {
    // 日付フォーマット
    const formatDate = (iso: string): string => {
        const d = new Date(iso)
        return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`
    }

    // ダミー工程設定データ
    const customProcesses = useMemo(
        () => [
            { name: "オリジナルコーティング", cost: 5000 },
            { name: "レザーシートクリーニング", cost: 3000 },
            { name: "エンジンルーム洗浄", cost: 2000 },
        ],
        []
    )

    return (
        <div className="min-h-screen bg-background pb-24">
            <div className="mx-auto max-w-lg space-y-6 px-4 pt-6">
                {/* プロフィールカード */}
                <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
                    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 px-5 py-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-xl font-bold text-white shadow-lg shadow-cyan-500/20">
                                {user.displayName.slice(0, 1)}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-bold text-foreground">
                                    {user.displayName}
                                </h2>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                {user.area && (
                                    <div className="mt-1 flex items-center gap-1">
                                        <svg className="h-3 w-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-xs text-muted-foreground">
                                            {user.area}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <CardContent className="px-5 py-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>見積もり作成数</span>
                            <span className="font-bold text-foreground">{estimates.length}件</span>
                        </div>
                    </CardContent>
                </Card>

                {/* 過去の見積もり履歴 */}
                <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        見積もり履歴
                    </h3>

                    {estimates.length === 0 ? (
                        <Card className="border-border/50 bg-card/50">
                            <CardContent className="flex flex-col items-center py-10">
                                <div className="mb-3 text-3xl">📋</div>
                                <p className="text-sm text-muted-foreground">
                                    まだ見積もりがありません
                                </p>
                                <Button
                                    onClick={onNavigateHome}
                                    variant="outline"
                                    size="sm"
                                    className="mt-4 text-xs"
                                >
                                    見積もりを作成する
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-2">
                            {estimates.map((est) => (
                                <Card
                                    key={est.id}
                                    className="cursor-pointer border-border/50 bg-card/50 transition-all hover:border-cyan-500/30 hover:bg-card/80"
                                    onClick={() => onViewEstimate(est.formData)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-cyan-500/10 text-[10px] text-cyan-400 border-cyan-500/20"
                                                    >
                                                        {est.formData.vehicleSize}
                                                    </Badge>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {est.vehicleSizeLabel}
                                                    </span>
                                                </div>
                                                <div className="mt-2 text-lg font-bold tabular-nums text-foreground">
                                                    {formatPrice(est.totalPrice)}
                                                </div>
                                                <div className="mt-1.5 flex flex-wrap gap-1">
                                                    {est.processNames.slice(0, 3).map((name) => (
                                                        <span
                                                            key={name}
                                                            className="rounded bg-secondary/50 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                                                        >
                                                            {name}
                                                        </span>
                                                    ))}
                                                    {est.processNames.length > 3 && (
                                                        <span className="px-1 text-[10px] text-muted-foreground">
                                                            +{est.processNames.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {formatDate(est.createdAt)}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            onDeleteEstimate(est.id)
                                                        }}
                                                        className="text-muted-foreground hover:text-red-500 transition-colors"
                                                        title="削除"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                <Separator className="bg-border/30" />

                {/* オリジナル工程・ケミカルの原価設定（ダミー） */}
                <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        オリジナル工程・原価設定
                        <Badge variant="secondary" className="ml-auto text-[10px]">
                            Coming Soon
                        </Badge>
                    </h3>

                    <Card className="border-border/50 bg-card/50">
                        <CardContent className="p-4">
                            <div className="space-y-3">
                                {customProcesses.map((proc) => (
                                    <div
                                        key={proc.name}
                                        className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2.5"
                                    >
                                        <span className="text-sm text-muted-foreground">
                                            {proc.name}
                                        </span>
                                        <span className="text-sm font-bold tabular-nums text-foreground">
                                            ¥{proc.cost.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                className="mt-4 h-10 w-full border-dashed border-border/50 text-xs text-muted-foreground"
                                disabled
                            >
                                + オリジナル工程を追加（準備中）
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* ホームに戻る */}
                <Button
                    onClick={onNavigateHome}
                    className="h-12 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-bold text-white shadow-lg shadow-cyan-500/25"
                >
                    見積もりを作成する
                </Button>
            </div>
        </div>
    )
}
