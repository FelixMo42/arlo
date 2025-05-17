import { chat } from "../ollama";

const IMPROVE_CODE_SYSTEM_PROMPT = `
You are an expert in agentic AI system design.
You will be given a prompt and current code.
You will write a new improved code.

Guidelines:
1. Think step by step.
2. Write the code in a code block.
3. Follow the given format

Format:
# Understand
<explain how the current code as it relates to the users goal>

# Critisize
<Think of one way the code could better achive it's goal. Think step by step>

# Plan
<Think of a plan for implementing that change. Think step by step>

# Code
\`\`\`js
<improved code>
\`\`\`
`

/**
 * 
 * @param {string} goal the user's goal
 * @param {string} current_code the use's current code, or a markdown document including the improved code.
 * @returns the new code
 */
export default async function improveCode(goal, current_code) {
    // Use ollama to improve the code
    // Retunrs the new code
    return chat([
        {
            role: "system",
            content: IMPROVE_CODE_SYSTEM_PROMPT
        },
        {
            role: "user",
            content: `
                **Goal:** ${goal}
                **Current code:** ${current_code}
            `
        }
    ])
}
