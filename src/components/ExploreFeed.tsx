"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type PublicEstimate } from "@/types"
import { formatPrice } from "@/lib/calculator"

type ExploreFeedProps = {
    estimates: PublicEstimate[]
    onViewDetail: (estimateId: string) => void
}

export const ExploreFeed = ({ estimates, onViewDetail }: ExploreFeedProps) => {

    // 経過時間をフォーマット（例: 2時間前）
    const formatTimeAgo = (iso: string): string => {
        const d = new Date(iso)
        const now = new Date()
        const diffMs = now.getTime() - d.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

        if (diffHours < 24) {
            return `${diffHours}時間前`
        }
        const diffDays = Math.floor(diffHours / 24)
        return `${diffDays}日前`
    }

    return (
        <div className="min-h-screen bg-background pb-32">
            <div className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="mx-auto max-w-lg px-4 py-4">
                    <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                        <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        みんなの見積
                    </h2>
                    <p className="text-[11px] text-muted-foreground mt-1">
                        他のユーザーが公開した見積もりをタイムラインでチェック
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-lg space-y-4 px-4 pt-4">
                {estimates.map((est) => (
                    <Card key={est.id} className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-cyan-500/30">
                        <CardContent className="p-0">
                            {/* ヘッダー部：ユーザ情報と時間 */}
                            <div className="flex items-center justify-between border-b border-border/50 bg-secondary/30 px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-sm font-bold text-cyan-400 ring-1 ring-cyan-500/30">
                                        {est.authorName.slice(0, 1)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-foreground">
                                            {est.authorName}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    {formatTimeAgo(est.createdAt)}
                                </div>
                            </div>

                            {/* ボディ部：金額と内容 */}
                            <div className="px-4 py-4">
                                <div className="mb-3 flex items-end justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="bg-cyan-500/10 text-[10px] text-cyan-400 border-cyan-500/20">
                                            {est.vehicleSize}
                                        </Badge>
                                        <span className="text-[11px] text-muted-foreground">サイズ</span>
                                    </div>
                                    <div className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
                                        {formatPrice(est.totalPrice)}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {est.processNames.slice(0, 4).map((name) => (
                                        <span key={name} className="rounded-md bg-secondary/50 px-2 py-1 text-[11px] text-muted-foreground">
                                            {name}
                                        </span>
                                    ))}
                                    {est.polishingPasses > 0 && (
                                        <span className="rounded-md bg-secondary/50 px-2 py-1 text-[11px] text-muted-foreground flex items-center gap-1">
                                            <span className="text-[10px]">✨</span> 研磨{est.polishingPasses}周
                                        </span>
                                    )}
                                    {est.processNames.length > 4 && (
                                        <span className="rounded-md px-1 py-1 text-[11px] text-muted-foreground">
                                            +{est.processNames.length - 4}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* フッター部：詳細ボタン */}
                            <div className="border-t border-border/50 bg-secondary/10 px-4 py-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => onViewDetail(est.id)}
                                    className="h-10 w-full text-xs font-semibold text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
                                >
                                    詳細を見る
                                    <svg className="ml-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {/* 余白 */}
            <div className="h-6"></div>
        </div>
    )
}
