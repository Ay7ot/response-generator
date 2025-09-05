import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { formUrl, payload } = await request.json()

        if (!formUrl || !payload) {
            return NextResponse.json(
                { success: false, error: 'Form URL and payload are required' },
                { status: 400 }
            )
        }

        // Convert viewform to formResponse
        const postUrl = formUrl.replace('/viewform', '/formResponse')

        // Submit the response
        const response = await fetch(postUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: new URLSearchParams(payload)
        })

        if (response.ok) {
            return NextResponse.json({
                success: true,
                message: 'Response submitted successfully'
            })
        } else {
            return NextResponse.json(
                { success: false, error: `Submission failed: ${response.status}` },
                { status: 400 }
            )
        }

    } catch (error) {
        console.error('Error submitting response:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to submit response' },
            { status: 500 }
        )
    }
}
