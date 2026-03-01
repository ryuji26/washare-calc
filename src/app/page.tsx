"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/Header"
import { AuthModal } from "@/components/AuthModal"
import { InputForm } from "@/components/InputForm"
import { QuotePreview } from "@/components/QuotePreview"
import { MyPage } from "@/components/MyPage"
import { DEFAULT_FORM_DATA } from "@/lib/constants"
import { loadUser, removeUser, loadEstimates, saveEstimate } from "@/lib/storage"
import {
  type EstimateFormData,
  type ViewMode,
  type AuthModalMode,
  type User,
  type SavedEstimate,
} from "@/types"

const Page = () => {
  // 画面モード管理
  const [viewMode, setViewMode] = useState<ViewMode>("input")

  // 認証モーダル
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>(null)

  // ユーザー状態
  const [user, setUser] = useState<User | null>(null)

  // 見積もり履歴
  const [estimates, setEstimates] = useState<SavedEstimate[]>([])

  // フォームデータの状態管理
  const [formData, setFormData] = useState<EstimateFormData>({
    ...DEFAULT_FORM_DATA,
  })

  // 保存済みトースト表示
  const [showSavedToast, setShowSavedToast] = useState(false)

  // 初回マウント時にlocalStorageからユーザー情報と履歴を読込
  useEffect(() => {
    setUser(loadUser())
    setEstimates(loadEstimates())
  }, [])

  // 見積書作成（プレビュー画面へ遷移）
  const handleCreateQuote = useCallback(() => {
    setViewMode("preview")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  // 入力画面に戻る
  const handleBack = useCallback(() => {
    setViewMode("input")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  // ホーム（入力画面）に戻る
  const handleNavigateHome = useCallback(() => {
    setViewMode("input")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  // マイページへ遷移
  const handleNavigateMyPage = useCallback(() => {
    setEstimates(loadEstimates())
    setViewMode("mypage")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  // ログイン成功
  const handleLogin = useCallback((loggedInUser: User) => {
    setUser(loggedInUser)
    setAuthModalMode(null)
  }, [])

  // ログアウト
  const handleLogout = useCallback(() => {
    removeUser()
    setUser(null)
    setViewMode("input")
  }, [])

  // 見積もり保存
  const handleSaveEstimate = useCallback(() => {
    saveEstimate(formData)
    setEstimates(loadEstimates())
    setShowSavedToast(true)
    setTimeout(() => setShowSavedToast(false), 2500)
  }, [formData])

  // 履歴から見積もりを再表示
  const handleViewEstimate = useCallback((savedFormData: EstimateFormData) => {
    setFormData(savedFormData)
    setViewMode("preview")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return (
    <main className="relative min-h-screen">
      {/* 共通ヘッダー（プレビュー画面では非表示） */}
      {viewMode !== "preview" && (
        <Header
          user={user}
          onOpenAuth={setAuthModalMode}
          onNavigateMyPage={handleNavigateMyPage}
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
      {viewMode === "preview" && (
        <QuotePreview
          formData={formData}
          user={user}
          onBack={handleBack}
          onSave={handleSaveEstimate}
          onOpenAuth={() => setAuthModalMode("register")}
        />
      )}
      {viewMode === "mypage" && user && (
        <MyPage
          user={user}
          estimates={estimates}
          onViewEstimate={handleViewEstimate}
          onNavigateHome={handleNavigateHome}
        />
      )}

      {/* 保存完了トースト */}
      {showSavedToast && (
        <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-300">
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
