document
    .getElementById("input")
    .addEventListener("submit", (e) => {
        // We don't want the form submitting,
        // Instead we handle the request our selves.
        e.preventDefault()

        // Get the user text
        const message = document.querySelector("#input input").value

        // Create the messages
        const c = document.getElementById("messages")
        c.appendChild(createElement("section.user", message))
        const assistantMessage = c.appendChild(createElement("section.assistant"))

        // Reset the form
        e.target.reset()

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
                assistantMessage.innerText = value
                c.scrollTop = c.scrollHeight
            }
        })
    })

function createElement(sig, ...children) {
    const [tagName, classes] = sig.split(".")
    const el = document.createElement(tagName)
    el.classList = classes
    el.replaceChildren(...children)
    return el
}
