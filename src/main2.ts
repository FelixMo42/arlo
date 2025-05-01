import { readFile } from "node:fs/promises";
import { chatJSON, } from "./utils.ts"

const systemPrompt = `
You are a reaserch assistant.
You're job is too figure out implementaion details.

When given a project suggest changes to make to it.
Format: {
    "reason": "<why are you doing this edit?>",
    "mode": "replace" | "insert before" | "insert after",
    "target": "<the text to target>",
    "text": "<the new text>",
}

Guidelines:
* ONLY suggest ONE edit
* ONLY return Json, NO boilerplate
`

async function main() {
    const project = await readFile("./project.md", "utf8")

    const diff = await chatJSON<string[]>([
        {
            role: "system",
            content: systemPrompt
        },
        {
            role: "user",
            content: project
        }
    ])

    console.log(diff)

    // writeFile("./project.md", project)

    // const task = await readJSON<Task>("./tasks.json")
    // task.steps = await plan(task.text)
    // writeFile("./tasks.json", JSON.stringify(task, null, "\t"))
}

main()
