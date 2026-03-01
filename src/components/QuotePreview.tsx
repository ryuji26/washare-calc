"use client"

import { useRef, useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { WASH_PROCESSES, VEHICLE_SIZES, CATEGORY_ICONS } from "@/lib/constants"
import { calculateEstimate, formatPrice } from "@/lib/calculator"
import { type EstimateFormData, type User } from "@/types"

type QuotePreviewProps = {
    formData: EstimateFormData
    user: User | null
    onBack: () => void
    onSave: () => void
    onOpenAuth: () => void
}

export const QuotePreview = ({
    formData,
    user,
    onBack,
    onSave,
    onOpenAuth,
}: QuotePreviewProps) => {
    const quoteRef = useRef<HTMLDivElement>(null)
    const [isGenerating, setIsGenerating] = useState(false)

    // 計算結果
    const calculation = calculateEstimate(
        formData.selectedProcessIds,
        formData.hourlyRate,
        formData.workHours,
        formData.workMinutes,
        formData.customCosts,
        formData.vehicleSize,
        formData.polishingPasses
    )

    // 選択された工程
    const selectedProcesses = WASH_PROCESSES.filter((p) =>
        formData.selectedProcessIds.includes(p.id)
    )

    // 車両サイズ表示
    const vehicleLabel =
        VEHICLE_SIZES.find((s) => s.value === formData.vehicleSize)?.description ??
        formData.vehicleSize

    // 作業時間表示
    const timeLabel =
        formData.workHours > 0
            ? `${formData.workHours}時間${formData.workMinutes > 0 ? `${formData.workMinutes}分` : ""}`
            : `${formData.workMinutes}分`

    // 今日の日付
    const today = new Date()
    const dateLabel = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`

    // 画像を保存してLINEで送る
    const handleSaveImage = useCallback(async () => {
        if (!quoteRef.current || isGenerating) return

        setIsGenerating(true)
        try {
            const html2canvas = (await import("html2canvas")).default
            // 少し待つことで画像のロード等を確実にする
            await new Promise(r => setTimeout(r, 100))

            const canvas = await html2canvas(quoteRef.current, {
                backgroundColor: "#ffffff",
                scale: 2, // 高画質化
                useCORS: true, // 外部画像の読み込みを許可
                allowTaint: true,
                logging: false,
                windowWidth: quoteRef.current.scrollWidth,
                windowHeight: quoteRef.current.scrollHeight
            })

            canvas.toBlob(async (blob) => {
                if (!blob) {
                    throw new Error("Blob生成エラー")
                }

                if (navigator.share) {
                    const file = new File([blob], "washare-estimate.png", {
                        type: "image/png",
                    })
                    const shareData = {
                        title: "Washare Calc 見積書",
                        text: "洗車・ディテーリング見積書\n",
                        files: [file],
                    }
                    if (!navigator.canShare || navigator.canShare(shareData)) {
                        try {
                            await navigator.share(shareData)
                            setIsGenerating(false)
                            return
                        } catch (e: any) {
                            // AbortErrorはユーザーがシェア画面を閉じただけなので無視
                            if (e.name !== "AbortError") {
                                console.error("Share Failed:", e)
                            }
                        }
                    }
                }

                // シェア機能が使えない、またはキャンセル時はダウンロードへフォールバック
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = "washare-estimate.png"
                a.style.display = "none"
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)

            }, "image/png", 1.0)
        } catch (error: any) {
            console.error("画像生成エラー:", error)
            alert("画像の生成・共有に失敗しました。時間をおいて再度お試しください。(" + error.message + ")")
        } finally {
            setIsGenerating(false)
        }
    }, [isGenerating])

    return (
        <div className="min-h-screen bg-neutral-100">
            {/* 見積書本体（画像変換対象） */}
            <div className="mx-auto max-w-lg px-4 py-6">
                <div
                    ref={quoteRef}
                    className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/5"
                >
                    {/* ヘッダー（ロゴ・ブランド部分） */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 px-6 pb-8 pt-8">
                        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-600/10 blur-3xl" />
                        <div className="absolute -bottom-4 -left-8 h-32 w-32 rounded-full bg-gradient-to-tr from-cyan-500/5 to-transparent blur-2xl" />

                        <div className="relative">
                            <div className="mb-5 flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/20">
                                    <span className="text-sm">💧</span>
                                </div>
                                <div>
                                    <div className="text-sm font-bold tracking-wider text-white">
                                        Washare Calc
                                    </div>
                                    <div className="text-[10px] tracking-widest text-neutral-400">
                                        DETAILING ESTIMATE
                                    </div>
                                </div>
                            </div>

                            <div className="mb-1 text-[11px] uppercase tracking-[0.2em] text-neutral-400">
                                Estimate
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-white">
                                御見積書
                            </h2>
                            <div className="mt-2 text-xs text-neutral-400">{dateLabel}</div>
                        </div>
                    </div>

                    {/* 請求金額 */}
                    <div className="border-b border-neutral-100 px-6 py-6">
                        <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                            ご請求金額
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-extrabold tabular-nums tracking-tight text-neutral-900">
                                {formatPrice(calculation.totalPrice)}
                            </span>
                            <span className="text-sm text-neutral-400">(税込)</span>
                        </div>
                    </div>

                    {/* 車両情報 & 所要時間 */}
                    <div className="grid grid-cols-2 gap-px border-b border-neutral-100 bg-neutral-100">
                        <div className="bg-white px-6 py-4">
                            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                                車両サイズ
                            </div>
                            <div className="text-sm font-bold text-neutral-800">
                                <span className="mr-1.5 text-lg">{formData.vehicleSize}</span>
                                <span className="text-neutral-500">{vehicleLabel}</span>
                            </div>
                        </div>
                        <div className="bg-white px-6 py-4">
                            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                                想定所要時間
                            </div>
                            <div className="text-sm font-bold text-neutral-800">
                                {timeLabel}
                            </div>
                        </div>
                    </div>

                    {/* 施工内容 */}
                    <div className="px-6 py-6">
                        <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                            施工内容
                        </div>
                        <div className="space-y-0">
                            {selectedProcesses.map((process, index) => (
                                <div key={process.id}>
                                    <div className="flex items-center gap-3 py-2.5">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-100 to-neutral-50 text-xs font-bold text-neutral-500 ring-1 ring-neutral-200/50">
                                            {index + 1}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">
                                                {CATEGORY_ICONS[process.category]}
                                            </span>
                                            <span className="text-sm font-medium text-neutral-700">
                                                {process.name}
                                            </span>
                                        </div>
                                    </div>
                                    {index < selectedProcesses.length - 1 && (
                                        <Separator className="ml-3.5 w-px bg-neutral-200" />
                                    )}
                                    {/* 最後の工程の後に研磨を表示 */}
                                    {index === selectedProcesses.length - 1 &&
                                        formData.polishingPasses > 0 && (
                                            <>
                                                <Separator className="ml-3.5 w-px bg-neutral-200" />
                                                <div className="flex items-center gap-3 py-2.5">
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-100 to-neutral-50 text-xs font-bold text-neutral-500 ring-1 ring-neutral-200/50">
                                                        {selectedProcesses.length + 1}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm">✨</span>
                                                        <span className="text-sm font-medium text-neutral-700">
                                                            ボディ研磨（{formData.polishingPasses}周）
                                                        </span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* フッター */}
                    <div className="border-t border-neutral-100 bg-neutral-50/50 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="text-[10px] text-neutral-400">
                                本見積書の有効期限: 発行日より14日間
                            </div>
                            <div className="text-[10px] font-medium tracking-wider text-neutral-400">
                                Washare Calc
                            </div>
                        </div>
                    </div>
                </div>

                {/* アクションボタン */}
                <div className="mt-6 space-y-3 pb-8">
                    {/* 見積もりを保存するボタン */}
                    <Button
                        onClick={user ? onSave : onOpenAuth}
                        variant="outline"
                        className="h-12 w-full rounded-xl border-cyan-500/30 bg-cyan-500/5 text-sm font-semibold text-cyan-600 hover:bg-cyan-500/10"
                    >
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        {user
                            ? "この見積もりを保存する"
                            : "この見積もりを保存する（※要ログイン）"}
                    </Button>

                    {/* LINE送信ボタン */}
                    <Button
                        onClick={handleSaveImage}
                        disabled={isGenerating}
                        className="h-14 w-full rounded-xl bg-gradient-to-r from-[#06C755] to-[#05b34e] text-base font-bold text-white shadow-lg shadow-[#06C755]/25 transition-all hover:shadow-[#06C755]/40"
                    >
                        {isGenerating ? (
                            <svg className="mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 5.82 2 10.5c0 2.93 1.95 5.5 4.85 6.97.22.1.37.32.37.56 0 .65-.42 2.37-.48 2.73-.08.45.17.88.62.88.16 0 .32-.05.45-.15.52-.38 2.68-1.7 3.8-2.43.45.06.91.09 1.39.09 5.52 0 10-3.82 10-8.5S17.52 2 12 2z" />
                            </svg>
                        )}
                        {isGenerating ? "画像を作成しています..." : "画像を保存 / LINEで送る"}
                    </Button>

                    {/* 編集に戻るボタン */}
                    <Button
                        onClick={onBack}
                        variant="outline"
                        className="h-12 w-full rounded-xl border-neutral-300 text-sm font-medium text-neutral-600"
                    >
                        見積もりを編集する
                    </Button>
                </div>
            </div>
        </div>
    )
}
