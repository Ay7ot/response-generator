import FileUpload from '@/components/FileUpload'
import ResponseForm from '@/components/ResponseForm'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Research Question Response Generator</h1>
      <FileUpload />
      <ResponseForm />
    </main>
  )
}