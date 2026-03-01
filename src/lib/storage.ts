import { type User, type SavedEstimate, type EstimateFormData } from "@/types"
import { WASH_PROCESSES, VEHICLE_SIZES } from "@/lib/constants"
import { calculateEstimate } from "@/lib/calculator"

const STORAGE_KEYS = {
    user: "washare-calc-user",
    estimates: "washare-calc-estimates",
} as const

// ユーザー情報の保存
export const saveUser = (user: User): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
}

// ユーザー情報の読込
export const loadUser = (): User | null => {
    if (typeof window === "undefined") return null
    const data = localStorage.getItem(STORAGE_KEYS.user)
    if (!data) return null
    try {
        return JSON.parse(data) as User
    } catch {
        return null
    }
}

// ユーザー情報の削除（ログアウト）
export const removeUser = (): void => {
    if (typeof window === "undefined") return
    localStorage.removeItem(STORAGE_KEYS.user)
}

// 見積もり履歴の読込
export const loadEstimates = (): SavedEstimate[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.estimates)
    if (!data) return []
    try {
        return JSON.parse(data) as SavedEstimate[]
    } catch {
        return []
    }
}

// 見積もりの保存
export const saveEstimate = (formData: EstimateFormData): SavedEstimate => {
    const calc = calculateEstimate(
        formData.selectedProcessIds,
        formData.hourlyRate,
        formData.workHours,
        formData.workMinutes,
        formData.customCosts,
        formData.vehicleSize,
        formData.polishingPasses
    )

    const processNames = formData.selectedProcessIds
        .map((id) => WASH_PROCESSES.find((p) => p.id === id)?.name)
        .filter((name): name is string => !!name)

    const vehicleSizeLabel =
        VEHICLE_SIZES.find((s) => s.value === formData.vehicleSize)?.description ??
        formData.vehicleSize

    const estimate: SavedEstimate = {
        id: crypto.randomUUID(),
        formData,
        totalPrice: calc.totalPrice,
        processNames,
        vehicleSizeLabel,
        createdAt: new Date().toISOString(),
    }

    const existing = loadEstimates()
    const updated = [estimate, ...existing]
    localStorage.setItem(STORAGE_KEYS.estimates, JSON.stringify(updated))

    return estimate
}

// ユニークID生成（簡易）
export const generateUserId = (): string => {
    return crypto.randomUUID()
}
