import { WASH_PROCESSES, SIZE_MULTIPLIERS, POLISHING_BASE_COST } from "@/lib/constants"
import { type CalculationResult, type VehicleSize } from "@/types"

/**
 * 選択された工程のケミカル想定原価を合計する
 * customCostsに値があればそちらを優先
 * 車両サイズ倍率を適用（M=1.0基準）
 */
export const calcChemicalCost = (
    selectedProcessIds: string[],
    vehicleSize: VehicleSize = "M",
    customCosts: Record<string, number> = {}
): number => {
    const multiplier = SIZE_MULTIPLIERS[vehicleSize]?.multiplier ?? 1.0
    const baseCost = selectedProcessIds.reduce((total, id) => {
        const process = WASH_PROCESSES.find((p) => p.id === id)
        const cost = customCosts[id] ?? process?.unitCost ?? 0
        return total + cost
    }, 0)
    return Math.round(baseCost * multiplier)
}

/**
 * 研磨コストを計算する（ベース単価 × 周回数 × サイズ倍率）
 */
export const calcPolishingCost = (
    passes: number,
    vehicleSize: VehicleSize = "M"
): number => {
    if (passes <= 0) return 0
    const multiplier = SIZE_MULTIPLIERS[vehicleSize]?.multiplier ?? 1.0
    return Math.round(POLISHING_BASE_COST * passes * multiplier)
}

/**
 * 労働対価を計算する（時給 × 時間）
 */
export const calcLaborCost = (
    hourlyRate: number,
    hours: number,
    minutes: number
): number => {
    const totalHours = hours + minutes / 60
    return Math.round(hourlyRate * totalHours)
}

/**
 * 最低提示価格（合計）を計算する
 */
export const calcTotalPrice = (
    chemicalCost: number,
    polishingCost: number,
    laborCost: number
): number => {
    return chemicalCost + polishingCost + laborCost
}

/**
 * すべての計算結果をまとめて返す
 */
export const calculateEstimate = (
    selectedProcessIds: string[],
    hourlyRate: number,
    hours: number,
    minutes: number,
    customCosts: Record<string, number> = {},
    vehicleSize: VehicleSize = "M",
    polishingPasses: number = 0
): CalculationResult => {
    const chemicalCost = calcChemicalCost(selectedProcessIds, vehicleSize, customCosts)
    const polishingCost = calcPolishingCost(polishingPasses, vehicleSize)
    const laborCost = calcLaborCost(hourlyRate, hours, minutes)
    const totalPrice = calcTotalPrice(chemicalCost, polishingCost, laborCost)

    return { chemicalCost, polishingCost, laborCost, totalPrice }
}

/**
 * 金額をフォーマットする（例: ¥12,000）
 */
export const formatPrice = (price: number): string => {
    return `¥${price.toLocaleString()}`
}
