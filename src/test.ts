import fs from "fs";

let version = 0

const goal = `
Write a function that takes a goal and the uses's current code and returns a new improved version.
`.trim()

async function recursive_improvement() {
    while (true) {
        const code = fs.readFileSync(`./src/versions/${version}.js`, "utf-8")
        const improve = await import(`./versions/${version}.js`)
        const new_code = await improve.default(goal, code)
        console.log(new_code)
        version += 1
        fs.writeFileSync(`./src/versions/${version}.md`, new_code)
        fs.writeFileSync(`./src/versions/${version}.js`, extract_code(new_code))
    }
}

function extract_code(response: string): string {
    // Extract code from a code block
    const code = response.match(/```[a-zA-Z]*\n([\s\S]*?)\n```/);
    if (code) {
        return code[1]
    }
    // If no code block is found, return the original response
    return response
}

recursive_improvement()
