function auto_grow(element) {
    element.style.height = "5px";
    element.style.height = element.scrollHeight + "px";
    window.scrollTo(0, document.body.scrollHeight) 
}

document
    .querySelectorAll("textarea")
    .forEach(textarea => {
        auto_grow(textarea)
        textarea.addEventListener("keypress", () => auto_grow(textarea))
    })
