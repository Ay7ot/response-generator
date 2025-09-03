'use client'

import { useState, useEffect, useRef } from 'react'
import { Question } from './ResponseGenerator'

interface QuestionFormProps {
  onAddQuestion: (question: Question) => void
  onUpdateQuestion: (index: number, question: Question) => void
  editingIndex: number | null
  questions: Question[]
}

interface Option {
  text: string
  percentage: string // Always string in form, converted to number when saved
}

export default function QuestionForm({ onAddQuestion, onUpdateQuestion, editingIndex, questions }: QuestionFormProps) {
  const [questionText, setQuestionText] = useState('')
  const [questionType, setQuestionType] = useState<'single' | 'multiple'>('single')
  const [options, setOptions] = useState([{ text: '', percentage: '0' }, { text: '', percentage: '0' }, { text: '', percentage: '0' }, { text: '', percentage: '0' }])
  const [isExpanded, setIsExpanded] = useState(false)
  const questionInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingIndex !== null) {
      const question = questions[editingIndex]
      setQuestionText(question.text)
      setQuestionType(question.type)
      setOptions(question.options.map(option => ({
        text: option.text,
        percentage: typeof option.percentage === 'number' ? option.percentage.toString() : option.percentage
      })))
      setIsExpanded(true)
      questionInputRef.current?.focus()
    } else {
      setIsExpanded(false)
    }
  }, [editingIndex, questions])

  // Auto-expand when user starts typing
  useEffect(() => {
    if (questionText.trim() && !isExpanded) {
      setIsExpanded(true)
    }
  }, [questionText, isExpanded])

  const handleAddOption = () => {
    setOptions([...options, { text: '', percentage: '0' }])
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index].text = value
    setOptions(newOptions)
  }

  const handlePercentageChange = (index: number, value: string) => {
    const newOptions = [...options]
    // Allow empty string for better UX, will convert to '0' on blur
    newOptions[index].percentage = value === '' ? '' : (parseFloat(value) || 0).toString()
    setOptions(newOptions)
  }

  const handlePercentageBlur = (index: number) => {
    const newOptions = [...options]
    // Convert empty strings to '0' when user leaves the field
    if (newOptions[index].percentage === '') {
      newOptions[index].percentage = '0'
      setOptions(newOptions)
    }
  }

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (questionText.trim() && options.filter(o => o.text.trim()).length >= 2) {
      const newOptions = options.map(option => ({ text: option.text, percentage: option.percentage }));

      // If it's a single choice question, ensure total percentage equals 100
      if (questionType === 'single') {
        const totalPercentage = newOptions.reduce((sum, option) => sum + parseFloat(option.percentage || '0'), 0);
        const emptyOptions = newOptions.filter(option => parseFloat(option.percentage || '0') === 0);

        if (totalPercentage > 100) {
          alert('Total percentage cannot exceed 100% for single choice questions.');
          return;
        }

        // Randomly distribute remaining percentage among empty options
        const remainingPercentage = 100 - totalPercentage;
        if (remainingPercentage > 0 && emptyOptions.length > 0) {
          let distributedPercentage = 0;

          // Randomly assign a portion of the remaining percentage to each empty option
          emptyOptions.forEach(option => {
            const randomValue = Math.random() * (remainingPercentage - distributedPercentage);
            option.percentage = randomValue.toString();
            distributedPercentage += randomValue;
          });

          // Ensure the total equals 100%
          if (distributedPercentage < remainingPercentage) {
            const lastEmptyOption = emptyOptions[emptyOptions.length - 1];
            const currentValue = parseFloat(lastEmptyOption.percentage || '0');
            lastEmptyOption.percentage = (currentValue + (remainingPercentage - distributedPercentage)).toString();
          }
        } else if (totalPercentage < 100) {
          alert('Total percentage must equal 100% for single choice questions.');
          return;
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

      // Reset form
      setQuestionText('')
      setQuestionType('single')
      setOptions([{ text: '', percentage: '0' }, { text: '', percentage: '0' }, { text: '', percentage: '0' }, { text: '', percentage: '0' }])
      setIsExpanded(false)
    } else {
      alert('Please enter a question and at least two options')
    }
  }

  const handleCancel = () => {
    setQuestionText('')
    setQuestionType('single')
    setOptions([{ text: '', percentage: '0' }, { text: '', percentage: '0' }, { text: '', percentage: '0' }, { text: '', percentage: '0' }])
    setIsExpanded(false)
  }

  return (
    <div className="apple-card p-6">
      <div className="mb-4">
        <h2 className="text-title2 font-semibold" style={{ color: 'var(--color-label)' }}>
          {editingIndex !== null ? 'Edit Question' : 'Add Question'}
        </h2>
        <p className="text-footnote mt-1" style={{ color: 'var(--color-secondary-label)' }}>
          Create survey questions with customizable response probabilities
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Input */}
        <div>
          <label
            htmlFor="question-text"
            className="text-headline block mb-3"
            style={{ color: 'var(--color-label)' }}
          >
            Question
          </label>
          <input
            ref={questionInputRef}
            id="question-text"
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            required
            className="apple-input w-full text-body"
            placeholder="Enter your survey question"
            aria-label="Question text"
          />
        </div>

        {/* Expanded Form */}
        <div className={`space-y-6 transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100 max-h-screen' : 'opacity-0 max-h-0 overflow-hidden'
          }`}>
          {/* Question Type */}
          <div>
            <label
              className="text-headline block mb-3"
              style={{ color: 'var(--color-label)' }}
            >
              Question Type
            </label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as 'single' | 'multiple')}
              className="apple-input w-full text-body"
              aria-label="Question type"
            >
              <option value="single">Single Choice</option>
              <option value="multiple">Multiple Choice</option>
            </select>
            <p className="text-footnote mt-2" style={{ color: 'var(--color-secondary-label)' }}>
              {questionType === 'single'
                ? 'Respondents can select only one option'
                : 'Respondents can select multiple options'
              }
            </p>
          </div>

          {/* Options */}
          <div>
            <label
              className="text-headline block mb-3"
              style={{ color: 'var(--color-label)' }}
            >
              Answer Options
            </label>

            {/* Column Headers */}
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex-grow">
                <label className="text-footnote font-medium" style={{ color: 'var(--color-secondary-label)' }}>
                  Option Text
                </label>
              </div>
              <div className="w-28 text-center">
                <label className="text-footnote font-medium" style={{ color: 'var(--color-secondary-label)' }}>
                  Percentage (%)
                </label>
              </div>
            </div>

            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="animate-fade-in">
                  <div className="flex items-start space-x-3">
                    <div className="flex-grow">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="apple-input w-full text-body"
                        placeholder={`Option ${index + 1}`}
                        aria-label={`Option ${index + 1} text`}
                      />
                    </div>
                    <div className="w-28 relative">
                      <input
                        type="number"
                        value={option.percentage}
                        onChange={(e) => handlePercentageChange(index, e.target.value)}
                        onBlur={() => handlePercentageBlur(index)}
                        className="apple-input w-full text-body text-center pr-6"
                        placeholder="25"
                        min="0"
                        max="100"
                        step="0.1"
                        aria-label={`Option ${index + 1} percentage`}
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-footnote font-medium" style={{ color: 'var(--color-secondary-label)' }}>
                        %
                      </span>
                    </div>
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="apple-button-secondary p-2 min-h-[44px] w-[44px] flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-system-red)', color: 'white', border: 'none' }}
                        aria-label={`Remove option ${index + 1}`}
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
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddOption}
              className="apple-button-secondary text-callout mt-4 flex items-center justify-center"
              style={{ color: 'var(--color-system-blue)' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Option
            </button>

            <p className="text-footnote mt-3" style={{ color: 'var(--color-secondary-label)' }}>
              {questionType === 'single'
                ? 'Percentages should total 100% for single choice questions'
                : 'Percentages represent likelihood of each option being selected'
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="apple-button-primary text-body flex-1"
              disabled={!questionText.trim() || options.filter(o => o.text.trim()).length < 2}
            >
              {editingIndex !== null ? 'Update Question' : 'Add Question'}
            </button>

            {(isExpanded && editingIndex === null) && (
              <button
                type="button"
                onClick={handleCancel}
                className="apple-button-secondary text-body"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}