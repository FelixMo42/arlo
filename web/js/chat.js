function submit(message) {
    // Create the messages
    const c = document.getElementById("messages")
    c.appendChild(createElement("div.user", message))
    const assistantMessage = c.appendChild(createElement("div.assistant"))

    // Stream the chat response
    fetch("./api/chat", {
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify({ message })
    }).then(async response => {
        const stream = response.body.pipeThrough(new TextDecoderStream())
        const reader = stream.getReader()

        while (true) {
            const { value, done } = await reader.read()
            if (done) break
            assistantMessage.innerText += value

            // scroll
            window.scrollTo(0, document.body.scrollHeight) 
        }
    })
}

document
    .querySelector("#input textarea")
    .addEventListener("keypress", e => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            submit(e.currentTarget.value)
            e.currentTarget.value = ""
        }
    })

function createElement(sig, ...children) {
    const [tagName, classes] = sig.split(".")
    const el = document.createElement(tagName)
    el.classList = classes
    el.replaceChildren(...children)
    return el
}
