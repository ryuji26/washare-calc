"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { WASH_PROCESSES, CATEGORY_LABELS } from "@/lib/constants"
import { type User, type SavedEstimate, type EstimateFormData, type CustomProcess } from "@/types"
import { formatPrice } from "@/lib/calculator"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

type MyPageProps = {
    user: User
    estimates: SavedEstimate[]
    onViewEstimate: (formData: EstimateFormData) => void
    onDeleteEstimate: (estimateId: string) => void
    onNavigateHome: () => void
    onSaveProcessCosts?: (costs: Record<string, number>) => Promise<void>
    onSaveCustomProcesses?: (processes: import("@/types").CustomProcess[]) => Promise<void>
}

export const MyPage = ({
    user,
    estimates,
    onViewEstimate,
    onDeleteEstimate,
    onNavigateHome,
    onSaveProcessCosts,
    onSaveCustomProcesses,
}: MyPageProps) => {
    const [isSaving, setIsSaving] = useState(false)
    const [editingCostId, setEditingCostId] = useState<string | null>(null)
    const [localCosts, setLocalCosts] = useState<Record<string, number>>(
        user.defaultProcessCosts || {}
    )

    // カスタム工程のローカル状態
    const [localCustomProcesses, setLocalCustomProcesses] = useState<CustomProcess[]>(
        user.customProcesses || []
    )
    const [editingCustomProcessId, setEditingCustomProcessId] = useState<string | null>(null)
    const [newCustomProcessName, setNewCustomProcessName] = useState("")
    const [newCustomProcessCost, setNewCustomProcessCost] = useState<number | "">("")
    const [isSavingCustom, setIsSavingCustom] = useState(false)

    // 日付フォーマット
    const formatDate = (iso: string): string => {
        const d = new Date(iso)
        return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`
    }

    // 工程の現在の原価を取得（カスタム値があれば優先、なければ標準原価）
    const getCost = (processId: string, defaultCost: number): number => {
        return localCosts[processId] ?? defaultCost
    }

    // 原価をローカル状態に更新
    const updateLocalCost = (processId: string, cost: number) => {
        setLocalCosts((prev) => ({ ...prev, [processId]: cost }))
    }

    // 保存処理
    const handleSaveCosts = async () => {
        if (!onSaveProcessCosts) return
        setIsSaving(true)
        try {
            await onSaveProcessCosts(localCosts)
            alert("原価設定を保存しました。")
        } catch (error) {
            alert("原価設定の保存に失敗しました。")
        } finally {
            setIsSaving(false)
        }
    }

    // カスタム工程の追加
    const handleAddCustomProcess = () => {
        if (!newCustomProcessName.trim() || newCustomProcessCost === "") return

        const newProcess: CustomProcess = {
            id: `custom_${Date.now()}`,
            name: newCustomProcessName.trim(),
            unitCost: Number(newCustomProcessCost),
            category: "detail", // デフォルトはディテーリング扱いとする（現状カテゴリによる挙動差分は少ないため）
        }

        setLocalCustomProcesses([...localCustomProcesses, newProcess])
        setNewCustomProcessName("")
        setNewCustomProcessCost("")
    }

    // カスタム工程の実質更新（インライン編集時）
    const updateCustomProcess = (id: string, updates: Partial<CustomProcess>) => {
        setLocalCustomProcesses(prev =>
            prev.map(p => p.id === id ? { ...p, ...updates } : p)
        )
    }

    // カスタム工程の削除
    const handleDeleteCustomProcess = (id: string) => {
        if (window.confirm("このオリジナル工程を削除しますか？")) {
            setLocalCustomProcesses(prev => prev.filter(p => p.id !== id))
        }
    }

    // カスタム工程の保存処理
    const handleSaveCustomProcessesToDb = async () => {
        if (!onSaveCustomProcesses) return
        setIsSavingCustom(true)
        try {
            await onSaveCustomProcesses(localCustomProcesses)
            alert("オリジナル工程を保存しました。")
        } catch (error) {
            alert("オリジナル工程の保存に失敗しました。")
        } finally {
            setIsSavingCustom(false)
        }
    }



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

                <Accordion type="multiple" defaultValue={["history"]} className="w-full">
                    {/* 過去の見積もり履歴 */}
                    <AccordionItem value="history" className="border-none">
                        <AccordionTrigger className="hover:no-underline py-2 text-left">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground m-0">
                                <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                見積もり履歴
                            </h3>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4">

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
                        </AccordionContent>
                    </AccordionItem>

                    <Separator className="bg-border/30 my-2" />

                    {/* カスタム原価設定 */}
                    <AccordionItem value="standard" className="border-none">
                        <AccordionTrigger className="hover:no-underline py-2 text-left">
                            <div className="flex w-full items-center gap-2">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground m-0 translate-y-[2px]">
                                    <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    標準工程・原価設定
                                </h3>
                                <div className="ml-auto text-[clamp(8px,2.5vw,10px)] text-muted-foreground pr-1 font-normal translate-y-[2px]">
                                    ※ここでの設定が標準になります
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4">

                            <Card className="border-border/50 bg-card/50">
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        {Object.entries(
                                            WASH_PROCESSES.reduce((acc, proc) => {
                                                if (!acc[proc.category]) acc[proc.category] = []
                                                acc[proc.category].push(proc)
                                                return acc
                                            }, {} as Record<string, typeof WASH_PROCESSES>)
                                        ).map(([category, processes]) => (
                                            <div key={category} className="mb-4 last:mb-0">
                                                <div className="mb-2 text-xs font-semibold text-muted-foreground">
                                                    {CATEGORY_LABELS[category] || category}
                                                </div>
                                                <div className="space-y-1.5">
                                                    {processes.map((proc) => {
                                                        const currentCost = getCost(proc.id, proc.unitCost)
                                                        const isCustom = localCosts[proc.id] !== undefined
                                                        const isEditing = editingCostId === proc.id

                                                        return (
                                                            <div
                                                                key={proc.id}
                                                                className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2"
                                                            >
                                                                <span className="text-sm text-foreground">
                                                                    {proc.name}
                                                                </span>
                                                                {isEditing ? (
                                                                    <input
                                                                        type="number"
                                                                        defaultValue={currentCost}
                                                                        autoFocus
                                                                        onBlur={(e) => {
                                                                            const val = Number(e.target.value)
                                                                            if (!isNaN(val) && val >= 0) {
                                                                                updateLocalCost(proc.id, val)
                                                                            }
                                                                            setEditingCostId(null)
                                                                        }}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === "Enter") {
                                                                                (e.target as HTMLInputElement).blur()
                                                                            }
                                                                        }}
                                                                        className="w-20 rounded border border-cyan-500/50 bg-background px-2 py-1 text-right text-[11px] tabular-nums text-foreground outline-none focus:ring-1 focus:ring-cyan-500/50"
                                                                        min={0}
                                                                        step={50}
                                                                    />
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setEditingCostId(proc.id)}
                                                                        className={`rounded px-1.5 py-0.5 text-sm tabular-nums transition-colors hover:bg-secondary/50 font-bold ${isCustom ? "text-cyan-400" : "text-muted-foreground"}`}
                                                                        title="タップで原価を編集"
                                                                    >
                                                                        ¥{currentCost.toLocaleString()}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {onSaveProcessCosts && (
                                        <Button
                                            onClick={handleSaveCosts}
                                            disabled={isSaving}
                                            className="mt-4 h-10 w-full bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white shadow-md shadow-cyan-500/20"
                                        >
                                            {isSaving ? "保存中..." : "原価設定を保存する"}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </AccordionContent>
                    </AccordionItem>

                    <Separator className="bg-border/30 my-2" />

                    {/* オリジナル工程追加UI */}
                    <AccordionItem value="custom" className="border-none">
                        <AccordionTrigger className="hover:no-underline py-2 text-left">
                            <div className="flex w-full items-center gap-2">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground m-0 translate-y-[2px]">
                                    <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    オリジナル工程・原価設定
                                </h3>
                                <div className="ml-auto text-[clamp(8px,2.5vw,10px)] text-muted-foreground pr-1 font-normal translate-y-[2px]">
                                    ※独自メニューを追加できます
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4">

                            <Card className="border-border/50 bg-card/50">
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        {/* 追加フォーム */}
                                        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-secondary/50 p-2 sm:flex-nowrap">
                                            <input
                                                type="text"
                                                placeholder="工程名 (例: ホイール清掃)"
                                                value={newCustomProcessName}
                                                onChange={(e) => setNewCustomProcessName(e.target.value)}
                                                className="h-9 min-w-0 flex-1 rounded border border-border/50 bg-background px-2 text-[12px] text-foreground outline-none focus:ring-1 focus:ring-cyan-500/50"
                                            />
                                            <div className="flex w-full items-center gap-2 sm:w-auto">
                                                <input
                                                    type="number"
                                                    placeholder="金額 (円)"
                                                    value={newCustomProcessCost}
                                                    onChange={(e) => setNewCustomProcessCost(e.target.value ? Number(e.target.value) : "")}
                                                    className="h-9 w-24 flex-1 rounded border border-border/50 bg-background px-2 text-right text-[12px] tabular-nums text-foreground outline-none focus:ring-1 focus:ring-cyan-500/50 sm:flex-none"
                                                    min={0}
                                                    step={50}
                                                />
                                                <Button
                                                    onClick={handleAddCustomProcess}
                                                    disabled={!newCustomProcessName.trim() || newCustomProcessCost === ""}
                                                    size="sm"
                                                    className="h-9 shrink-0 bg-cyan-600 px-3 text-xs text-white hover:bg-cyan-700"
                                                >
                                                    追加
                                                </Button>
                                            </div>
                                        </div>

                                        {/* リスト表示 */}
                                        <div className="mt-4 space-y-1.5">
                                            {localCustomProcesses.length === 0 ? (
                                                <div className="py-2 text-center text-xs text-muted-foreground">
                                                    オリジナル工程はまだありません
                                                </div>
                                            ) : (
                                                localCustomProcesses.map((proc) => {
                                                    const isEditing = editingCustomProcessId === proc.id
                                                    return (
                                                        <div
                                                            key={proc.id}
                                                            className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2"
                                                        >
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    defaultValue={proc.name}
                                                                    onBlur={(e) => {
                                                                        if (e.target.value.trim()) {
                                                                            updateCustomProcess(proc.id, { name: e.target.value.trim() })
                                                                        }
                                                                        setEditingCustomProcessId(null)
                                                                    }}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === "Enter") {
                                                                            (e.target as HTMLInputElement).blur()
                                                                        }
                                                                    }}
                                                                    className="flex-1 rounded border border-cyan-500/50 bg-background px-2 py-1 text-[12px] text-foreground outline-none"
                                                                    autoFocus
                                                                />
                                                            ) : (
                                                                <span
                                                                    onClick={() => setEditingCustomProcessId(proc.id)}
                                                                    className="text-sm font-medium text-foreground cursor-pointer hover:text-cyan-400 transition-colors"
                                                                    title="タップで名前を編集"
                                                                >
                                                                    {proc.name}
                                                                </span>
                                                            )}

                                                            <div className="flex items-center gap-2">
                                                                {isEditing ? (
                                                                    <input
                                                                        type="number"
                                                                        defaultValue={proc.unitCost}
                                                                        onBlur={(e) => {
                                                                            const val = Number(e.target.value)
                                                                            if (!isNaN(val) && val >= 0) {
                                                                                updateCustomProcess(proc.id, { unitCost: val })
                                                                            }
                                                                        }}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === "Enter") {
                                                                                (e.target as HTMLInputElement).blur()
                                                                            }
                                                                        }}
                                                                        className="w-20 rounded border border-cyan-500/50 bg-background px-2 py-1 text-right text-[11px] tabular-nums text-foreground outline-none"
                                                                        min={0}
                                                                        step={50}
                                                                    />
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setEditingCustomProcessId(proc.id)}
                                                                        className="rounded px-1.5 py-0.5 text-sm tabular-nums font-bold text-cyan-400 hover:bg-secondary/50 transition-colors"
                                                                        title="タップで金額を編集"
                                                                    >
                                                                        ¥{proc.unitCost.toLocaleString()}
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDeleteCustomProcess(proc.id)}
                                                                    className="ml-1 text-muted-foreground hover:text-red-500 transition-colors p-1"
                                                                    title="削除"
                                                                >
                                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            )}
                                        </div>
                                    </div>

                                    {onSaveCustomProcesses && (
                                        <Button
                                            onClick={handleSaveCustomProcessesToDb}
                                            disabled={isSavingCustom}
                                            className="mt-4 h-10 w-full bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white shadow-md shadow-cyan-500/20"
                                        >
                                            {isSavingCustom ? "保存中..." : "オリジナル工程を保存する"}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

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
