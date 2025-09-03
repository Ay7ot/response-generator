'use client'

import { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { toast } from 'react-toastify'
import { createPortal } from 'react-dom'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [isReset, setIsReset] = useState(false)
    const [loading, setLoading] = useState(false)
    const [resetting, setResetting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Reset password flow
        if (isReset) {
            if (!email) {
                toast.info('Enter your email to reset your password')
                return
            }
            try {
                setResetting(true)
                await sendPasswordResetEmail(auth, email)
                toast.success('Password reset email sent')
                setIsReset(false)
            } catch (error: any) {
                toast.error(error.message || 'Failed to send reset email')
            } finally {
                setResetting(false)
            }
            return
        }

        // Sign in / Sign up flow
        setLoading(true)
        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password)
                toast.success('Account created successfully!')
            } else {
                await signInWithEmailAndPassword(auth, email, password)
                toast.success('Signed in successfully!')
            }
            onClose()
            setEmail('')
            setPassword('')
        } catch (error: any) {
            toast.error(error.message || 'Authentication failed')
        } finally {
            setLoading(false)
        }
    }

    const handleSignOut = async () => {
        try {
            await signOut(auth)
            toast.success('Signed out successfully')
            onClose()
        } catch (error: any) {
            toast.error('Sign out failed')
        }
    }

    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 bg-black bg-opacity-60">
            <div
                className="apple-card p-6 w-full max-w-md mx-4"
                style={{
                    backgroundColor: 'var(--color-secondary-system-grouped-background)',
                    border: '1px solid var(--color-separator)'
                }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--color-label)' }}>
                        {isReset ? 'Reset Password' : isSignUp ? 'Create Account' : 'Sign In'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        style={{ color: 'var(--color-secondary-label)' }}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-label)' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="apple-input w-full"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    {!isReset && (
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-label)' }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="apple-input w-full"
                                placeholder="••••••••"
                                required
                            />
                            {!isSignUp && (
                                <div className="mt-2 text-right">
                                    <button
                                        type="button"
                                        onClick={() => setIsReset(true)}
                                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isReset ? resetting : loading}
                        className="apple-button-primary w-full"
                    >
                        {isReset ? (resetting ? 'Sending…' : 'Send Reset Link') : (loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In'))}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    {isReset ? (
                        <button
                            onClick={() => setIsReset(false)}
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                            Back to Sign In
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}
