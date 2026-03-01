"use client"

import { type TabId } from "@/types"

type BottomTabBarProps = {
    activeTab: TabId
    onTabChange: (tabId: TabId) => void
}

export const BottomTabBar = ({ activeTab, onTabChange }: BottomTabBarProps) => {

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/90 pb-safe backdrop-blur-xl">
            <div className="mx-auto flex max-w-lg items-center justify-between px-6 pb-2 pt-2">

                {/* 見積作成タブ */}
                <button
                    onClick={() => onTabChange("input")}
                    className={`flex flex-col items-center justify-center space-y-1 w-16 transition-colors ${activeTab === "input" ? "text-cyan-400" : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === "input" ? 2.5 : 2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className={`text-[10px] ${activeTab === "input" ? "font-bold" : "font-medium"}`}>
                        見積作成
                    </span>
                </button>

                {/* みんなの見積タブ */}
                <button
                    onClick={() => onTabChange("explore")}
                    className={`flex flex-col items-center justify-center space-y-1 w-16 transition-colors ${activeTab === "explore" ? "text-cyan-400" : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === "explore" ? 2.5 : 2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={`text-[10px] ${activeTab === "explore" ? "font-bold" : "font-medium"}`}>
                        みんなの見積
                    </span>
                </button>

                {/* マイページタブ */}
                <button
                    onClick={() => onTabChange("mypage")}
                    className={`flex flex-col items-center justify-center space-y-1 w-16 transition-colors ${activeTab === "mypage" ? "text-cyan-400" : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === "mypage" ? 2.5 : 2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className={`text-[10px] ${activeTab === "mypage" ? "font-bold" : "font-medium"}`}>
                        マイページ
                    </span>
                </button>

            </div>
        </div>
    )
}
