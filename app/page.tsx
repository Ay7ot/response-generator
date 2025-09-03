'use client'

import ResponseGenerator from '@/components/ResponseGenerator'
import DarkModeToggle from '@/components/DarkModeToggle'

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-system-grouped-background)' }}>
      {/* Dark Mode Toggle */}
      <DarkModeToggle />

      {/* Apple-style navigation area */}
      <div className="pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-largeTitle font-semibold" style={{ color: 'var(--color-label)' }}>
              Response Generator
            </h1>
            <p className="text-title3 mt-2" style={{ color: 'var(--color-secondary-label)' }}>
              Generate synthetic survey responses for research
            </p>
          </div>

          {/* Project Action Buttons */}
          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={() => {
                // This will be handled by the ResponseGenerator component
                const event = new CustomEvent('openProjectManager')
                window.dispatchEvent(event)
              }}
              className="apple-button-secondary px-6 py-3 text-body font-medium"
            >
              📁 My Projects
            </button>
            <button
              onClick={() => {
                const event = new CustomEvent('startNewProject')
                window.dispatchEvent(event)
              }}
              className="apple-button-primary px-6 py-3 text-body font-medium"
            >
              + New Project
            </button>
          </div>
        </div>
      </div>

      {/* Main content area with Apple-style spacing */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="animate-slide-in">
          <ResponseGenerator />
        </div>
      </div>
    </div>
  )
}
