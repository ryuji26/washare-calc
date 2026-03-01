"use client"

import { useState } from "react"
import { InputForm } from "@/components/InputForm"
import { QuotePreview } from "@/components/QuotePreview"
import { DEFAULT_FORM_DATA } from "@/lib/constants"
import { type EstimateFormData, type ViewMode } from "@/types"

const Page = () => {
  // 画面モード管理
  const [viewMode, setViewMode] = useState<ViewMode>("input")

  // フォームデータの状態管理
  const [formData, setFormData] = useState<EstimateFormData>({
    ...DEFAULT_FORM_DATA,
  })

  // 見積書作成（プレビュー画面へ遷移）
  const handleCreateQuote = () => {
    setViewMode("preview")
    // ページトップにスクロール
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // 入力画面に戻る
  const handleBack = () => {
    setViewMode("input")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <main>
      {viewMode === "input" ? (
        <InputForm
          formData={formData}
          onFormDataChange={setFormData}
          onCreateQuote={handleCreateQuote}
        />
      ) : (
        <QuotePreview formData={formData} onBack={handleBack} />
      )}
    </main>
  )
}

export default Page
