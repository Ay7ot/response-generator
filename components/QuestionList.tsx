import { Question } from './ResponseGenerator'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

interface QuestionListProps {
  questions: Question[]
  onRemoveQuestion: (index: number) => void
}

export default function QuestionList({ questions, onRemoveQuestion }: QuestionListProps) {
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
      <Slider {...settings}>
        {questions.map((question, index) => (
          <div key={index} className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Question {index + 1}: {question.text}</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Type: {question.type === 'single' ? 'Single Choice' : 'Multiple Choice'}</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Option {optionIndex + 1}</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{option}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button
                onClick={() => onRemoveQuestion(index)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  )
}

function SampleNextArrow(props: { className?: string; style?: React.CSSProperties; onClick?: () => void }) {
  const { className, style, onClick } = props
  return (
    <div
      className={`${className} slick-next`}
      style={{ ...style, display: 'block', background: 'gray', borderRadius: '50%' }}
      onClick={onClick}
    />
  )
}

function SamplePrevArrow(props: { className?: string; style?: React.CSSProperties; onClick?: () => void }) {
  const { className, style, onClick } = props
  return (
    <div
      className={`${className} slick-prev`}
      style={{ ...style, display: 'block', background: 'gray', borderRadius: '50%' }}
      onClick={onClick}
    />
  )
}