import { createClient } from "@/utils/supabase/client"
import { type User, type SavedEstimate, type EstimateFormData, type PublicEstimate, type CustomProcess } from "@/types"
import { WASH_PROCESSES, VEHICLE_SIZES } from "@/lib/constants"
import { calculateEstimate } from "@/lib/calculator"

const supabase = createClient()

// ---------------------------------------------------------
// Profile (User) API
// ---------------------------------------------------------

export const fetchUserProfile = async (userId: string): Promise<User | null> => {
    // Authからメールアドレスも取得したい場合は Session 等から補完するか、引数で渡すか。
    // 今回は profiles テーブルを中心に取得。
    const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

    if (error && error.code !== 'PGRST116') {
        // PGRST116 = 0 rows (新規登録直後などまだ無い状態)
        console.error("fetchUserProfile Error:", error)
    }

    if (!profile) return null

    // auth.users から email は取れないので、呼び出し元(page.tsx)の session から注入する想定
    return {
        id: profile.id,
        email: "", // 呼び出し元で上書き
        displayName: profile.display_name,
        area: profile.area,
        createdAt: profile.created_at,
        defaultProcessCosts: profile.default_process_costs || {},
        customProcesses: profile.custom_processes || [],
    }
}

export const updateUserProfile = async (
    userId: string,
    displayName: string,
    area: string
): Promise<void> => {
    const { error } = await supabase
        .from("profiles")
        .upsert({
            id: userId,
            display_name: displayName,
            area: area,
        })

    if (error) {
        console.error("updateUserProfile Error:", error)
        throw error
    }
}

export const updateUserProcessCosts = async (
    userId: string,
    costs: Record<string, number>
): Promise<void> => {
    const { error } = await supabase
        .from("profiles")
        .update({
            default_process_costs: costs
        })
        .eq("id", userId)

    if (error) {
        console.error("updateUserProcessCosts Error:", error)
        throw error
    }
}

export const updateUserCustomProcesses = async (
    userId: string,
    processes: CustomProcess[]
): Promise<void> => {
    const { error } = await supabase
        .from("profiles")
        .update({
            custom_processes: processes
        })
        .eq("id", userId)

    if (error) {
        console.error("updateUserCustomProcesses Error:", error)
        throw error
    }
}


// ---------------------------------------------------------
// Estimates API
// ---------------------------------------------------------

export const fetchUserEstimates = async (userId: string): Promise<SavedEstimate[]> => {
    const { data, error } = await supabase
        .from("estimates")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

    if (error || !data) {
        console.error("fetchUserEstimates Error:", error)
        return []
    }

    return data.map((row) => ({
        id: row.id,
        formData: row.form_data as EstimateFormData,
        totalPrice: row.total_price,
        processNames: row.process_names,
        vehicleSizeLabel:
            VEHICLE_SIZES.find((s) => s.value === row.vehicle_size)?.description ?? row.vehicle_size,
        createdAt: row.created_at,
    }))
}

export const fetchPublicEstimates = async (): Promise<PublicEstimate[]> => {
    // publicな見積もりと、作成者の情報をJOINして取得
    const { data, error } = await supabase
        .from("estimates")
        .select(`
            id,
            total_price,
            process_names,
            polishing_passes,
            vehicle_size,
            created_at,
            form_data,
            profiles (
                display_name,
                area
            )
        `)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(50)

    if (error || !data) {
        console.error("fetchPublicEstimates Error:", error)
        return []
    }

    return data.map((row: any) => ({
        id: row.id,
        authorName: row.profiles?.display_name ?? "名無し",
        authorArea: row.profiles?.area ?? "未設定",
        vehicleSize: row.vehicle_size,
        totalPrice: row.total_price,
        processNames: row.process_names,
        polishing_passes: row.polishing_passes, // DBのsnake_case名
        polishingPasses: row.polishing_passes,  // キャメルケース用
        createdAt: row.created_at,
        // formData: row.form_data, // public feed 用のダミー変換ロジック側で必要なら追加
    }))
}

export const fetchEstimateFormData = async (estimateId: string): Promise<EstimateFormData | null> => {
    const { data, error } = await supabase
        .from("estimates")
        .select("form_data")
        .eq("id", estimateId)
        .single()

    if (error || !data) return null
    return data.form_data as EstimateFormData
}

export const saveEstimateToDb = async (
    userId: string,
    formData: EstimateFormData,
    userCustomProcesses: CustomProcess[] = []
): Promise<SavedEstimate | null> => {
    const calc = calculateEstimate(
        formData.selectedProcessIds,
        formData.hourlyRate,
        formData.workHours,
        formData.workMinutes,
        formData.customCosts,
        formData.vehicleSize,
        formData.polishingPasses,
        userCustomProcesses
    )

    const processNames = formData.selectedProcessIds
        .map((id) => {
            const standard = WASH_PROCESSES.find((p) => p.id === id)
            if (standard) return standard.name
            const custom = userCustomProcesses.find((p) => p.id === id)
            if (custom) return custom.name
            return null
        })
        .filter((name): name is string => !!name)

    const vehicleSizeLabel =
        VEHICLE_SIZES.find((s) => s.value === formData.vehicleSize)?.description ??
        formData.vehicleSize

    const { data, error } = await supabase
        .from("estimates")
        .insert({
            user_id: userId,
            vehicle_size: formData.vehicleSize,
            total_price: calc.totalPrice,
            process_names: processNames,
            polishing_passes: formData.polishingPasses,
            form_data: formData,
            is_public: formData.isPublic,
        })
        .select()
        .single()

    if (error || !data) {
        console.error("saveEstimateToDb Error:", error)
        return null
    }

    return {
        id: data.id,
        formData: data.form_data as EstimateFormData,
        totalPrice: data.total_price,
        processNames: data.process_names,
        vehicleSizeLabel,
        createdAt: data.created_at,
    }
}

export const deleteEstimate = async (estimateId: string, userId: string): Promise<boolean> => {
    const { error } = await supabase
        .from("estimates")
        .delete()
        .eq("id", estimateId)
        .eq("user_id", userId)

    if (error) {
        console.error("deleteEstimate Error:", error)
        return false
    }
    return true
}
