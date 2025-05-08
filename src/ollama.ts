const OLLAMA_URL = "http://127.0.0.1:11434"
const CHAT_MODEL = "gemma3:12b-it-qat"
const EMBED_MODEL = "nomic-embed-text"

export interface Message {
    role: "system" | "user" | "assistant",
    content: string
}

export async function chatJSON<T>(messages: Message[]): Promise<T> {
    let response = await chat(messages)

    try {
        if (response.startsWith("```json")) {
            response = response.slice(7, -3)
        } else if (response.startsWith("```")) {
            response = response.slice(3, -3)
        }

        return JSON.parse(response) as T
    } catch (e) {
        console.log("ERR: Failed to parse", response)
        throw e
    }
}


export async function chat(messages: Message[]): Promise<string> {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        body: JSON.stringify({
            stream: false,
            model: CHAT_MODEL,
            messages
        })
    }).then(response => response.json())

    try {
        return response.message.content
    } catch {
        console.error("Can't read .message.content from ", response)
        return "ERROR!"
    }
}

export async function embed(input: string): Promise<number[]>;
export async function embed(input: string[]): Promise<number[][]>;
export async function embed(input: string | string[]): Promise<number[] | number[][]> {
    const response = await fetch(`${OLLAMA_URL}/api/embed`, {
        method: "POST",
        body: JSON.stringify({
            model: EMBED_MODEL,
            input: input
        })
    }).then(response => response.json())

    if (typeof input === "string") {
        return response.embeddings[0]
    } else {
        return response.embeddings
    }
}
