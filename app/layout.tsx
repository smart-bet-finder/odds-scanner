import './globals.css'

export const metadata = {
  title: 'SmartScanner PRO',
  description: 'Real-time Arbitrage & Value Detection',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#020617]">{children}</body>
    </html>
  )
}
