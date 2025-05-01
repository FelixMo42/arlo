import { writeFile } from "node:fs/promises";
import { chat, Message } from "./utils.ts";

const user = `
**Goal:** I'm make an autonomous, task-oriented AI assistant tool that can help work on my research, writing & coding tasks while the I'm asleep, focusing on quality over speed.

**Implementation:** The plan is to implement my own multi-agent framework in the style of autogen using ollama and ts. Right now it consists of a teacher and a student talking to each other about the desired task.

**Issues:** I have a markdown document I want them to work out. Can you walk me threw an example of how they would get the document, reaserch missing details, and update it? Ideally while rewriting the least possible. Assume error handling is not a problem.
`.trim()

const agents = [
    `You are a wise expert in llm agents. You are giving your best advice how to build the system. Start every response with TEACHER:`,
    `You are a curious student trying their best to learn and question everything. You main interest is understanding the specifics of how things work. Start every response with STUDENT:`
]

async function main() {
    const messages: Message[] = [
        {
            role: "user",
            content: user
        }
    ]
    
    for (let i = 0; i < 10; i++) {
        const response = await chat([
            {
                role: "system",
                content: agents[i % 2]
            },
            ...messages
        ])

        console.log(response, "\n")

        messages.push({
            role: "user",
            content: response
        })

        writeFile("./log.md", messages.map(message => message.content).join("\n\n"))
    }
}

main()