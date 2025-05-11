import { readFile } from "node:fs/promises";

export async function filterAsync<T>(array: T[], filter: (item: T) => Promise<boolean>): Promise<T[]> {
    const results = await Promise.all(array.map(filter))
    return array.filter((_, index) => results[index])
}

export async function mapAsync<T, U>(array: T[], map: (item: T) => Promise<U>): Promise<U[]> {
    const results = await Promise.all(array.map(map))
    return results
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
