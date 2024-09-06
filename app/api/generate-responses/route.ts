import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function POST(req: NextRequest) {
  try {
    const { topic, questions, numResponses } = await req.json()

    // Generate responses
    const responses = generateResponses(questions, numResponses)

    // Generate Excel file
    const excelBuffer = await generateExcel(topic, questions, responses)

    // Create a Blob from the buffer
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

    // Generate a unique filename
    const sanitizedTopic = topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const fileName = `responses_${sanitizedTopic}_${Date.now()}.xlsx`

    // Return the file as a downloadable response
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, message: 'An error occurred' }, { status: 500 })
  }
}

function generateResponses(questions: { text: string, type: string, options: string[] }[], numResponses: number): string[][] {
  // TODO: Implement actual response generation logic
  // This is a placeholder that generates random responses
  return questions.map(q => 
    Array(numResponses).fill(0).map(() => q.options[Math.floor(Math.random() * q.options.length)])
  )
}

async function generateExcel(topic: string, questions: { text: string, type: string, options: string[] }[], responses: string[][]): Promise<Buffer> {
  const workbook = XLSX.utils.book_new()
  
  // Metadata sheet
  const metadataWs = XLSX.utils.aoa_to_sheet([
    ['Research Topic', topic],
    ['Number of Questions', questions.length],
    ['Number of Responses per Question', responses[0].length],
  ])
  XLSX.utils.book_append_sheet(workbook, metadataWs, 'Metadata')

  // Questions sheet
  const questionsData = [
    ['Question Number', 'Question Text', 'Question Type', 'Options'],
    ...questions.map((q, i) => [i + 1, q.text, q.type, q.options.join(', ')])
  ]
  const questionsWs = XLSX.utils.aoa_to_sheet(questionsData)
  XLSX.utils.book_append_sheet(workbook, questionsWs, 'Questions')

  // Responses sheet
  const responsesData = [
    ['Question Number', ...Array(responses[0].length).fill(0).map((_, i) => `Response ${i + 1}`)],
    ...responses.map((r, i) => [i + 1, ...r])
  ]
  const responsesWs = XLSX.utils.aoa_to_sheet(responsesData)
  XLSX.utils.book_append_sheet(workbook, responsesWs, 'Responses')

  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  return excelBuffer
}