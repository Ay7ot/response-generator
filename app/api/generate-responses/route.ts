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

function generateResponses(questions: { text: string, type: string, options: { text: string; percentage: number }[] }[], numResponses: number): string[][] {
  return questions.map(q => {
    if (q.type === 'multiple') {
      return Array(numResponses).fill(0).map(() => {
        const selectedOptions = new Set<string>()
        let totalPercentage = 0;

        // Generate responses based on specified percentages
        while (selectedOptions.size < Math.floor(Math.random() * q.options.length) + 1) {
          const randomValue = Math.random() * 100;
          totalPercentage = 0;

          for (const option of q.options) {
            totalPercentage += option.percentage;
            if (randomValue <= totalPercentage) {
              selectedOptions.add(option.text);
              break;
            }
          }
        }
        return Array.from(selectedOptions).join(', ')
      })
    } else {
      return Array(numResponses).fill(0).map(() => {
        const randomValue = Math.random() * 100;
        let totalPercentage = 0;

        for (const option of q.options) {
          totalPercentage += option.percentage;
          if (randomValue <= totalPercentage) {
            return option.text;
          }
        }
        return ''; // Fallback in case no option is selected
      })
    }
  })
}

async function generateExcel(topic: string, questions: { text: string, type: string, options: { text: string; percentage: number }[] }[], responses: string[][]): Promise<Buffer> {
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
    ['Question Number', 'Question Text', 'Question Type', 'Options', 'Percentages'],
    ...questions.map((q, i) => [
      (i + 1).toString(),
      q.text,
      q.type,
      q.options.map(o => o.text).join(', '),
      q.options.map(o => o.percentage).join(', ')
    ])
  ]
  const questionsWs = XLSX.utils.aoa_to_sheet(questionsData)
  questionsWs['!cols'] = getColumnWidths(questionsData)
  XLSX.utils.book_append_sheet(workbook, questionsWs, 'Questions')

  // Responses sheet
  const responsesData = [
    ['Question Number', ...Array(responses[0].length).fill(0).map((_, i) => `Response ${i + 1}`)],
    ...responses.map((r, i) => [(i + 1).toString(), ...r])
  ]
  const responsesWs = XLSX.utils.aoa_to_sheet(responsesData)
  responsesWs['!cols'] = getColumnWidths(responsesData)
  XLSX.utils.book_append_sheet(workbook, responsesWs, 'Responses')

  // SPSS sheet
  const spssData = [
    ['Respondent', ...questions.map(q => q.text)],
    ...Array(responses[0].length).fill(0).map((_, i) => [
      (i + 1).toString(),
      ...responses.map(r => r[i])
    ])
  ]
  const spssWs = XLSX.utils.aoa_to_sheet(spssData)
  spssWs['!cols'] = getColumnWidths(spssData)
  XLSX.utils.book_append_sheet(workbook, spssWs, 'SPSS')

  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  return excelBuffer
}

function getColumnWidths(data: string[][]): { wch: number }[] {
  return data[0].map((_, colIndex) => {
    const maxLength = data.reduce((max, row) => Math.max(max, (row[colIndex] || '').toString().length), 0)
    return { wch: maxLength + 2 } // Adding some padding
  })
}