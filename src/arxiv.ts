async function main() {
    const arxivApi = `http://export.arxiv.org/api`
    const response = await fetch(`${arxivApi}/query?` + new URLSearchParams({
        search_query: 'all:llm',
        start: "0",
        max_results: "10"
    }).toString())
    
    console.log(await response.text())
}

main()