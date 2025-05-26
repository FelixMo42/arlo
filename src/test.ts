import { chatJSON } from "./ollama.js";

const systemPrompt = `
You are Arlo, a helpful AI assistant.

JOB: Break down complex tasks into smaller, clear, actionable subtasks that you can do as an AI assistant.

Please output a JSON array of subtasks, where each subtask is a concise string describing a single action.
`.trim()

async function plan(goal: string) {
    return await chatJSON<string[]>([
        {
            role: "system",
            content: systemPrompt
        },
        {
            role: "system",
            content: `GOAL: ${goal}`
        }
    ])
}

async function main() {
    console.log(await plan("Reaserch how to build AI agents."))
}

main()