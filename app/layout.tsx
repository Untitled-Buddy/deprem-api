import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Deprem Takip Sistemi',
  description: 'AFAD ve Kandilli verilerine dayalı deprem takip sistemi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
