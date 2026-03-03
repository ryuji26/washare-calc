// 車両サイズ
export type VehicleSize = "SS" | "S" | "M" | "L" | "LL" | "XL"

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
    polishingPasses: number // 研磨周回数（0〜3）
    isPublic: boolean // 公開タイムラインにシェアするか
}

// 計算結果
export type CalculationResult = {
    chemicalCost: number    // ケミカル想定原価
    polishingCost: number   // 研磨コスト
    laborCost: number       // 労働対価
    totalPrice: number      // 最低提示価格
}

// 画面表示モード
export type ViewMode = "input" | "preview" | "mypage" | "explore"

// タブバーのタブID
export type TabId = "input" | "explore" | "mypage"

// 認証モーダルの状態
export type AuthModalMode = "login" | "register" | null

export type CustomProcess = {
    id: string
    name: string
    unitCost: number
    category: ProcessCategory
}

// ユーザー情報
export type User = {
    id: string
    email: string
    displayName: string // 屋号またはニックネーム
    area: string        // 活動エリア（都道府県）
    createdAt: string
    defaultProcessCosts?: Record<string, number> // ユーザー定義のデフォルト原価設定
    customProcesses?: CustomProcess[] // オリジナル工程
}

// 保存された見積もり
export type SavedEstimate = {
    id: string
    formData: EstimateFormData
    totalPrice: number
    processNames: string[]
    vehicleSizeLabel: string
    createdAt: string
}

// 公開見積もり（フィード用）
export type PublicEstimate = {
    id: string
    authorName: string
    authorArea: string
    vehicleSize: VehicleSize
    totalPrice: number
    processNames: string[]
    polishingPasses: number
    createdAt: string
}
