'use client'

import { useState } from 'react'

export default function ResponseForm() {
  const [email, setEmail] = useState('')
  const [numResponses, setNumResponses] = useState(1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement form submission logic
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
          className="border p-2 w-full"
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
          className="border p-2 w-full"
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Generate Responses
      </button>
    </form>
  )
}