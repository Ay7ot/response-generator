'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore'
import { useAuth } from '@/hooks/useFirebase'
import { createPortal } from 'react-dom'

interface Project {
    id: string
    topic: string
    questions: Question[]
    responses: string[][]
    createdAt: string
    updatedAt: string
    totalQuestions: number
    totalResponses: number
    status: 'draft' | 'completed'
    saveType: 'draft' | 'complete'
}

interface Question {
    text: string
    type: 'single' | 'multiple'
    options: {
        text: string
        percentage: number | string
    }[]
}

interface ProjectManagerProps {
    isOpen: boolean
    onClose: () => void
    onLoadProject: (project: Project) => void
    currentProject: {
        topic: string
        questions: Question[]
        projectId?: string
    }
}

export default function ProjectManager({
    isOpen,
    onClose,
    onLoadProject,
    currentProject
}: ProjectManagerProps) {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const { user } = useAuth()

    const loadProjects = useCallback(async () => {
        if (!user) return

        setLoading(true)
        try {
            // Avoid composite index requirement: fetch by userId and sort client-side by updatedAt desc
            const q = query(
                collection(db, 'research_projects'),
                where('userId', '==', user.uid)
            )
            const snapshot = await getDocs(q)
            const items: Project[] = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data()
            } as Project))
            items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            setProjects(items)
        } catch (error) {
            console.error('Error loading projects:', error)
            toast.error('Failed to load projects')
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (isOpen && user) {
            loadProjects()
        }
    }, [isOpen, user, loadProjects])

    const saveCurrentProject = async (saveType: 'draft' | 'complete' = 'draft') => {
        if (!user) {
            toast.error('Please sign in to save projects')
            return
        }

        if (!currentProject.topic.trim() && !currentProject.questions.length) {
            toast.error('Nothing to save - add a topic or questions first')
            return
        }

        setSaving(true)
        try {
            const nowIso = new Date().toISOString()
            const base = {
                topic: currentProject.topic,
                questions: currentProject.questions,
                responses: [],
                userId: user.uid,
                createdAt: nowIso,
                updatedAt: nowIso,
                totalQuestions: currentProject.questions.length,
                totalResponses: 0,
                status: saveType === 'complete' ? 'completed' : 'draft' as const,
                saveType
            }

            if (currentProject.projectId) {
                await updateDoc(doc(db, 'research_projects', currentProject.projectId), {
                    ...base,
                    createdAt: undefined,
                    updatedAt: nowIso
                })
            } else {
                await addDoc(collection(db, 'research_projects'), base)
            }

            toast.success(saveType === 'draft' ? 'Project saved as draft!' : 'Project saved!')
            loadProjects()
        } catch (error) {
            console.error('Error saving project:', error)
            toast.error('Failed to save project')
        } finally {
            setSaving(false)
        }
    }

    const loadProject = async (projectId: string) => {
        try {
            const snap = await getDoc(doc(db, 'research_projects', projectId))
            if (!snap.exists()) {
                toast.error('Project not found')
                return
            }
            const project = { id: snap.id, ...snap.data() } as Project
            onLoadProject(project)
            onClose()
        } catch (error) {
            console.error('Error loading project:', error)
            toast.error('Failed to load project')
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 bg-black bg-opacity-60">
            <div
                className="apple-card w-full max-w-4xl max-h-[80vh] overflow-hidden"
                style={{
                    backgroundColor: 'var(--color-secondary-system-grouped-background)',
                    border: '1px solid var(--color-separator)'
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between p-6"
                    style={{ borderBottom: '1px solid var(--color-separator)' }}
                >
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--color-label)' }}>
                        My Research Projects
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

                {/* Content */}
                <div className="flex flex-col md:flex-row h-[calc(80vh-80px)]">
                    {/* Save Current Project Section */}
                    <div
                        className="p-6 md:w-80"
                        style={{
                            borderBottom: '1px solid var(--color-separator)',
                            borderRight: '1px solid var(--color-separator)'
                        }}
                    >
                        <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--color-label)' }}>
                            Save Current Project
                        </h3>

                        <div className="space-y-3">
                            <div className="text-sm" style={{ color: 'var(--color-secondary-label)' }}>
                                Topic: {currentProject.topic || 'Untitled'}
                            </div>
                            <div className="text-sm" style={{ color: 'var(--color-secondary-label)' }}>
                                Questions: {currentProject.questions.length}
                            </div>

                            <div className="flex space-x-2 pt-4">
                                <button
                                    onClick={() => saveCurrentProject('draft')}
                                    disabled={saving}
                                    className="apple-button-secondary flex-1 text-sm"
                                >
                                    {saving ? 'Saving...' : 'Save Draft'}
                                </button>
                                <button
                                    onClick={() => saveCurrentProject('complete')}
                                    disabled={saving}
                                    className="apple-button-primary flex-1 text-sm"
                                >
                                    {saving ? 'Saving...' : 'Save Project'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Projects List */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--color-label)' }}>
                            Saved Projects
                        </h3>

                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-sm mt-2" style={{ color: 'var(--color-secondary-label)' }}>
                                    Loading projects...
                                </p>
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-sm" style={{ color: 'var(--color-secondary-label)' }}>
                                    No saved projects yet. Save your first project to get started!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {projects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="apple-card p-4 cursor-pointer transition-all duration-200 hover:shadow-lg"
                                        onClick={() => loadProject(project.id)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-medium mb-1" style={{ color: 'var(--color-label)' }}>
                                                    {project.topic || 'Untitled Project'}
                                                </h4>
                                                <div className="flex items-center space-x-4 text-xs" style={{ color: 'var(--color-secondary-label)' }}>
                                                    <span>{project.totalQuestions} questions</span>
                                                    {project.totalResponses > 0 && (
                                                        <span>{project.totalResponses} responses</span>
                                                    )}
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${project.status === 'completed'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                        }`}>
                                                        {project.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs mt-1" style={{ color: 'var(--color-tertiary-label)' }}>
                                                    Updated {formatDate(project.updatedAt)}
                                                </p>
                                            </div>
                                            <div className="ml-3">
                                                <svg className="w-5 h-5" style={{ color: 'var(--color-system-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}
