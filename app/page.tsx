import ResponseGenerator from '@/components/ResponseGenerator'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 px-4 sm:px-6 lg:px-8 w-full max-w-4xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg rounded-3xl sm:p-20">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">Research Question Response Generator</h1>
          <ResponseGenerator />
        </div>
      </div>
    </div>
  )
}
