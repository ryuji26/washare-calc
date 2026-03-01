import { WASH_PROCESSES } from "@/lib/constants"
import { type CalculationResult } from "@/types"

/**
 * 選択された工程のケミカル想定原価を合計する
 * customCostsに値があればそちらを優先
 */
export const calcChemicalCost = (
    selectedProcessIds: string[],
    customCosts: Record<string, number> = {}
): number => {
    return selectedProcessIds.reduce((total, id) => {
        const process = WASH_PROCESSES.find((p) => p.id === id)
        const cost = customCosts[id] ?? process?.unitCost ?? 0
        return total + cost
    }, 0)
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
    customCosts: Record<string, number> = {}
): CalculationResult => {
    const chemicalCost = calcChemicalCost(selectedProcessIds, customCosts)
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
