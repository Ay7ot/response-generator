'use client'

import { useState, useEffect } from 'react'
import { Question } from './ResponseGenerator'

interface QuestionFormProps {
  onAddQuestion: (question: Question) => void
  onUpdateQuestion: (index: number, question: Question) => void
  editingIndex: number | null
  questions: Question[]
}

export default function QuestionForm({ onAddQuestion, onUpdateQuestion, editingIndex, questions }: QuestionFormProps) {
  const [questionText, setQuestionText] = useState('')
  const [questionType, setQuestionType] = useState<'single' | 'multiple'>('single')
  const [options, setOptions] = useState([{ text: '', percentage: 0 }, { text: '', percentage: 0 }, { text: '', percentage: 0 }, { text: '', percentage: 0 }])  // Default to 4 options

  useEffect(() => {
    if (editingIndex !== null) {
      const question = questions[editingIndex]
      setQuestionText(question.text)
      setQuestionType(question.type)
      setOptions(question.options.map(option => ({ text: option.text, percentage: option.percentage })))  // Load existing options
    }
  }, [editingIndex, questions])

  const handleAddOption = () => {
    setOptions([...options, { text: '', percentage: 0 }])
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index].text = value
    setOptions(newOptions)
  }

  const handlePercentageChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index].percentage = parseFloat(value) || 0;  // Convert string input back to number
    setOptions(newOptions)
  }

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (questionText.trim() && options.filter(o => o.text.trim()).length >= 2) {
      const newOptions = options.map(option => ({ text: option.text, percentage: option.percentage }));

      // If it's a single choice question, ensure total percentage does not exceed 100
      if (questionType === 'single') {
        const totalPercentage = newOptions.reduce((sum, option) => sum + option.percentage, 0);
        const emptyOptions = newOptions.filter(option => option.percentage === 0);
        
        if (totalPercentage > 100) {
          alert('Total percentage cannot exceed 100% for single choice questions.');
          return;
        }

        // Randomly distribute remaining percentage among empty options
        const remainingPercentage = 100 - totalPercentage;
        if (remainingPercentage > 0 && emptyOptions.length > 0) {
          const randomDistribution = remainingPercentage / emptyOptions.length;
          emptyOptions.forEach(option => {
            option.percentage = Math.random() * randomDistribution; // Randomly assign a portion of the remaining percentage
          });
        }
      }

      const newQuestion = {
        text: questionText,
        type: questionType,
        options: newOptions.filter(o => o.text.trim()) // Filter out empty options
      }
      if (editingIndex !== null) {
        onUpdateQuestion(editingIndex, newQuestion)
      } else {
        onAddQuestion(newQuestion)
      }
      setQuestionText('')
      setQuestionType('single')
      setOptions([{ text: '', percentage: 0 }, { text: '', percentage: 0 }, { text: '', percentage: 0 }, { text: '', percentage: 0 }])  // Reset to 4 empty options
    } else {
      alert('Please enter a question and at least two options')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label htmlFor="question-text" className="block text-sm font-medium text-gray-700 mb-1">Question</label>
        <input
          id="question-text"
          type="text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none p-4 text-black"
          placeholder="Enter your question here"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
        <select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value as 'single' | 'multiple')}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none sm:text-sm rounded-md p-4 text-black"
        >
          <option value="single">Single Choice</option>
          <option value="multiple">Multiple Choice</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={option.text}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="flex-grow rounded-md border-gray-300 shadow-sm focus:outline-none p-4 text-black"
                placeholder={`Option ${index + 1}`}
              />
              <input
                type="number"
                value={option.percentage}
                onChange={(e) => handlePercentageChange(index, e.target.value)}
                className="w-20 rounded-md border-gray-300 shadow-sm focus:outline-none p-2 text-black"
                placeholder="Percentage"
                min="0"
                max="100"
                step="0.01"  // Allow decimal inputs
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="p-2 text-red-600 hover:text-red-800 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAddOption}
          className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none"
        >
          Add Option
        </button>
      </div>
      <button
        type="submit"
        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
      >
        {editingIndex !== null ? 'Update Question' : 'Add Question'}
      </button>
    </form>
  )
}