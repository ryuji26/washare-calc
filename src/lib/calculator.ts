import { WASH_PROCESSES, SIZE_MULTIPLIERS } from "@/lib/constants"
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
    laborCost: number
): number => {
    return chemicalCost + laborCost
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
    vehicleSize: VehicleSize = "M"
): CalculationResult => {
    const chemicalCost = calcChemicalCost(selectedProcessIds, vehicleSize, customCosts)
    const laborCost = calcLaborCost(hourlyRate, hours, minutes)
    const totalPrice = calcTotalPrice(chemicalCost, laborCost)

    return { chemicalCost, laborCost, totalPrice }
}

/**
 * 金額をフォーマットする（例: ¥12,000）
 */
export const formatPrice = (price: number): string => {
    return `¥${price.toLocaleString()}`
}
