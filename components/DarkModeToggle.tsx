'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useFirebase'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { toast } from 'react-toastify'

export default function DarkModeToggle() {
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const { user } = useAuth()

    useEffect(() => {
        setMounted(true)

        // Clear any existing theme preference to start fresh
        localStorage.removeItem('theme')

        // Always start with light mode
        setIsDarkMode(false)
        document.documentElement.removeAttribute('data-theme')

        console.log('Initial theme setup: Light mode activated')
    }, [])

    const toggleDarkMode = () => {
        const newIsDarkMode = !isDarkMode
        setIsDarkMode(newIsDarkMode)

        if (newIsDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.removeAttribute('data-theme')
            localStorage.setItem('theme', 'light')
        }

        console.log('Theme toggled:', {
            newIsDarkMode,
            currentAttribute: document.documentElement.getAttribute('data-theme'),
            localStorage: localStorage.getItem('theme')
        })
    }

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return null
    }

    const handleSignOut = async () => {
        try {
            await signOut(auth)
            toast.success('Signed out successfully')
            setShowUserMenu(false)
        } catch (error) {
            toast.error('Sign out failed')
        }
    }

    return (
        <>
            {/* User Menu (if authenticated) */}
            {user && (
                <div className="fixed top-6 right-20 z-50">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="apple-button-secondary p-3 min-h-[44px] w-[44px] flex items-center justify-center"
                        style={{
                            backgroundColor: 'var(--color-secondary-system-background)',
                            border: '1px solid var(--color-separator)',
                            color: 'var(--color-label)',
                            borderRadius: '12px',
                            boxShadow: 'var(--shadow-2)'
                        }}
                        aria-label="User menu"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>

                    {showUserMenu && (
                        <div
                            className="absolute top-14 right-0 apple-card p-3 min-w-[200px]"
                            style={{
                                backgroundColor: 'var(--color-secondary-system-grouped-background)',
                                border: '1px solid var(--color-separator)',
                                boxShadow: 'var(--shadow-2)'
                            }}
                        >
                            <div className="text-sm" style={{ color: 'var(--color-secondary-label)' }}>
                                {user.email}
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="mt-2 w-full text-sm apple-button-secondary text-center"
                                style={{
                                    backgroundColor: 'var(--color-system-red)',
                                    color: 'white',
                                    border: 'none'
                                }}
                            >
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Theme Toggle */}
            <button
                onClick={toggleDarkMode}
                className="apple-button-secondary p-3 min-h-[44px] w-[44px] flex items-center justify-center fixed top-6 right-6 z-50"
                style={{
                    backgroundColor: 'var(--color-secondary-system-background)',
                    border: '1px solid var(--color-separator)',
                    color: 'var(--color-label)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-2)'
                }}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                {isDarkMode ? (
                    // Sun icon for light mode
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                            clipRule="evenodd"
                        />
                    </svg>
                ) : (
                    // Moon icon for dark mode
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                )}
            </button>
        </>
    )
}
