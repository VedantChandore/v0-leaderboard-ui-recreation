import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '../contexts/AuthContext'
import './globals.css'

export const metadata = {
  title: 'Google Cloud StudyJams Leaderboard',
  description: 'Track your progress in Google Cloud StudyJams',
  generator: 'v0.app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}