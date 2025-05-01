import { chatJSON } from "../utils.ts";

export interface Task {
    text: string,
    steps: Task[]
}

const systemPrompt = `
You're job is to decompose steps into sub steps.

Format:
[
    {
        "reason": "<why this step?>",
        "step": "<what is this step?>"
    }
]

Guidelines:
- If possible steps should be actionable by AI without need for human oversight.
- ONLY return json, no boilerplate.
- NEVER give timelines.
`

export async function plan(step: string): Promise<Task[]> {
    const response = await chatJSON<{ step: string, reason: string }[]>([
        {
            role: "system",
            content: systemPrompt
        },
        {
            role: "user",
            content: `Step: ${step}`
        }
    ])
    
    return response.map(({ step }) => ({
        text: step, steps: []
    }))
}
