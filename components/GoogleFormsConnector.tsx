'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'
import {
    parseGoogleForm,
    generateResponseTemplate,
    generateResponse,
    submitGoogleFormResponse,
    FormData,
    ResponseConfig,
    QUESTION_TYPES
} from '@/lib/googleForms'

interface GoogleFormsConnectorProps {
    onDataImported?: (data: FormData, config: ResponseConfig) => void
}

export default function GoogleFormsConnector({ onDataImported }: GoogleFormsConnectorProps) {
    const [formUrl, setFormUrl] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState<FormData | null>(null)
    const [responseConfig, setResponseConfig] = useState<ResponseConfig | null>(null)
    const [numResponses, setNumResponses] = useState('1')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleParseForm = async () => {
        if (!formUrl.trim()) {
            toast.error('Please enter a Google Form URL')
            return
        }

        setIsLoading(true)
        try {
            const data = await parseGoogleForm(formUrl)
            const config = generateResponseTemplate(data)

            setFormData(data)
            setResponseConfig(config)

            // Notify parent component if callback provided
            if (onDataImported) {
                onDataImported(data, config)
            }

            toast.success(`Parsed ${Object.keys(data).length} questions successfully!`)

        } catch (error) {
            console.error('Error parsing form:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to parse form')
        } finally {
            setIsLoading(false)
        }
    }

    const handleConfigChange = (questionText: string, newValue: any) => {
        if (!responseConfig) return

        const newConfig = { ...responseConfig }
        newConfig[questionText] = newValue
        setResponseConfig(newConfig)
    }

    const handleGenerateAndSubmit = async () => {
        if (!formData || !responseConfig || !formUrl) {
            toast.error('Please parse a form first')
            return
        }

        setIsSubmitting(true)
        let successCount = 0
        let errorCount = 0

        try {
            for (let i = 0; i < parseInt(numResponses); i++) {
                try {
                    const payload = generateResponse(formData, responseConfig)
                    await submitGoogleFormResponse(formUrl, payload)
                    successCount++
                } catch (error) {
                    console.error(`Error submitting response ${i + 1}:`, error)
                    errorCount++
                }
            }

            if (successCount > 0) {
                toast.success(`Successfully submitted ${successCount} response${successCount !== 1 ? 's' : ''}!`)
                // Clear the number of responses after successful submission
                setNumResponses('1')
            }
            if (errorCount > 0) {
                toast.warning(`Failed to submit ${errorCount} response${errorCount !== 1 ? 's' : ''}`)
            }

        } catch (error) {
            console.error('Error in batch submission:', error)
            toast.error('Batch submission failed')
        } finally {
            setIsSubmitting(false)
        }
    }

    const getQuestionTypeName = (type: number): string => {
        switch (type) {
            case QUESTION_TYPES.TEXT: return 'Text Input'
            case QUESTION_TYPES.MCQ: return 'Multiple Choice'
            case QUESTION_TYPES.CHECKBOX: return 'Checkboxes'
            case QUESTION_TYPES.DROPDOWN: return 'Dropdown'
            case QUESTION_TYPES.SCALE: return 'Scale'
            default: return 'Unknown'
        }
    }

    return (
        <div className="space-y-6">
            {/* Form URL Input */}
            <div className="apple-card p-6">
                <h3 className="text-title2 font-semibold mb-4" style={{ color: 'var(--color-label)' }}>
                    Connect Google Form
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="text-headline block mb-3" style={{ color: 'var(--color-label)' }}>
                            Google Form URL
                        </label>
                        <input
                            type="url"
                            value={formUrl}
                            onChange={(e) => setFormUrl(e.target.value)}
                            className="apple-input w-full text-body"
                            placeholder="https://docs.google.com/forms/d/e/.../viewform"
                            disabled={isLoading}
                        />
                        <p className="text-footnote mt-2" style={{ color: 'var(--color-secondary-label)' }}>
                            Paste the URL of the Google Form you want to generate responses for
                        </p>
                    </div>

                    <button
                        onClick={handleParseForm}
                        disabled={isLoading || !formUrl.trim()}
                        className="apple-button-primary w-full text-body"
                    >
                        {isLoading ? 'Parsing Form...' : 'Parse Form'}
                    </button>
                </div>
            </div>

            {/* Questions Display */}
            {formData && responseConfig && (
                <div className="apple-card p-6">
                    <h3 className="text-title2 font-semibold mb-4" style={{ color: 'var(--color-label)' }}>
                        Form Questions ({Object.keys(formData).length})
                    </h3>

                    <div className="space-y-4 mb-6">
                        {Object.entries(formData).map(([questionText, meta]) => (
                            <div key={meta.id} className="apple-card p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h4 className="text-headline font-medium" style={{ color: 'var(--color-label)' }}>
                                            {questionText}
                                        </h4>
                                        <p className="text-caption1 mt-1" style={{ color: 'var(--color-secondary-label)' }}>
                                            {getQuestionTypeName(meta.type)} {meta.type === QUESTION_TYPES.MCQ ? '(Single Choice)' : meta.type === QUESTION_TYPES.CHECKBOX ? '(Multiple Choice)' : ''}
                                        </p>
                                    </div>
                                </div>

                                {/* Configuration based on question type */}
                                {meta.options && meta.options.length > 0 ? (
                                    <div className="space-y-2">
                                        <p className="text-footnote font-medium" style={{ color: 'var(--color-secondary-label)' }}>
                                            Response Weights (%):
                                        </p>
                                        {meta.options.map((option) => (
                                            <div key={option} className="flex items-center space-x-3">
                                                <span className="text-body flex-1" style={{ color: 'var(--color-label)' }}>
                                                    {option}
                                                </span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    value={(responseConfig[questionText] as { [key: string]: number })[option] || 0}
                                                    onChange={(e) => {
                                                        const newWeights = {
                                                            ...(responseConfig[questionText] as { [key: string]: number })
                                                        }
                                                        newWeights[option] = parseFloat(e.target.value) || 0
                                                        handleConfigChange(questionText, newWeights)
                                                    }}
                                                    className="apple-input w-20 text-center text-body"
                                                />
                                            </div>
                                        ))}
                                        <p className="text-caption2 mt-2" style={{ color: 'var(--color-tertiary-label)' }}>
                                            {meta.type === QUESTION_TYPES.MCQ
                                                ? 'Leave percentages as 0 to auto-distribute remaining weight randomly'
                                                : 'Leave percentages as 0 for random assignment'
                                            }
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-footnote font-medium" style={{ color: 'var(--color-secondary-label)' }}>
                                            Response Strategy:
                                        </p>
                                        <select
                                            value={responseConfig[questionText] as string}
                                            onChange={(e) => handleConfigChange(questionText, e.target.value)}
                                            className="apple-input w-full text-body"
                                        >
                                            <option value="random_text">Random Text</option>
                                            <option value="fixed:">Fixed Value (edit below)</option>
                                            <option value="random_int:1-100">Random Number (1-100)</option>
                                            <option value="random_int:1-10">Random Number (1-10)</option>
                                        </select>

                                        {(responseConfig[questionText] as string).startsWith('fixed:') && (
                                            <input
                                                type="text"
                                                value={(responseConfig[questionText] as string).split(':', 2)[1] || ''}
                                                onChange={(e) => {
                                                    const base = 'fixed:'
                                                    const value = e.target.value
                                                    handleConfigChange(questionText, base + value)
                                                }}
                                                className="apple-input w-full text-body"
                                                placeholder="Enter fixed response"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Generate & Submit Section */}
                    <div className="apple-card p-4">
                        <div className="space-y-4">
                            <div>
                                <label className="text-headline block mb-3" style={{ color: 'var(--color-label)' }}>
                                    Number of Responses
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={numResponses}
                                    onChange={(e) => setNumResponses(e.target.value === '' ? '' : (parseInt(e.target.value) || 0).toString())}
                                    onBlur={() => {
                                        if (numResponses === '' || parseInt(numResponses) < 1) {
                                            setNumResponses('1')
                                        }
                                    }}
                                    className="apple-input w-full text-body"
                                />
                            </div>

                            <button
                                onClick={handleGenerateAndSubmit}
                                disabled={isSubmitting}
                                className="apple-button-primary w-full text-body"
                            >
                                {isSubmitting ? 'Submitting Responses...' : `Generate & Submit ${numResponses} Response${parseInt(numResponses) !== 1 ? 's' : ''}`}
                            </button>

                            <p className="text-caption2 text-center" style={{ color: 'var(--color-tertiary-label)' }}>
                                This will submit actual responses to your Google Form
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
