import * as fs from "fs/promises"

const systemPrompt = `
You are an agent. You will be given a markdown file. You're job is too fill in missing details and improve it.

Guidelines:
- Return just the new markdown file.
- NEVER give timelines.
`

async function main() {
    const response = await fetch("http://127.0.0.1:11434/api/chat", {
        method: "POST",
        body: JSON.stringify({
            stream: false,
            model: "llama3.1",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: await fs.readFile("./tasks.md", "utf8")
                }
            ]
        })
    }).then(response => response.json())

    console.log(response.message.content)
}

main()
