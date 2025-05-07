import { writeFile } from "node:fs/promises";
import { chat, Message } from "./utils.ts";

const user = `
**Goal:** I'm make an autonomous, task-oriented AI assistant tool that can do research for me while I'm asleep, focusing on quality over speed. This is a learning project, so I want to make as much as I can my self without use libraries or servies. The whole thing should be locally hosted on my laptop.

**Implementation:** The plan is to implement my own multi-agent framework in the style of autogen using ollama and ts.

**Needed features:**
* Site sources
* Reaserch web

**Questions:** What is the best way to build this? What are the techniques and concepts I need to understand to make this?
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

        writeFile("./out/log.md", messages.map(message => message.content).join("\n\n"))
    }
}

main()
