import { createClient } from "@libsql/client";
import { chat, Message } from "./ollama";

export const db = createClient({
    url: "file:out/local.db"
})

async function init_db() {
    await db.batch([
        `CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp INTEGER NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL
        )`
    ], "write")
}

init_db()

const SYSTEM_PROMPT = `
You are a helpful assistant.
You will be given a question and you will answer it.
If you don't know the answer, say "I don't know".
`

async function add_message_to_db(role: string, content: string) {
    await db.execute("INSERT INTO messages (timestamp, role, content) VALUES (?, ?, ?)", [
        Date.now(),
        role,
        content
    ])
}

function write_code(prompt: string, current_code: string): string {
    // The goal is to write  a function that takes a prompt and current code and returns a new improved code

    const response = chat([
        {
            role: "system",
            content: `
                You are a helpful assistant.
                You will be given a prompt and current code.
                You will write a new improved code.
            `
        }
    ])
}

async function main() {    
    const q = prompt(">", "")!
    add_message_to_db("user", q)

    const messages = await db.execute("SELECT * FROM messages ORDER BY id DESC")
    console.log(messages.rows)

    const response = await chat([
        {
            role: "system",
            content: SYSTEM_PROMPT
        },
        ...messages.rows as unknown as Message[]
    ])
    console.log(response)
    
    add_message_to_db("assistant", response)
}

main()
