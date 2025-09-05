import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { formUrl } = await request.json()

        if (!formUrl) {
            return NextResponse.json(
                { success: false, error: 'Form URL is required' },
                { status: 400 }
            )
        }

        // Fetch the Google Form
        const response = await fetch(formUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        })

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: 'Failed to fetch form' },
                { status: 400 }
            )
        }

        const html = await response.text()

        // Extract the FB_PUBLIC_LOAD_DATA_ script
        const scriptMatch = html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*(\[.*?\]);/)
        if (!scriptMatch) {
            return NextResponse.json(
                { success: false, error: 'Could not find form data in page' },
                { status: 400 }
            )
        }

        const rawData = scriptMatch[1]
        const data = JSON.parse(rawData)

        const questions = data[1][1]
        const parsed: Record<string, {
            id: string
            type: number
            options: string[]
        }> = {}

        for (const q of questions) {
            if (!q || !Array.isArray(q)) continue

            try {
                const q_text = q[1] // question text
                const q_type = q[3] // question type
                const answers_block = q[4]

                let entry_id = null
                let options: string[] = []

                if (answers_block && Array.isArray(answers_block) && answers_block.length > 0) {
                    entry_id = answers_block[0][0]

                    // Extract options if present
                    if (answers_block[0].length > 1 && answers_block[0][1]) {
                        options = answers_block[0][1]
                            .filter((opt: unknown[]): opt is [string, ...unknown[]] => Array.isArray(opt) && opt.length > 0 && typeof opt[0] === 'string')
                            .map((opt: [string, ...unknown[]]) => opt[0])
                    }
                }

                if (entry_id) {
                    parsed[q_text] = {
                        id: `entry.${entry_id}`,
                        type: q_type,
                        options: options
                    }
                }
            } catch (error) {
                console.error('Error parsing question:', error)
                continue
            }
        }

        return NextResponse.json({
            success: true,
            data: parsed
        })

    } catch (error) {
        console.error('Error parsing Google Form:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to parse form' },
            { status: 500 }
        )
    }
}
