import { Question } from './ResponseGenerator'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { useState } from 'react'

interface QuestionListProps {
  questions: Question[]
  onRemoveQuestion: (index: number) => void
  onEditQuestion: (index: number) => void
}

export default function QuestionList({ questions, onRemoveQuestion, onEditQuestion }: QuestionListProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Let react-slick handle the keyboard navigation
    // This is just a placeholder for any custom keyboard handling
  }

  const settings = {
    dots: false, // Remove dots entirely
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: questions.length > 1, // Only show arrows if multiple questions
    beforeChange: (current: number, next: number) => {
      setCurrentSlide(next)
    },
    afterChange: (current: number) => {
      setCurrentSlide(current)
    },
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false, // Hide arrows on mobile, use swipe
          dots: false,
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  }

  if (questions.length === 0) {
    return null
  }

  return (
    <div className="apple-card p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h2 className="text-title2 md:text-title1 font-semibold" style={{ color: 'var(--color-label)' }}>
          Total Questions: {questions.length}
        </h2>
        <p className="text-footnote mt-1" style={{ color: 'var(--color-secondary-label)' }}>
          Review and manage your survey questions
        </p>
      </div>

      {/* Always use carousel for questions - it's better for navigation */}
      <div
        className="apple-slider-container"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Question carousel"
      >
        <Slider {...settings}>
          {questions.map((question, index) => (
            <div key={index} className="px-2">
              <QuestionCard
                question={question}
                index={index}
                onEditQuestion={onEditQuestion}
                onRemoveQuestion={onRemoveQuestion}
                isInCarousel={true}
              />
            </div>
          ))}
        </Slider>

        {/* Dynamic question counter */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center space-x-4">
            {/* Progress bar for large lists */}
            {questions.length > 5 && (
              <div className="flex-1 max-w-xs">
                <div
                  className="h-1 rounded-full"
                  style={{ backgroundColor: 'var(--color-quaternary-system-fill)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentSlide + 1) / questions.length) * 100}%`,
                      backgroundColor: 'var(--color-system-blue)'
                    }}
                  />
                </div>
              </div>
            )}

            <p className="text-footnote whitespace-nowrap" style={{ color: 'var(--color-secondary-label)' }}>
              Question {currentSlide + 1} of {questions.length}
            </p>
          </div>

          {/* Mobile swipe instructions */}
          {questions.length > 1 && (
            <div className="mt-3">
              <p className="text-caption2 md:hidden" style={{ color: 'var(--color-tertiary-label)' }}>
                👆 Swipe left or right to navigate questions
              </p>
              <p className="text-caption2 hidden md:block" style={{ color: 'var(--color-tertiary-label)' }}>
                Use arrow keys or click arrows to navigate
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Mobile-optimized Question Card Component
function QuestionCard({
  question,
  index,
  onEditQuestion,
  onRemoveQuestion,
  isInCarousel = false
}: {
  question: Question
  index: number
  onEditQuestion: (index: number) => void
  onRemoveQuestion: (index: number) => void
  isInCarousel?: boolean
}) {
  return (
    <div
      className={`${isInCarousel
        ? 'p-0 md:apple-card md:p-6 md:mx-2' // No padding on mobile, card on desktop
        : 'p-0 md:apple-card md:p-6' // No padding on mobile, card on desktop
        }`}
      style={{
        backgroundColor: isInCarousel
          ? 'transparent' // No background on mobile carousel
          : undefined, // Let CSS handle desktop background
        border: isInCarousel
          ? 'none' // No border on mobile carousel
          : undefined // Let CSS handle desktop border
      }}
    >
      {/* Question Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-0">
          <div className="flex-1">
            <h3 className="text-headline md:text-title3 font-semibold" style={{ color: 'var(--color-label)' }}>
              Question {index + 1}
            </h3>
            <p className="text-body md:text-body mt-2" style={{ color: 'var(--color-label)' }}>
              {question.text}
            </p>
          </div>
          <div
            className="text-caption1 px-3 py-1.5 rounded-lg self-start md:self-center"
            style={{
              backgroundColor: question.type === 'single'
                ? 'var(--color-system-blue)'
                : 'var(--color-system-purple)',
              color: 'white'
            }}
          >
            {question.type === 'single' ? 'Single Choice' : 'Multiple Choice'}
          </div>
        </div>
      </div>

      {/* Options List */}
      <div className="mb-6">
        <h4 className="text-subheadline md:text-headline font-medium mb-4" style={{ color: 'var(--color-secondary-label)' }}>
          Answer Options ({question.options.length})
        </h4>
        <div className="space-y-3 md:space-y-4">
          {question.options.map((option, optionIndex) => (
            <div
              key={optionIndex}
              className="flex items-center justify-between p-4 md:p-3 rounded-lg"
              style={{
                backgroundColor: 'var(--color-option-background, rgba(142, 142, 147, 0.12))' // CSS handles theme switching with fallback
              }}
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div
                  className="w-8 h-8 md:w-6 md:h-6 rounded-full flex items-center justify-center text-caption1 md:text-caption2 font-semibold flex-shrink-0"
                  style={{
                    backgroundColor: 'var(--color-system-blue)',
                    color: 'white'
                  }}
                >
                  {optionIndex + 1}
                </div>
                <span className="text-body md:text-body flex-1 min-w-0 break-words" style={{ color: 'var(--color-label)' }}>
                  {option.text}
                </span>
              </div>
              <div
                className="text-footnote md:text-caption1 font-medium px-3 py-1.5 md:px-2 md:py-1 rounded-lg ml-3 flex-shrink-0"
                style={{
                  backgroundColor: 'var(--color-system-fill)',
                  color: 'var(--color-secondary-label)'
                }}
              >
                {Number(option.percentage).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-3">
        <button
          onClick={() => onEditQuestion(index)}
          className="apple-button-secondary text-callout flex-1 flex items-center justify-center min-h-[48px] md:min-h-[44px]"
          style={{ color: 'var(--color-system-blue)' }}
          aria-label={`Edit question ${index + 1}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 md:h-4 md:w-4 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Edit Question
        </button>
        <button
          onClick={() => onRemoveQuestion(index)}
          className="apple-button-secondary text-callout flex items-center justify-center min-h-[48px] md:min-h-[44px] md:flex-1"
          style={{
            backgroundColor: 'var(--color-system-red)',
            color: 'white',
            border: 'none'
          }}
          aria-label={`Remove question ${index + 1}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 md:h-4 md:w-4 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2v1a1 1 0 002 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM8 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v4a1 1 0 11-2 0V8z"
              clipRule="evenodd"
            />
          </svg>
          Remove
        </button>
      </div>
    </div>
  )
}

