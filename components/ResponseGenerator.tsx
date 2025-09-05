'use client'

import { useState, useRef, useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import QuestionForm from './QuestionForm'
import QuestionList from './QuestionList'
import AuthModal from './AuthModal'
import ProjectManager from './ProjectManager'
import GoogleFormsConnector from './GoogleFormsConnector'
import { useAuth } from '@/hooks/useFirebase'
import { db } from '@/lib/firebase'
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'

export default function ResponseGenerator() {
  const [topic, setTopic] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [numResponses, setNumResponses] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [, setFocusedSection] = useState<string | null>(null)
  const [generatedResponses, setGeneratedResponses] = useState<string[][]>([])
  const [saveToFirebase, setSaveToFirebase] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showProjectManager, setShowProjectManager] = useState(false)
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>()
  const [activeTab, setActiveTab] = useState<'synthetic' | 'google-forms'>('synthetic')
  const topicInputRef = useRef<HTMLInputElement>(null)

  const { user } = useAuth()

  // Apple-style focus management
  useEffect(() => {
    if (topicInputRef.current && topic === '') {
      topicInputRef.current.focus()
    }
  }, [topic])

  // Listen for project management events
  useEffect(() => {
    const handleOpenProjectManager = () => {
      if (user) {
        setShowProjectManager(true)
      } else {
        toast.info('Please sign in to manage your projects', {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true
        })
        setShowAuthModal(true)
      }
    }

    const handleStartNewProject = () => {
      startNewProject()
    }

    window.addEventListener('openProjectManager', handleOpenProjectManager)
    window.addEventListener('startNewProject', handleStartNewProject)

    return () => {
      window.removeEventListener('openProjectManager', handleOpenProjectManager)
      window.removeEventListener('startNewProject', handleStartNewProject)
    }
  }, [user])

  const addQuestion = (question: Question) => {
    setQuestions([...questions, question])
  }

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    const newQuestions = [...questions]
    newQuestions[index] = updatedQuestion
    setQuestions(newQuestions)
    setEditingIndex(null)
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index)
  }

  const saveToFirebaseDB = async (saveType: 'draft' | 'complete' = 'complete') => {
    try {
      if (!user?.uid) {
        toast.error('Please sign in to save to cloud')
        return
      }

      const nowIso = new Date().toISOString()
      const researchData = {
        topic,
        questions,
        responses: saveType === 'complete' ? generatedResponses : [],
        userId: user.uid,
        createdAt: nowIso,
        updatedAt: nowIso,
        totalQuestions: questions.length,
        totalResponses: saveType === 'complete' ? (generatedResponses[0]?.length || 0) : 0,
        status: saveType === 'complete' ? 'completed' : 'draft' as const,
        saveType
      }

      if (currentProjectId) {
        // Update existing
        await updateDoc(doc(db, 'research_projects', currentProjectId), {
          ...researchData,
          createdAt: undefined, // keep original if exists
          updatedAt: nowIso
        })
      } else {
        const ref = await addDoc(collection(db, 'research_projects'), researchData)
        setCurrentProjectId(ref.id)
      }

      toast.success(saveType === 'draft' ? 'Draft saved to cloud!' : 'Research data saved to cloud!', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
      })
    } catch (error) {
      console.error('Error saving to Firebase:', error)
      toast.error('Failed to save to cloud')
    }
  }

  const loadProject = (project: {
    id: string
    topic?: string
    questions?: Question[]
    responses?: string[][]
  }) => {
    setTopic(project.topic || '')
    setQuestions(project.questions || [])
    setCurrentProjectId(project.id)
    setGeneratedResponses(project.responses || [])

    toast.success('Project loaded successfully!', {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true
    })
  }

  const startNewProject = () => {
    setTopic('')
    setQuestions([])
    setCurrentProjectId(undefined)
    setGeneratedResponses([])
    setEditingIndex(null)

    toast.success('Started new project!', {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true
    })
  }

  const handleSubmit = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a research topic', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        style: {
          backgroundColor: 'var(--color-system-red)',
          color: 'white',
          borderRadius: '12px',
          fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, system-ui, sans-serif',
          fontSize: '15px',
          fontWeight: '600'
        }
      })
      topicInputRef.current?.focus()
      return
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        style: {
          backgroundColor: 'var(--color-system-red)',
          color: 'white',
          borderRadius: '12px',
          fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, system-ui, sans-serif',
          fontSize: '15px',
          fontWeight: '600'
        }
      })
      return
    }

    if (numResponses < 1) {
      toast.error('Please enter a valid number of responses', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        style: {
          backgroundColor: 'var(--color-system-red)',
          color: 'white',
          borderRadius: '12px',
          fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, system-ui, sans-serif',
          fontSize: '15px',
          fontWeight: '600'
        }
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/generate-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, questions, numResponses }),
      })

      if (response.ok) {
        const contentType = response.headers.get('Content-Type')
        if (contentType && contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
          const blob = await response.blob()

          // Store responses for potential Firebase save
          // Note: We'd need to modify the API to return JSON data as well
          setGeneratedResponses([]) // We'll set this when we modify the API

          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.style.display = 'none'
          a.href = url
          const contentDisposition = response.headers.get('Content-Disposition')
          const filenameMatch = contentDisposition && contentDisposition.match(/filename="?(.+)"?/)
          const filename = filenameMatch ? filenameMatch[1].replace(/['"]/g, '') : `responses_${topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.xlsx`
          a.download = filename
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)

          // Save to Firebase if enabled
          if (saveToFirebase && user) {
            await saveToFirebaseDB('complete')
          } else if (saveToFirebase && !user) {
            toast.info('Please sign in to save your research data to the cloud', {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
              style: {
                backgroundColor: 'var(--color-system-orange)',
                color: 'white',
                borderRadius: '12px',
                fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, system-ui, sans-serif',
                fontSize: '15px',
                fontWeight: '600'
              }
            })
            setSaveToFirebase(false)
          }

          toast.success('Responses generated and downloaded successfully', {
            position: "top-center",
            autoClose: 4000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            style: {
              backgroundColor: 'var(--color-system-green)',
              color: 'white',
              borderRadius: '12px',
              fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, system-ui, sans-serif',
              fontSize: '15px',
              fontWeight: '600'
            }
          })
        } else {
          const result = await response.json()
          toast.error(result.message || 'An unexpected error occurred')
        }
      } else {
        const errorText = await response.text()
        toast.error(`Failed to generate responses: ${errorText}`)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred while generating responses')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        pauseOnHover={true}
        pauseOnFocusLoss={false}
        draggable={true}
        theme="colored"
        toastClassName="apple-toast"
        bodyClassName="apple-toast-body"
        progressClassName="apple-toast-progress"
      />

      {/* Research Topic Section */}
      <section className="apple-card p-6 animate-fade-in">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="topic"
              className="text-headline block mb-3"
              style={{ color: 'var(--color-label)' }}
            >
              Research Topic
            </label>
            <input
              ref={topicInputRef}
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onFocus={() => setFocusedSection('topic')}
              onBlur={() => setFocusedSection(null)}
              required
              className="apple-input w-full text-body"
              placeholder="Enter your research topic"
              aria-label="Research topic"
              autoComplete="off"
            />
            <p className="text-footnote mt-2" style={{ color: 'var(--color-secondary-label)' }}>
              Provide a clear, descriptive topic for your survey research
            </p>
          </div>
        </div>
      </section>

      {/* Mode Selection Tabs */}
      <section className="apple-card p-6 animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <div className="flex flex-col md:flex-row gap-3 md:gap-1 mb-4">
          <button
            onClick={() => setActiveTab('synthetic')}
            className={`flex-1 py-3 px-4 text-body font-medium rounded-lg transition-all ${activeTab === 'synthetic'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            📊 Synthetic Data Generation
          </button>
          <button
            onClick={() => setActiveTab('google-forms')}
            className={`flex-1 py-3 px-4 text-body font-medium rounded-lg transition-all ${activeTab === 'google-forms'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            📝 Google Forms Connector
          </button>
        </div>

        <div className="text-center">
          <p className="text-footnote" style={{ color: 'var(--color-secondary-label)' }}>
            {activeTab === 'synthetic'
              ? 'Create and manage survey questions with probability-based responses'
              : 'Connect to existing Google Forms and generate responses automatically'
            }
          </p>
        </div>
      </section>

      {/* Conditional Content Based on Active Tab */}
      {activeTab === 'synthetic' ? (
        <>
          {/* Question Creation Section */}
          <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <QuestionForm
              onAddQuestion={addQuestion}
              onUpdateQuestion={updateQuestion}
              editingIndex={editingIndex}
              questions={questions}
            />
          </section>

          {/* Questions List Section */}
          {questions.length > 0 && (
            <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <QuestionList
                questions={questions}
                onRemoveQuestion={removeQuestion}
                onEditQuestion={handleEdit}
              />
            </section>
          )}

          {/* Generation Settings Section */}
          <section className="apple-card p-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="num-responses"
                  className="text-headline block mb-3"
                  style={{ color: 'var(--color-label)' }}
                >
                  Number of Responses
                </label>
                <input
                  id="num-responses"
                  type="number"
                  min="1"
                  max="10000"
                  value={numResponses}
                  onChange={(e) => setNumResponses(Math.max(1, parseInt(e.target.value) || 1))}
                  onFocus={() => setFocusedSection('responses')}
                  onBlur={() => setFocusedSection(null)}
                  required
                  className="apple-input w-full text-body"
                  placeholder="1"
                  aria-label="Number of responses to generate"
                />
                <p className="text-footnote mt-2" style={{ color: 'var(--color-secondary-label)' }}>
                  How many synthetic responses would you like to generate?
                </p>
              </div>

              {/* Project Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col space-y-4">
                  {/* Save Draft Button */}
                  <div>
                    <button
                      onClick={() => {
                        if (user) {
                          saveToFirebaseDB('draft')
                        } else {
                          toast.info('Please sign in to save drafts', {
                            position: "top-center",
                            autoClose: 3000,
                            hideProgressBar: true,
                            closeOnClick: true,
                            pauseOnHover: true
                          })
                          setShowAuthModal(true)
                        }
                      }}
                      className="apple-button-secondary w-full text-body font-medium"
                    >
                      💾 Save Draft
                    </button>
                    <p className="text-caption2 mt-2" style={{ color: 'var(--color-secondary-label)' }}>
                      Save your current work without generating responses
                    </p>
                  </div>

                  {/* Firebase Auto-Save Option */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-headline" style={{ color: 'var(--color-label)' }}>
                        Auto-save to Cloud
                      </label>
                      <p className="text-footnote mt-1" style={{ color: 'var(--color-secondary-label)' }}>
                        Automatically save after generating responses
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveToFirebase}
                        onChange={(e) => setSaveToFirebase(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {saveToFirebase && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      {user ? (
                        <p className="text-caption2" style={{ color: 'rgba(60, 60, 67, 0.6)' }}>
                          Data will be saved to your account ({user.email})
                        </p>
                      ) : (
                        <div>
                          <p className="text-caption2 mb-2" style={{ color: 'var(--color-secondary-label)' }}>
                            Sign in to save your research data securely to the cloud
                          </p>
                          <button
                            onClick={() => setShowAuthModal(true)}
                            className="text-caption2 text-blue-600 hover:text-blue-800 dark:text-blue-400 underline"
                          >
                            Sign In or Create Account
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Generate Button Section */}
          <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !topic.trim() || questions.length === 0}
              className={`
            w-full apple-button-primary text-body
            ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}
            ${(!topic.trim() || questions.length === 0) ? 'opacity-40 cursor-not-allowed' : ''}
          `}
              aria-label={isLoading ? 'Generating responses' : 'Generate responses'}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-3">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Generating Responses...</span>
                </div>
              ) : (
                'Generate Responses'
              )}
            </button>

            {/* Progress indicator */}
            {!topic.trim() || questions.length === 0 ? (
              <div className="mt-3 text-center">
                <p className="text-footnote" style={{ color: 'var(--color-secondary-label)' }}>
                  {!topic.trim() ? 'Enter a research topic to continue' : 'Add at least one question to generate responses'}
                </p>
              </div>
            ) : (
              <div className="mt-3 text-center">
                <p className="text-footnote" style={{ color: 'var(--color-system-green)' }}>
                  Ready to generate {numResponses} response{numResponses !== 1 ? 's' : ''} for {questions.length} question{questions.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </section>

          {/* Auth Modal */}
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

          {/* Project Manager Modal */}
          <ProjectManager
            isOpen={showProjectManager}
            onClose={() => setShowProjectManager(false)}
            onLoadProject={loadProject}
            currentProject={{
              topic,
              questions,
              projectId: currentProjectId
            }}
          />
        </>
      ) : (
        /* Google Forms Connector Tab */
        <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <GoogleFormsConnector />
        </section>
      )}
    </div>
  )
}

export interface Question {
  text: string
  type: 'single' | 'multiple'
  options: { text: string; percentage: number | string }[];
}