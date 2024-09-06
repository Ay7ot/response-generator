'use client'

import { useState, FormEvent } from 'react'

interface ResponseFormProps {
  onSubmit: (email: string, numResponses: number) => void
}

export default function ResponseForm({ onSubmit }: ResponseFormProps) {
  const [email, setEmail] = useState('')
  const [numResponses, setNumResponses] = useState(1)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(email, numResponses)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block mb-2">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 w-full outline-none"
        />
      </div>
      <div>
        <label htmlFor="num-responses" className="block mb-2">Number of Responses</label>
        <input
          id="num-responses"
          type="number"
          min="1"
          value={numResponses}
          onChange={(e) => setNumResponses(parseInt(e.target.value))}
          required
          className="border p-2 w-full outline-none"
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Generate Responses
      </button>
    </form>
  )
}