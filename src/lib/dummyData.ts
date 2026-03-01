import { type PublicEstimate } from "@/types"

export const DUMMY_PUBLIC_ESTIMATES: PublicEstimate[] = [
    {
        id: "est_001",
        authorName: "洗車マニア佐藤",
        authorArea: "東京都",
        vehicleSize: "L",
        totalPrice: 45000,
        processNames: ["プレウォッシュ", "3pH洗車", "鉄粉除去(粘土)", "ボディ水垢除去", "硬化型コーティング"],
        polishingPasses: 1,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2時間前
    },
    {
        id: "est_002",
        authorName: "KeePer Pro",
        authorArea: "神奈川県",
        vehicleSize: "M",
        totalPrice: 28000,
        processNames: ["ボディ手洗い", "簡易コーティング", "タイヤ・ホイール洗浄", "内窓拭き"],
        polishingPasses: 0,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1日前
    },
    {
        id: "est_003",
        authorName: "Detailing Ninja",
        authorArea: "福岡県",
        vehicleSize: "XL",
        totalPrice: 85000,
        processNames: ["プレウォッシュ", "3pH洗車", "油分除去", "ドアヒンジ洗浄", "硬化型コーティング"],
        polishingPasses: 3,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2日前
    },
    {
        id: "est_004",
        authorName: "週末洗車おじさん",
        authorArea: "埼玉県",
        vehicleSize: "S",
        totalPrice: 15000,
        processNames: ["ボディ手洗い", "簡易コーティング", "タイヤ・ホイール洗浄", "窓油膜取り"],
        polishingPasses: 0,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3日前
    }
]

export const DUMMY_PUBLIC_ESTIMATE_FORMS: Record<string, any> = {
    est_001: {
        vehicleSize: "L",
        workHours: 5,
        workMinutes: 0,
        hourlyRate: 3000,
        selectedProcessIds: ["pre-wash", "3ph-wash", "iron-clay", "water-spot-body", "coating-hard"],
        customCosts: {},
        polishingPasses: 1,
        isPublic: true,
    },
    est_002: {
        vehicleSize: "M",
        workHours: 2,
        workMinutes: 30,
        hourlyRate: 2000,
        selectedProcessIds: ["hand-wash", "coating-easy", "wheel", "interior-window"],
        customCosts: {},
        polishingPasses: 0,
        isPublic: true,
    },
    est_003: {
        vehicleSize: "XL",
        workHours: 8,
        workMinutes: 0,
        hourlyRate: 4000,
        selectedProcessIds: ["pre-wash", "3ph-wash", "degreasing", "door-hinge", "coating-hard"],
        customCosts: {},
        polishingPasses: 3,
        isPublic: true,
    },
    est_004: {
        vehicleSize: "S",
        workHours: 1,
        workMinutes: 30,
        hourlyRate: 1500,
        selectedProcessIds: ["hand-wash", "coating-easy", "wheel", "window-oil"],
        customCosts: {},
        polishingPasses: 0,
        isPublic: true,
    }
}
