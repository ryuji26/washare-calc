"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/Header"
import { AuthModal } from "@/components/AuthModal"
import { InputForm } from "@/components/InputForm"
import { QuotePreview } from "@/components/QuotePreview"
import { MyPage } from "@/components/MyPage"
import { BottomTabBar } from "@/components/BottomTabBar"
import { ExploreFeed } from "@/components/ExploreFeed"
import { DEFAULT_FORM_DATA } from "@/lib/constants"
import { createClient } from "@/utils/supabase/client"
import {
  fetchUserProfile,
  updateUserProfile,
  fetchUserEstimates,
  fetchPublicEstimates,
  saveEstimateToDb,
  fetchEstimateFormData,
  deleteEstimate,
} from "@/lib/storage"
import {
  type EstimateFormData,
  type ViewMode,
  type AuthModalMode,
  type User,
  type SavedEstimate,
  type TabId,
  type PublicEstimate,
} from "@/types"

const Page = () => {
  // 画面モード・タブ管理
  const [viewMode, setViewMode] = useState<ViewMode>("input")
  const [activeTab, setActiveTab] = useState<TabId>("input")

  // 認証・ユーザー状態
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>(null)
  const [user, setUser] = useState<User | null>(null)

  // データ状態
  const [estimates, setEstimates] = useState<SavedEstimate[]>([])
  const [publicEstimates, setPublicEstimates] = useState<PublicEstimate[]>([])

  // フォームデータ
  const [formData, setFormData] = useState<EstimateFormData>({
    ...DEFAULT_FORM_DATA,
  })

  // トースト表示
  const [showSavedToast, setShowSavedToast] = useState(false)

  // 初回マウント時: セッション監視と初期データロード
  useEffect(() => {
    // みんなの見積もりは初期ロード
    fetchPublicEstimates().then(setPublicEstimates)

    // Supabase Auth の状態監視
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          let profile = await fetchUserProfile(session.user.id)

          // プロファイルが無い(OAuthでの初回ログイン等)場合は自動生成する
          if (!profile) {
            const defaultName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || "ゲスト (Google連携)"
            const defaultArea = "未設定"

            try {
              await updateUserProfile(session.user.id, defaultName, defaultArea)
              profile = {
                id: session.user.id,
                email: session.user.email ?? "",
                displayName: defaultName,
                area: defaultArea,
                createdAt: new Date().toISOString()
              }
            } catch (e) {
              console.error("Auto profile creation failed:", e)
            }
          }

          if (profile) {
            setUser({ ...profile, email: session.user.email ?? "" })
            const userEsts = await fetchUserEstimates(session.user.id)
            setEstimates(userEsts)
          } else {
            setUser(null)
            setEstimates([])
          }
        } else {
          setUser(null)
          setEstimates([])
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // タブの切り替えハンドラ
  const handleTabChange = useCallback((tabId: TabId) => {
    if (tabId === "mypage" && !user) {
      setAuthModalMode("login")
      return
    }
    // タブ切替時に最新データをフェッチ
    if (tabId === "explore") {
      fetchPublicEstimates().then(setPublicEstimates)
    }
    if (tabId === "mypage" && user) {
      fetchUserEstimates(user.id).then(setEstimates)
    }

    setActiveTab(tabId)
    setViewMode(tabId)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [user])

  // ホーム（入力画面）に戻る
  const handleNavigateHome = useCallback(() => {
    handleTabChange("input")
  }, [handleTabChange])

  // 見積書作成（プレビュー画面へ遷移）
  const handleCreateQuote = useCallback(() => {
    setViewMode("preview")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  // 入力画面に戻る（プレビューから等）
  const handleBack = useCallback(() => {
    setViewMode(activeTab) // 直前のタブに戻る
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [activeTab])



  // ログアウト
  const handleLogout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setEstimates([])
    handleTabChange("input")

    // Safari等でSSRセッションCookieが正しくクリアされたことをブラウザに反映させるため
    // 強制的にフルリロードを行います
    window.location.reload()
  }, [handleTabChange])

  // 見積もり保存
  const handleSaveEstimate = useCallback(async (overrideUser?: any) => {
    // onClick等からEventオブジェクトが渡された場合は無視する
    const isUserObject = overrideUser && typeof overrideUser === "object" && !("nativeEvent" in overrideUser) && !("preventDefault" in overrideUser);
    const targetUser = isUserObject ? (overrideUser as User) : user;

    if (!targetUser) {
      setAuthModalMode("register")
      return
    }
    const saved = await saveEstimateToDb(targetUser.id, formData)
    if (saved) {
      const userEsts = await fetchUserEstimates(targetUser.id)
      setEstimates(userEsts)
      setShowSavedToast(true)
      setTimeout(() => setShowSavedToast(false), 2500)
    } else {
      alert("見積もりの保存に失敗しました。")
    }
  }, [formData, user])

  // ログイン成功 (AuthModalからコールバック)
  const handleLogin = useCallback((loggedInUser: User) => {
    setUser(loggedInUser)
    setAuthModalMode(null)

    if (viewMode === "preview") {
      handleSaveEstimate(loggedInUser)
    }
  }, [viewMode, handleSaveEstimate])

  // 履歴から見積もりを再表示 (MyPage用)
  const handleViewEstimate = useCallback((savedFormData: EstimateFormData) => {
    setFormData(savedFormData)
    setViewMode("preview")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  // 見積もりの削除
  const handleDeleteEstimate = useCallback(async (estimateId: string) => {
    if (!user) return
    const confirmed = window.confirm("この見積もりを削除してもよろしいですか？")
    if (!confirmed) return

    const success = await deleteEstimate(estimateId, user.id)
    if (success) {
      setEstimates((prev) => prev.filter((est) => est.id !== estimateId))
    } else {
      alert("見積もりの削除に失敗しました。")
    }
  }, [user])

  // みんなの見積フィードからプレビューを表示
  const handleViewPublicEstimate = useCallback(async (estimateId: string) => {
    const fd = await fetchEstimateFormData(estimateId)
    if (fd) {
      setFormData(fd)
      setViewMode("preview")
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      alert("見積もりデータの取得に失敗しました。")
    }
  }, [])

  return (
    <main className="relative min-h-screen">
      {/* 共通ヘッダー（プレビュー画面では非表示） */}
      {viewMode !== "preview" && (
        <Header
          user={user}
          onOpenAuth={setAuthModalMode}
          onNavigateMyPage={() => handleTabChange("mypage")}
          onNavigateHome={handleNavigateHome}
          onLogout={handleLogout}
        />
      )}

      {/* 認証モーダル */}
      <AuthModal
        mode={authModalMode}
        onClose={() => setAuthModalMode(null)}
        onLogin={handleLogin}
      />

      {/* 画面切り替え */}
      {viewMode === "input" && (
        <InputForm
          formData={formData}
          onFormDataChange={setFormData}
          onCreateQuote={handleCreateQuote}
        />
      )}

      {viewMode === "explore" && (
        <ExploreFeed
          estimates={publicEstimates}
          onViewDetail={handleViewPublicEstimate}
        />
      )}

      {viewMode === "mypage" && user && (
        <MyPage
          user={user}
          estimates={estimates}
          onViewEstimate={handleViewEstimate}
          onDeleteEstimate={handleDeleteEstimate}
          onNavigateHome={handleNavigateHome}
        />
      )}

      {viewMode === "preview" && (
        <QuotePreview
          formData={formData}
          user={user}
          onBack={handleBack}
          onSave={handleSaveEstimate}
          onOpenAuth={() => setAuthModalMode("register")}
        />
      )}

      {/* ボトムタブバー（プレビュー以外で表示） */}
      {viewMode !== "preview" && (
        <BottomTabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}

      {/* 保存完了トースト */}
      {showSavedToast && (
        <div className="fixed bottom-24 left-1/2 z-[100] -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-cyan-500/30">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            見積もりを保存しました
          </div>
        </div>
      )}
    </main>
  )
}

export default Page
