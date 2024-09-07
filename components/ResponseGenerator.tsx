'use client'

import { useState } from 'react'
import QuestionForm from './QuestionForm'
import QuestionList from './QuestionList'

export default function ResponseGenerator() {
  const [topic, setTopic] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [numResponses, setNumResponses] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

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

  const handleSubmit = async () => {
    if (!topic.trim()) {
      alert('Please enter a research topic')
      return
    }

    if (questions.length === 0) {
      alert('Please add at least one question')
      return
    }

    if (numResponses < 1) {
      alert('Please enter a valid number of responses')
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
          alert('Responses generated and downloaded successfully')
        } else {
          const result = await response.json()
          alert(result.message || 'An unexpected error occurred')
        }
      } else {
        const errorText = await response.text()
        alert(`Failed to generate responses: ${errorText}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred while generating responses')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full bg-white shadow-md rounded-lg overflow-hidden max-w-4xl mx-auto">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Research Topic</label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none p-4 text-black"
          />
        </div>
        <QuestionForm 
          onAddQuestion={addQuestion} 
          onUpdateQuestion={updateQuestion} 
          editingIndex={editingIndex} 
          questions={questions} 
        />
        <QuestionList 
          questions={questions} 
          onRemoveQuestion={removeQuestion} 
          onEditQuestion={handleEdit} 
        />
        <div>
          <label htmlFor="num-responses" className="block text-sm font-medium text-gray-700">Number of Responses</label>
          <input
            id="num-responses"
            type="number"
            min="1"
            value={numResponses}
            onChange={(e) => setNumResponses(Math.max(1, parseInt(e.target.value)))}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none p-4 text-black"
          />
        </div>
        <button 
          onClick={handleSubmit}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Responses'}
        </button>
      </div>
    </div>
  )
}

export interface Question {
  text: string
  type: 'single' | 'multiple'
  options: string[]
}