'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useFirebase'

export default function FirebaseDebug() {
    const { user, loading } = useAuth()
    const [debugInfo, setDebugInfo] = useState<any>(null)
    const [loadingDebug, setLoadingDebug] = useState(false)

    const runDebugTest = async () => {
        setLoadingDebug(true)
        try {
            // First test Firebase connection
            const firebaseResponse = await fetch('/api/firebase-test')
            const firebaseData = await firebaseResponse.json()

            // Then test load projects if user is authenticated
            let projectsData = null
            if (user) {
                const projectsResponse = await fetch(`/api/load-projects?userId=${user.uid}`)
                projectsData = await projectsResponse.json()
            }

            setDebugInfo({
                userId: user?.uid || 'Not authenticated',
                email: user?.email || 'N/A',
                firebaseConnection: firebaseData,
                projectsResponse: projectsData,
                timestamp: new Date().toISOString()
            })
        } catch (error: any) {
            setDebugInfo({
                error: error.message,
                userId: user?.uid || 'Not authenticated',
                timestamp: new Date().toISOString()
            })
        } finally {
            setLoadingDebug(false)
        }
    }

    const clearDebugInfo = () => {
        setDebugInfo(null)
    }

    return (
        <div className="apple-card p-4 mt-4">
            <h3 className="text-headline mb-3" style={{ color: 'var(--color-label)' }}>
                Firebase Debug Tool
            </h3>

            <div className="space-y-3">
                <div className="text-sm" style={{ color: 'var(--color-secondary-label)' }}>
                    <strong>Auth Status:</strong> {loading ? 'Loading...' : user ? `Authenticated (${user.email})` : 'Not authenticated'}
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={runDebugTest}
                        disabled={loadingDebug}
                        className="apple-button-secondary text-sm"
                    >
                        {loadingDebug ? 'Testing...' : 'Test Firestore Access'}
                    </button>
                    <button
                        onClick={async () => {
                            try {
                                const userId = user?.uid || 'anonymous';
                                const response = await fetch(`/api/firebase-test?userId=${userId}`, { method: 'POST' });
                                const data = await response.json();
                                setDebugInfo({
                                    testDocumentCreation: data,
                                    timestamp: new Date().toISOString()
                                });
                            } catch (error: any) {
                                setDebugInfo({
                                    testDocumentCreation: { error: error.message },
                                    timestamp: new Date().toISOString()
                                });
                            }
                        }}
                        className="apple-button-secondary text-sm"
                        style={{ backgroundColor: 'var(--color-system-green)', color: 'white', border: 'none' }}
                    >
                        ➕ Create Test Document
                    </button>
                    <button
                        onClick={clearDebugInfo}
                        className="apple-button-secondary text-sm"
                        style={{ backgroundColor: 'var(--color-system-red)', color: 'white', border: 'none' }}
                    >
                        Clear
                    </button>
                    <button
                        onClick={() => {
                            const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own projects
    match /research_projects/{document} {
      allow read, write: if request.auth != null &&
        (request.auth.uid == resource.data.userId ||
         request.auth.uid == request.resource.data.userId);
    }

    // Allow anonymous users to create/read their own projects
    match /research_projects/{document} {
      allow create: if request.resource.data.userId == 'anonymous';
      allow read: if request.auth == null && resource.data.userId == 'anonymous';
      allow update, delete: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }

    // Allow all authenticated users to read project count (for debugging)
    match /research_projects {
      allow read: if request.auth != null;
    }
  }
}`;
                            navigator.clipboard.writeText(rules);
                            alert('Firestore rules copied to clipboard! Paste them in Firebase Console > Firestore > Rules');
                        }}
                        className="apple-button-secondary text-sm"
                        style={{ backgroundColor: 'var(--color-system-blue)', color: 'white', border: 'none' }}
                    >
                        📋 Copy Firestore Rules
                    </button>
                    <button
                        onClick={() => {
                            const tempRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;
                            navigator.clipboard.writeText(tempRules);
                            alert('⚠️ TEMPORARY RULES copied! These allow all access. Use only for testing, then replace with proper rules!');
                        }}
                        className="apple-button-secondary text-sm"
                        style={{ backgroundColor: 'var(--color-system-orange)', color: 'white', border: 'none' }}
                    >
                        🚨 Temp Full Access Rules
                    </button>
                </div>

                {debugInfo && (
                    <div
                        className="p-3 rounded-lg text-sm font-mono"
                        style={{
                            backgroundColor: 'var(--color-quaternary-system-fill)',
                            border: '1px solid var(--color-separator)'
                        }}
                    >
                        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    )
}
