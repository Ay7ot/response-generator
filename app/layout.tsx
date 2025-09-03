import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    default: 'Research Response Generator - Synthetic Survey Data Creation',
    template: '%s | Research Response Generator'
  },
  description: 'Generate statistically representative synthetic survey responses for academic and market research. Create realistic datasets with probability-based answer distributions for your research projects.',
  keywords: [
    'research response generator',
    'synthetic survey data',
    'academic research tool',
    'market research data',
    'survey response generation',
    'statistical data generation',
    'questionnaire responses',
    'SPSS data export',
    'Excel survey data',
    'probability-based responses'
  ],
  authors: [{ name: 'Research Response Generator Team' }],
  creator: 'Research Response Generator',
  publisher: 'Research Response Generator',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://response-generator-eight.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Research Response Generator - Synthetic Survey Data Creation',
    description: 'Generate statistically representative synthetic survey responses for academic and market research. Create realistic datasets with probability-based answer distributions.',
    url: 'https://response-generator-eight.vercel.app',
    siteName: 'Research Response Generator',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Research Response Generator - Create Synthetic Survey Data',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Research Response Generator - Synthetic Survey Data Creation',
    description: 'Generate statistically representative synthetic survey responses for academic and market research.',
    images: ['/og-image.png'],
    creator: '@researchgenerator',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Additional SEO meta tags */}
        <meta name="theme-color" content="#007AFF" />
        <meta name="msapplication-TileColor" content="#007AFF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Research Response Generator" />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Structured Data for Search Engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Research Response Generator",
              "description": "Generate statistically representative synthetic survey responses for academic and market research",
              "url": "https://response-generator-eight.vercel.app",
              "applicationCategory": "ResearchApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "creator": {
                "@type": "Organization",
                "name": "Research Response Generator Team"
              },
              "featureList": [
                "Synthetic survey data generation",
                "Probability-based response distribution",
                "Excel and SPSS export",
                "Project management with cloud storage",
                "Apple-inspired user interface",
                "Dark mode support"
              ],
              "screenshot": "/og-image.png"
            })
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
