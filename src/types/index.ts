// 車両サイズ
export type VehicleSize = "SS" | "S" | "M" | "L" | "XL"

// 洗車工程の定義
export type WashProcess = {
    id: string
    name: string
    unitCost: number // ケミカル想定原価（円）
    category: ProcessCategory
}

// 工程カテゴリ
export type ProcessCategory = "wash" | "polish" | "coating" | "detail" | "interior"

// 見積もりフォームの状態
export type EstimateFormData = {
    vehicleSize: VehicleSize
    workHours: number
    workMinutes: number
    hourlyRate: number
    selectedProcessIds: string[]
    customCosts: Record<string, number> // 工程IDごとのカスタム原価
}

// 計算結果
export type CalculationResult = {
    chemicalCost: number    // ケミカル想定原価
    laborCost: number       // 労働対価
    totalPrice: number      // 最低提示価格
}

// 画面表示モード
export type ViewMode = "input" | "preview"
