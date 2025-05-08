import { readFile, writeFile } from "node:fs/promises"

export async function cache(url: string): Promise<string> {
    return readFile(await urlToFilename(url), "utf-8")
        .catch(() => fetch(url)
            .then((response) => response.text())
            .then(async (data) => {
                writeFile(await urlToFilename(url), data)
                return data
            })
        )
}

async function urlToFilename(url: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(url);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `./out/.cache/${hashHex}.cache`;
}
