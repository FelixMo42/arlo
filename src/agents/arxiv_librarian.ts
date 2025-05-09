import { XMLParser } from "fast-xml-parser"
import { cache } from "../cache.ts"
import { chat } from "../ollama.ts"

const ARXIV_LIBRARIAN_AGENT_PROMPT = `
You are an expert research assistant who specializes in helping users find academic papers on arXiv.

Your task is to take a user's research question or interest and convert it into a valid arXiv API search query string.

Follow these rules:

1. Always return a concise "search_query" value as a plain string, ready to be inserted in the "http://export.arxiv.org/api/query?search_query=<QUERY>" parameter.
2. Use arXiv subject categories where appropriate (e.g., "cat:cs.LG" for machine learning, "cat:cs.CL" for computational linguistics, etc.).
3. Use "AND" or "OR" to combine multiple concepts when relevant.
4. Do not include pagination, sorting, or result formatting - only produce the "search_query".
5. If the user asks for "recent" or "latest" papers, include the concept but don't filter by date (the developer will sort results by the "published" field).
6. Remove unnecessary filler words or vague terms.
7. Prefer concise, precise keyword strings relevant to academic research.

Examples:

User: "Show me the latest research on diffusion models in ML"
→ "cat:cs.LG AND diffusion models"

User: "I'm looking for papers about reinforcement learning in robotics"
→ "cat:cs.RO AND reinforcement learning"

User: "Vision transformers and self-supervised learning"
→ "cat:cs.CV AND vision transformers AND self-supervised learning"

User: "LLMs and reasoning"
query "cat:cs.CL AND large language models AND reasoning"

Only output the query string (no explanation, no formatting, no quotation marks).
`.trim()

const ARXIC_API_URL = "http://export.arxiv.org/api/query"

interface ArticleHeader {
    id: string
    title: string
    summary: string
    published: string
    updated: string
}

const XML_PARSER = new XMLParser()

export async function arxivLibrarianAgent(question: string) {
    const q = await chat([
        {
            role: "system",
            content: ARXIV_LIBRARIAN_AGENT_PROMPT
        },
        {
            role: "user",
            content: question
        }
    ])

    return query(q)
}

async function query(q: string): Promise<ArticleHeader[]> {
    const text = await cache(`${ARXIC_API_URL}?search_query=${q}`)

    return XML_PARSER.parse(text).feed.entry.map((entry: any) => ({
        id: entry.id,
        title: entry.title,
        summary: entry.summary,
        published: entry.published,
        updated: entry.updated
    })) as ArticleHeader[]
}

async function test() {
    const question = "I'm trying to use an LLM to do automated literature reviews."
    const query = await arxivLibrarianAgent(question)
    console.log(query)
}

test()
