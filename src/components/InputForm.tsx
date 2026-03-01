"use client"

import { useState, useMemo } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
    VEHICLE_SIZES,
    WASH_PROCESSES,
    CATEGORY_LABELS,
    CATEGORY_ICONS,
    SIZE_MULTIPLIERS,
} from "@/lib/constants"
import { calculateEstimate, calcPolishingCost, formatPrice } from "@/lib/calculator"
import { type EstimateFormData, type ProcessCategory } from "@/types"

type InputFormProps = {
    formData: EstimateFormData
    onFormDataChange: (data: EstimateFormData) => void
    onCreateQuote: () => void
}

export const InputForm = ({
    formData,
    onFormDataChange,
    onCreateQuote,
}: InputFormProps) => {
    // 工程カテゴリの開閉状態
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
        wash: true,
        polish: true,
        detail: true,
        coating: true,
        interior: true,
    })

    // 原価編集中の工程ID
    const [editingCostId, setEditingCostId] = useState<string | null>(null)

    // カテゴリごとに工程をグループ化
    const groupedProcesses = useMemo(() => {
        const groups: Record<string, typeof WASH_PROCESSES> = {}
        for (const process of WASH_PROCESSES) {
            if (!groups[process.category]) {
                groups[process.category] = []
            }
            groups[process.category].push(process)
        }
        return groups
    }, [])

    // 工程の現在の原価を取得（カスタム値があればそちらを優先）
    const getCost = (processId: string, defaultCost: number): number => {
        return formData.customCosts[processId] ?? defaultCost
    }

    // 原価を更新
    const updateCost = (processId: string, cost: number) => {
        onFormDataChange({
            ...formData,
            customCosts: { ...formData.customCosts, [processId]: cost },
        })
    }

    // 現在のサイズ倍率
    const currentMultiplier = SIZE_MULTIPLIERS[formData.vehicleSize]?.multiplier ?? 1.0

    // リアルタイム計算結果
    const calculation = useMemo(
        () =>
            calculateEstimate(
                formData.selectedProcessIds,
                formData.hourlyRate,
                formData.workHours,
                formData.workMinutes,
                formData.customCosts,
                formData.vehicleSize,
                formData.polishingPasses
            ),
        [formData]
    )

    // 現在の研磨単価（サイズ倍率適用済み）
    const polishingUnitCost = calcPolishingCost(1, formData.vehicleSize)

    // 工程の選択/解除
    const toggleProcess = (processId: string) => {
        const isSelected = formData.selectedProcessIds.includes(processId)
        const newIds = isSelected
            ? formData.selectedProcessIds.filter((id) => id !== processId)
            : [...formData.selectedProcessIds, processId]
        onFormDataChange({ ...formData, selectedProcessIds: newIds })
    }

    // カテゴリの開閉トグル
    const toggleCategory = (category: string) => {
        setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }))
    }

    // カテゴリ一括選択/解除
    const toggleCategoryAll = (category: string) => {
        const processIds = groupedProcesses[category]?.map((p) => p.id) ?? []
        const allSelected = processIds.every((id) =>
            formData.selectedProcessIds.includes(id)
        )
        const newIds = allSelected
            ? formData.selectedProcessIds.filter((id) => !processIds.includes(id))
            : [
                ...formData.selectedProcessIds,
                ...processIds.filter(
                    (id) => !formData.selectedProcessIds.includes(id)
                ),
            ]
        onFormDataChange({ ...formData, selectedProcessIds: newIds })
    }

    // 合計作業時間（分単位スライダー用）
    const totalMinutes = formData.workHours * 60 + formData.workMinutes

    return (
        <div className="min-h-screen bg-background pb-48">
            <div className="mx-auto max-w-lg space-y-4 px-4 pt-4">
                {/* 車両サイズ */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                車両サイズ
                            </Label>
                            <Badge
                                variant="secondary"
                                className={`text-[10px] ${currentMultiplier !== 1.0 ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "text-muted-foreground"}`}
                            >
                                原価倍率 ×{currentMultiplier}
                            </Badge>
                        </div>
                        <Select
                            value={formData.vehicleSize}
                            onValueChange={(value) =>
                                onFormDataChange({
                                    ...formData,
                                    vehicleSize: value as EstimateFormData["vehicleSize"],
                                })
                            }
                        >
                            <SelectTrigger className="h-12 border-border/50 bg-secondary/50 text-base">
                                <SelectValue placeholder="車両サイズを選択" />
                            </SelectTrigger>
                            <SelectContent>
                                {VEHICLE_SIZES.map((size) => (
                                    <SelectItem key={size.value} value={size.value}>
                                        <span className="font-bold">{size.label}</span>
                                        <span className="ml-2 text-muted-foreground">
                                            {size.description}
                                        </span>
                                        <span className="ml-2 text-[11px] text-cyan-400">
                                            ×{SIZE_MULTIPLIERS[size.value].multiplier}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {/* 体積目安 */}
                        <div className="mt-2 text-[10px] text-muted-foreground/60">
                            体積目安: {SIZE_MULTIPLIERS[formData.vehicleSize].volume}
                        </div>
                    </CardContent>
                </Card>

                {/* 作業時間 & 時給 */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="space-y-5 p-4">
                        {/* 想定作業時間 */}
                        <div>
                            <Label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                想定作業時間
                            </Label>
                            <div className="mb-3 text-center">
                                <span className="text-3xl font-bold tabular-nums text-foreground">
                                    {formData.workHours}
                                </span>
                                <span className="mx-1 text-lg text-muted-foreground">時間</span>
                                <span className="text-3xl font-bold tabular-nums text-foreground">
                                    {formData.workMinutes}
                                </span>
                                <span className="ml-1 text-lg text-muted-foreground">分</span>
                            </div>
                            <Slider
                                value={[totalMinutes]}
                                onValueChange={([value]) => {
                                    const hours = Math.floor(value / 60)
                                    const minutes = Math.round((value % 60) / 15) * 15
                                    onFormDataChange({
                                        ...formData,
                                        workHours: hours,
                                        workMinutes: minutes,
                                    })
                                }}
                                min={15}
                                max={480}
                                step={15}
                                className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:border-2 [&_[role=slider]]:border-cyan-500 [&_[role=slider]]:bg-background [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-cyan-500/30"
                            />
                            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                                <span>15分</span>
                                <span>8時間</span>
                            </div>
                        </div>

                        <Separator className="bg-border/30" />

                        {/* 希望時給 */}
                        <div>
                            <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                希望時給
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">
                                    ¥
                                </span>
                                <input
                                    type="number"
                                    value={formData.hourlyRate || ""}
                                    onChange={(e) =>
                                        onFormDataChange({
                                            ...formData,
                                            hourlyRate: Number(e.target.value) || 0,
                                        })
                                    }
                                    className="h-12 w-full rounded-md border border-border/50 bg-secondary/50 pl-8 pr-4 text-right text-xl font-bold tabular-nums text-foreground outline-none transition-colors focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
                                    placeholder="2000"
                                    min={0}
                                    step={100}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 研磨メニュー */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                ✨ 研磨メニュー
                            </Label>
                            {formData.polishingPasses > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="bg-cyan-500/10 text-[10px] text-cyan-400 border-cyan-500/20"
                                >
                                    {formatPrice(calcPolishingCost(formData.polishingPasses, formData.vehicleSize))}
                                </Badge>
                            )}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {[0, 1, 2, 3].map((passes) => (
                                <button
                                    key={passes}
                                    type="button"
                                    onClick={() =>
                                        onFormDataChange({ ...formData, polishingPasses: passes })
                                    }
                                    className={`rounded-lg border px-3 py-3 text-center transition-all ${formData.polishingPasses === passes
                                        ? "border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/30"
                                        : "border-border/50 bg-secondary/30 hover:bg-secondary/50"
                                        }`}
                                >
                                    <div className={`text-lg font-bold ${formData.polishingPasses === passes
                                        ? "text-cyan-400"
                                        : "text-muted-foreground"
                                        }`}>
                                        {passes === 0 ? "—" : `${passes}周`}
                                    </div>
                                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                                        {passes === 0
                                            ? "なし"
                                            : formatPrice(polishingUnitCost * passes)}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="mt-2 text-[10px] text-muted-foreground/60">
                            ※Mサイズ1周 ¥10,000基準 × サイズ倍率×{currentMultiplier}
                        </div>
                    </CardContent>
                </Card>

                {/* 洗車工程の選択 */}
                <div>
                    <div className="mb-2 flex items-center justify-between px-1">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            施工工程を選択
                        </Label>
                        <Badge
                            variant="secondary"
                            className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                        >
                            {formData.selectedProcessIds.length}工程 選択中
                        </Badge>
                    </div>

                    <div className="space-y-2">
                        {Object.entries(groupedProcesses).map(
                            ([category, processes]) => {
                                const isOpen = openCategories[category]
                                const selectedCount = processes.filter((p) =>
                                    formData.selectedProcessIds.includes(p.id)
                                ).length
                                const allSelected = selectedCount === processes.length

                                return (
                                    <Card
                                        key={category}
                                        className="border-border/50 bg-card/50 overflow-hidden backdrop-blur-sm"
                                    >
                                        {/* カテゴリヘッダー */}
                                        <button
                                            type="button"
                                            onClick={() => toggleCategory(category)}
                                            className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-secondary/50"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-base">
                                                    {CATEGORY_ICONS[category]}
                                                </span>
                                                <span className="text-sm font-semibold text-foreground">
                                                    {CATEGORY_LABELS[category]}
                                                </span>
                                                {selectedCount > 0 && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="h-5 bg-cyan-500/15 px-1.5 text-[10px] text-cyan-400"
                                                    >
                                                        {selectedCount}
                                                    </Badge>
                                                )}
                                            </div>
                                            <svg
                                                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                                                    }`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </button>

                                        {/* 工程リスト */}
                                        {isOpen && (
                                            <div className="border-t border-border/30">
                                                {/* 一括選択 */}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleCategoryAll(category)}
                                                    className="w-full px-3 py-1.5 text-left text-[11px] font-medium text-cyan-400 transition-colors hover:bg-cyan-500/5"
                                                >
                                                    {allSelected
                                                        ? "すべて解除"
                                                        : "すべて選択"}
                                                </button>
                                                <div className="px-3 pb-2">
                                                    {processes.map((process) => {
                                                        const isSelected =
                                                            formData.selectedProcessIds.includes(process.id)
                                                        const currentCost = getCost(process.id, process.unitCost)
                                                        const isEditing = editingCostId === process.id
                                                        const isCustom = formData.customCosts[process.id] !== undefined
                                                        return (
                                                            <div
                                                                key={process.id}
                                                                className={`flex items-center gap-3 rounded-lg px-2 py-2.5 transition-all ${isSelected
                                                                    ? "bg-cyan-500/10"
                                                                    : "hover:bg-secondary/50"
                                                                    }`}
                                                            >
                                                                <label className="flex flex-1 cursor-pointer items-center gap-3">
                                                                    <Checkbox
                                                                        checked={isSelected}
                                                                        onCheckedChange={() =>
                                                                            toggleProcess(process.id)
                                                                        }
                                                                        className="border-border/70 data-[state=checked]:border-cyan-500 data-[state=checked]:bg-cyan-500"
                                                                    />
                                                                    <span
                                                                        className={`flex-1 text-sm ${isSelected
                                                                            ? "font-medium text-foreground"
                                                                            : "text-muted-foreground"
                                                                            }`}
                                                                    >
                                                                        {process.name}
                                                                    </span>
                                                                </label>
                                                                {/* 原価インライン編集 */}
                                                                {isEditing ? (
                                                                    <input
                                                                        type="number"
                                                                        defaultValue={currentCost}
                                                                        autoFocus
                                                                        onBlur={(e) => {
                                                                            const val = Number(e.target.value)
                                                                            if (!isNaN(val) && val >= 0) {
                                                                                updateCost(process.id, val)
                                                                            }
                                                                            setEditingCostId(null)
                                                                        }}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === "Enter") {
                                                                                (e.target as HTMLInputElement).blur()
                                                                            }
                                                                        }}
                                                                        className="w-20 rounded border border-cyan-500/50 bg-secondary px-2 py-1 text-right text-[11px] tabular-nums text-foreground outline-none focus:ring-1 focus:ring-cyan-500/50"
                                                                        min={0}
                                                                        step={50}
                                                                    />
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setEditingCostId(process.id)}
                                                                        className={`rounded px-1.5 py-0.5 text-[11px] tabular-nums transition-colors hover:bg-secondary ${isCustom ? "text-cyan-400" : "text-muted-foreground/60"}`}
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
                                        )}
                                    </Card>
                                )
                            }
                        )}
                    </div>
                </div>

                {/* 公開設定 */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="flex items-center justify-between p-4 px-5">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-semibold text-foreground">
                                タイムラインに公開
                            </Label>
                            <div className="text-[10px] text-muted-foreground">
                                この見積もりを「みんなの見積」にシェアします
                            </div>
                        </div>
                        <Switch
                            checked={formData.isPublic}
                            onCheckedChange={(checked) =>
                                onFormDataChange({ ...formData, isPublic: checked })
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            {/* フッター（計算結果 + ボタン） */}
            <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border/50 bg-background/90 pb-safe backdrop-blur-xl">
                <div className="mx-auto max-w-lg px-4 py-3">
                    {/* 計算結果 */}
                    <div className="mb-3 grid grid-cols-4 gap-1.5">
                        <div className="rounded-lg bg-secondary/50 p-1.5 text-center">
                            <div className="text-[9px] text-muted-foreground">
                                ケミカル
                            </div>
                            <div className="text-xs font-bold tabular-nums text-foreground">
                                {formatPrice(calculation.chemicalCost)}
                            </div>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-1.5 text-center">
                            <div className="text-[9px] text-muted-foreground">研磨</div>
                            <div className="text-xs font-bold tabular-nums text-foreground">
                                {formatPrice(calculation.polishingCost)}
                            </div>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-1.5 text-center">
                            <div className="text-[9px] text-muted-foreground">労働対価</div>
                            <div className="text-xs font-bold tabular-nums text-foreground">
                                {formatPrice(calculation.laborCost)}
                            </div>
                        </div>
                        <div className="rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-600/20 p-1.5 text-center ring-1 ring-cyan-500/30">
                            <div className="text-[9px] text-cyan-400">最低提示価格</div>
                            <div className="text-xs font-bold tabular-nums text-cyan-300">
                                {formatPrice(calculation.totalPrice)}
                            </div>
                        </div>
                    </div>

                    {/* ボタン */}
                    <Button
                        onClick={onCreateQuote}
                        disabled={formData.selectedProcessIds.length === 0 && formData.polishingPasses === 0}
                        className="h-12 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-base font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 disabled:opacity-50"
                    >
                        この内容で見積書を作成する
                    </Button>
                </div>
            </div>
        </div>
    )
}
