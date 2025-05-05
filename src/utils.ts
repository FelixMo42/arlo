import { readFile } from "node:fs/promises";

export interface Message {
    role: "system" | "user" | "assistant",
    content: string
}

export async function chatJSON<T>(messages: Message[]): Promise<T> {
    const response = await chat(messages)
    try {
        return JSON.parse(response) as T
    } catch (e) {
        console.log("ERR: Failed to parse", response)
        throw e
    }
}

export async function chat(messages: Message[]): Promise<string> {
    const response = await fetch("http://127.0.0.1:11434/api/chat", {
        method: "POST",
        body: JSON.stringify({
            stream: false,
            model: "gemma3:27b",
            messages
        })
    }).then(response => response.json())

    try {
        return response.message.content
    } catch {
        console.error("Can't read .message.content from ", response)
    }
}

export async function readJSON<T>(path: string): Promise<T> {
    const text = await readFile(path, "utf-8")
    return JSON.parse(text)
}

function dotProduct(vector1: number[], vector2: number[]): number {
    return vector1.reduce((acc, current, index) => acc + current *
        vector2[index], 0);
}

function magnitude(vector: number[]): number {
    const sumOfSquares = vector.reduce((acc, current) => acc + Math.pow(current, 2), 0)
    return Math.sqrt(sumOfSquares)
}

export function cosineSimilarity(vector1: number[], vector2: number[]): number {  
    const dot = dotProduct(vector1, vector2)
    const magnitude1 = magnitude(vector1)
    const magnitude2 = magnitude(vector2)
    return dot / (magnitude1 * magnitude2)
}

export async function embed(input: string): Promise<number[]>;
export async function embed(input: string[]): Promise<number[][]>;
export async function embed(input: string | string[]): Promise<number[] | number[][]> {
    const response = await fetch("http://localhost:11434/api/embed", {
        method: "POST",
        body: JSON.stringify({
            model: "nomic-embed-text",
            input: input
        })
    }).then(response => response.json())

    if (typeof input === "string") {
        return response.embeddings[0]
    } else {
        return response.embeddings
    }
}
