import { readFile, writeFile } from "node:fs/promises"

export async function cache(url: string): Promise<string> {
    return withCache(url, () => fetch(url).then(r => r.text()))
}

type AsJson<T> = 
  T extends string | number | boolean | null ? T : 
  T extends Function ? never : 
  T extends object ? { [K in keyof T]: AsJson<T[K]> } : 
  never;

export async function withCache<A, T>(data: A & AsJson<T>, cb: (a: A) => Promise<T & AsJson<T>>): Promise<T> {
    const path = await getCachePath(data)

    return readFile(path, "utf-8")
        .then((text) => JSON.parse(text))
        .catch(async () => {
            const result = await cb(data)
            writeFile(path, JSON.stringify(result))
            return result
        })
}

async function getCachePath(request: any): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(JSON.stringify(request))
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return `./out/.cache/${hashHex}.cache`
}
