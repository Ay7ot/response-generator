'use client'

import { useState } from 'react'

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  return (
    <div className="mb-4">
      <label htmlFor="file-upload" className="block mb-2">Upload Questions (.txt file)</label>
      <input
        id="file-upload"
        type="file"
        accept=".txt"
        onChange={handleFileChange}
        className="border p-2"
      />
    </div>
  )
}