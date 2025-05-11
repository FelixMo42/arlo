import { XMLParser } from "fast-xml-parser"
import { cache, withCache } from "../cache.ts"
import { doTask } from "../ollama.ts"
import { filterAsync, mapAsync } from "../utils.ts"
import pdf from "pdf-parse"
import { console } from "inspector"

const ARXIC_LIBRARIAN_AGENT_YOUARE = `
You are an expert research assistant who specializes in helping users find academic papers on arXiv.
`.trim()

const ARXIV_LIBRARIAN_AGENT_TASK_SEARCH = `${ARXIC_LIBRARIAN_AGENT_YOUARE}
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

const ARXIV_LIBRARIAN_AGENT_TASK_FILTER = `${ARXIC_LIBRARIAN_AGENT_YOUARE}
Your task is to determine if a given arXiv article is relevant to the user's research question.

Follow these rules:
1. Read the provided article summary and the user's research question.
2. Answer with "YES" if the article is relevant, or "NO" if it is not.
3. Give reasone step by step why you think the article is relevant or not.
4. Do not include any other information or formatting in your response.
5. Be selective in what you consider relevant
6. Only say "YES" if the article is DIRECTLY related to the user's question.
7. Say "NO" if the article is not directly related to the user's question.

Format:
Reasoning: <your step by step reasoning here>
Answer: <YES or NO>
`

const ARXIC_API_URL = "http://export.arxiv.org/api/query"

interface ArticleHeader {
    id: string
    title: string
    summary: string
    published: string
    updated: string
    pdf: string
}

interface Article extends ArticleHeader {
    text: string
}

const XML_PARSER = new XMLParser({
    ignoreAttributes: false,
    trimValues: true,
})

export async function arxivLibrarianAgent(question: string) {
    console.info("Querying arXiv librarian agent...")

    const query = await doTask(
        ARXIV_LIBRARIAN_AGENT_TASK_SEARCH,
        question
    )

    const headers = await queryArXiv(query)

    console.info("Articles found!")

    const relevant_headers = await filterAsync(headers, async (header) => {
        const awnser = await doTask(
            ARXIV_LIBRARIAN_AGENT_TASK_FILTER,
            `Is this article relevant to the question "${question}"?
            Article title: ${header.title}
            Summary: ${header.summary}
            `.trim()
        )

        return awnser.trim().endsWith("YES")
    })

    console.info("Filtered articles!")

    const articles = await mapAsync(relevant_headers, async (header) => ({
        ...header,
        text: await pdfToText(header.pdf)
    }))

    console.info("Converted PDFs to text!")

    return articles
}

async function queryArXiv(q: string): Promise<ArticleHeader[]> {
    const text = await cache(`${ARXIC_API_URL}?search_query=${q}`)

    return mapAsync(XML_PARSER.parse(text).feed.entry, async (entry: any) => ({
        id: entry.id,
        title: entry.title,
        summary: entry.summary,
        published: entry.published,
        updated: entry.updated,
        pdf: entry.link.find(l => l["@_title"] === "pdf")["@_href"],
    }))
}

function pdfToText(url: string): Promise<string> {
    return withCache(url, async () => {
        const article = await fetch(url)
        const document = await pdf(Buffer.from(await article.arrayBuffer()))
        return document.text
    })
}

async function test() {
    const question = "I'm trying to use an LLM to do automated literature reviews."
    const articles = await arxivLibrarianAgent(question)

    console.log(articles[0].text)
}

test()
