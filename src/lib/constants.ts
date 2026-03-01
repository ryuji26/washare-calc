import { type VehicleSize, type WashProcess } from "@/types"

// 車両サイズ選択肢
export const VEHICLE_SIZES: { value: VehicleSize; label: string; description: string }[] = [
    { value: "SS", label: "SS", description: "軽自動車" },
    { value: "S", label: "S", description: "コンパクトカー" },
    { value: "M", label: "M", description: "セダン・ワゴン" },
    { value: "L", label: "L", description: "SUV・ミニバン" },
    { value: "LL", label: "LL", description: "大型ミニバン" },
    { value: "XL", label: "XL", description: "大型SUV・フルサイズ" },
]

// 車両サイズ倍率（M=1.0を基準）
export const SIZE_MULTIPLIERS: Record<VehicleSize, { volume: string; multiplier: number }> = {
    SS: { volume: "8.4㎥ 以下", multiplier: 0.8 },
    S: { volume: "8.5 ～ 10.4㎥", multiplier: 0.9 },
    M: { volume: "10.5 ～ 12.1㎥", multiplier: 1.0 },
    L: { volume: "12.2 ～ 13.9㎥", multiplier: 1.15 },
    LL: { volume: "14.0 ～ 17.9㎥", multiplier: 1.3 },
    XL: { volume: "18.0㎥ 以上", multiplier: 1.5 },
}

// 洗車工程データ（各工程にケミカル想定原価を設定）
export const WASH_PROCESSES: WashProcess[] = [
    // 洗車系
    { id: "pre-wash", name: "プレウォッシュ", unitCost: 300, category: "wash" },
    { id: "hand-wash", name: "ボディ手洗い", unitCost: 200, category: "wash" },
    { id: "3ph-wash", name: "3pH洗車", unitCost: 500, category: "wash" },
    { id: "tire-wheel", name: "タイヤ・ホイール洗浄", unitCost: 400, category: "wash" },
    // 研磨・除去系
    { id: "body-waterstain", name: "ボディ水垢除去", unitCost: 600, category: "polish" },
    { id: "detail-waterstain", name: "細部水垢除去", unitCost: 400, category: "polish" },
    { id: "oil-remove", name: "油分除去", unitCost: 500, category: "polish" },
    { id: "iron-chemical", name: "鉄粉除去(溶剤)", unitCost: 800, category: "polish" },
    { id: "iron-clay", name: "鉄粉除去(粘土)", unitCost: 300, category: "polish" },
    // ガラス系
    { id: "glass-oil", name: "窓油膜取り", unitCost: 500, category: "detail" },
    { id: "glass-scale", name: "窓ウロコ取り", unitCost: 700, category: "detail" },
    // ディテーリング
    { id: "door-hinge", name: "ドアヒンジ洗浄", unitCost: 200, category: "detail" },
    { id: "hood-inner", name: "ボンネット内側洗浄", unitCost: 300, category: "detail" },
    { id: "trunk-inner", name: "トランク内側洗浄", unitCost: 300, category: "detail" },
    // コーティング系
    { id: "wax-finish", name: "WAX仕上げ", unitCost: 1000, category: "coating" },
    { id: "simple-coating", name: "簡易コーティング", unitCost: 1500, category: "coating" },
    { id: "hard-coating", name: "硬化型コーティング", unitCost: 3000, category: "coating" },
    { id: "glass-coating-all", name: "窓ガラスコーティング(全面)", unitCost: 2000, category: "coating" },
    { id: "glass-coating-front", name: "窓ガラスコーティング(フロントのみ)", unitCost: 1000, category: "coating" },
    { id: "wheel-coating", name: "ホイールコーティング", unitCost: 1500, category: "coating" },
    { id: "tire-house", name: "タイヤハウスクリーニング", unitCost: 400, category: "detail" },
    // 内装系
    { id: "inner-glass", name: "内窓拭き", unitCost: 200, category: "interior" },
]

// カテゴリ表示名
export const CATEGORY_LABELS: Record<string, string> = {
    wash: "洗車",
    polish: "研磨・除去",
    detail: "ディテーリング",
    coating: "コーティング",
    interior: "内装",
}

// カテゴリアイコン（Emoji）
export const CATEGORY_ICONS: Record<string, string> = {
    wash: "🧽",
    polish: "✨",
    detail: "🔍",
    coating: "🛡️",
    interior: "🪟",
}

// デフォルトフォーム値
// 研磨ベース単価（Mサイズ1周あたり）
export const POLISHING_BASE_COST = 10000

export const DEFAULT_FORM_DATA = {
    vehicleSize: "M" as VehicleSize,
    workHours: 2,
    workMinutes: 0,
    hourlyRate: 2000,
    selectedProcessIds: [] as string[],
    customCosts: {} as Record<string, number>,
    polishingPasses: 0,
    isPublic: false,
}
