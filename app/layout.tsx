import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'DoorKey — Premium Property Listing Platform',
    template: '%s | DoorKey',
  },
  description: "Find your perfect property — Residential, Commercial, Industrial & Agricultural properties. Connect owners and tenants on India's fastest property listing platform.",
  generator: 'v0.app',
  keywords: ['property listing', 'real estate', 'rent', 'buy', 'sell', 'landlord', 'tenant', 'apartment', 'house', 'india'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://doorkey.in'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'DoorKey',
    title: 'DoorKey — Premium Property Listing Platform',
    description: "Find your perfect property on India's fastest property listing platform.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DoorKey — Premium Property Listing Platform',
    description: "Find your perfect property on India's fastest property listing platform.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
  themeColor: '#0EA5E9',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster position="top-right" expand richColors />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
