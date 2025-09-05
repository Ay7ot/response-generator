// Google Forms utilities for response generation

export interface QuestionData {
    id: string
    type: number
    options: string[]
}

export interface FormData {
    [questionText: string]: QuestionData
}

export interface ResponseConfig {
    [questionText: string]: { [option: string]: number } | string
}

// Weighted random selection
export function weightedChoice(options: { [key: string]: number }, questionType?: number): string {
    const keys = Object.keys(options)
    const weights = Object.values(options)

    // If all weights are 0, use uniform distribution
    if (weights.every(w => w === 0)) {
        return keys[Math.floor(Math.random() * keys.length)]
    }

    // Check for partial specification (some weights set, others at 0)
    const zeroWeightsCount = weights.filter(w => w === 0).length
    if (zeroWeightsCount > 0 && zeroWeightsCount < keys.length) {
        // Some weights specified, others are 0
        const specifiedTotal = weights.reduce((sum, w) => sum + (w > 0 ? w : 0), 0)

        if (questionType === QUESTION_TYPES.MCQ && specifiedTotal < 100) {
            // Single choice: randomly distribute remaining percentage among unspecified options
            const remainingPercentage = 100 - specifiedTotal
            const unspecifiedKeys = keys.filter((key, index) => weights[index] === 0)
            const randomWeights = generateRandomWeights(remainingPercentage, unspecifiedKeys.length)

            const finalWeights: { [key: string]: number } = {}
            let weightIndex = 0
            keys.forEach((key, index) => {
                if (weights[index] === 0) {
                    finalWeights[key] = randomWeights[weightIndex]
                    weightIndex++
                } else {
                    finalWeights[key] = weights[index]
                }
            })
            return weightedChoice(finalWeights, questionType)
        } else {
            // Multiple choice or already at 100%: keep as-is for specified, random for unspecified
            const finalWeights: { [key: string]: number } = {}
            keys.forEach((key, index) => {
                if (weights[index] === 0) {
                    finalWeights[key] = Math.floor(Math.random() * 100) + 1
                } else {
                    finalWeights[key] = weights[index]
                }
            })
            return weightedChoice(finalWeights, questionType)
        }
    }

    // All weights specified - use normal weighted selection
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    let random = Math.random() * totalWeight

    for (let i = 0; i < keys.length; i++) {
        random -= weights[i]
        if (random <= 0) {
            return keys[i]
        }
    }

    return keys[keys.length - 1] // fallback
}

// Generate random weights that sum to a specific total
export function generateRandomWeights(total: number, count: number): number[] {
    if (count === 0) return []
    if (count === 1) return [total]

    const weights: number[] = []

    // Generate random values for all but the last one
    for (let i = 0; i < count - 1; i++) {
        // Use a minimum of 1% to ensure each option has some chance
        const minValue = 1
        const maxValue = total - (count - i - 1) * minValue // Ensure remaining can be distributed
        const randomValue = Math.random() * (maxValue - minValue) + minValue
        weights.push(randomValue)
        total -= randomValue
    }

    // Last weight gets whatever is remaining
    weights.push(total)

    return weights
}

// Generate random text
export function generateRandomText(length: number = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

// Generate random integer within range
export function generateRandomInt(min: number, max: number): string {
    return Math.floor(Math.random() * (max - min + 1) + min).toString()
}

// Generate a single response payload
export function generateResponse(formData: FormData, config: ResponseConfig): Record<string, string> {
    const payload: Record<string, string> = {}

    for (const [questionText, meta] of Object.entries(formData)) {
        const entryId = meta.id
        const configValue = config[questionText]

        if (typeof configValue === 'object' && configValue !== null) {
            // Weighted multiple choice
            payload[entryId] = weightedChoice(configValue, meta.type)
        } else if (typeof configValue === 'string') {
            const rule = configValue

            if (rule.startsWith('random_int:')) {
                const [min, max] = rule.split(':')[1].split('-').map(Number)
                payload[entryId] = generateRandomInt(min, max)
            } else if (rule === 'random_text') {
                payload[entryId] = generateRandomText()
            } else if (rule.startsWith('fixed:')) {
                payload[entryId] = rule.split(':', 1)[1]
            } else {
                payload[entryId] = rule // treat as fixed value
            }
        } else {
            payload[entryId] = '' // fallback
        }
    }

    return payload
}

// Generate template config for a form
export function generateResponseTemplate(formData: FormData): ResponseConfig {
    const config: ResponseConfig = {}

    for (const [questionText, meta] of Object.entries(formData)) {
        if (meta.options && meta.options.length > 0) {
            // Create weighted options with default 0 weights
            config[questionText] = {}
            for (const option of meta.options) {
                (config[questionText] as { [key: string]: number })[option] = 0
            }
        } else {
            // Default strategy for open text questions
            config[questionText] = 'random_text'
        }
    }

    return config
}

// Parse Google Form URL
export async function parseGoogleForm(formUrl: string): Promise<FormData> {
    const response = await fetch('/api/google-forms/parse', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formUrl }),
    })

    if (!response.ok) {
        throw new Error('Failed to parse form')
    }

    const result = await response.json()

    if (!result.success) {
        throw new Error(result.error || 'Failed to parse form')
    }

    return result.data
}

// Submit response to Google Form
export async function submitGoogleFormResponse(formUrl: string, payload: Record<string, string>): Promise<void> {
    const response = await fetch('/api/google-forms/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formUrl, payload }),
    })

    if (!response.ok) {
        throw new Error('Failed to submit response')
    }

    const result = await response.json()

    if (!result.success) {
        throw new Error(result.error || 'Failed to submit response')
    }
}

// Question type constants (matching Google Forms)
export const QUESTION_TYPES = {
    TEXT: 0,
    MCQ: 2,
    CHECKBOX: 3,
    DROPDOWN: 4,
    SCALE: 5,
} as const
