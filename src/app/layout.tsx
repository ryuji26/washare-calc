import type { Metadata, Viewport } from "next"
import { Noto_Sans_JP } from "next/font/google"
import "./globals.css"

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "Washare Calc | 洗車・ディテーリング見積もりツール",
  description:
    "洗車・ディテーリングの見積もりを簡単に作成。ケミカル原価と労働対価から最適な提示価格を自動計算し、プロ品質の見積書を発行できます。",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <html lang="ja" className="dark">
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}

export default RootLayout
