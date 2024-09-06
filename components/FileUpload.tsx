'use client'

import { ChangeEvent } from 'react'

interface FileUploadProps {
  onFileChange: (file: File | null) => void
}

export default function FileUpload({ onFileChange }: FileUploadProps) {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFileChange(e.target.files[0])
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