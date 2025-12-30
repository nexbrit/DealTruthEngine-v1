import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Deal Truth Engine',
  description: 'AI-powered PE due diligence platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-zinc-950`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
              <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <a href="/" className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:shadow-green-500/30 transition-shadow">
                    <span className="text-white font-bold text-lg">DT</span>
                  </div>
                  <div>
                    <span className="text-white font-semibold text-lg block leading-tight">Deal Truth Engine</span>
                    <span className="text-zinc-500 text-xs">PE Due Diligence Platform</span>
                  </div>
                </a>
                <nav className="flex items-center gap-6">
                  <a href="/" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">
                    Deals
                  </a>
                  <div className="h-4 w-px bg-zinc-800" />
                  <span className="text-xs text-zinc-600 font-medium px-2 py-1 bg-zinc-900 rounded border border-zinc-800">
                    DEMO
                  </span>
                </nav>
              </div>
            </header>
            <main className="flex-1">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
            <footer className="border-t border-zinc-800 py-4">
              <div className="container mx-auto px-4 flex items-center justify-between text-xs text-zinc-600">
                <span>Deal Truth Engine v0.1.0</span>
                <span>Powered by Claude AI</span>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}
