import './globals.css'

export const metadata = {
  title: 'Smart Scanner PRO',
  description: 'Real-time Arbitrage & Value Detection',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
