function auto_grow(element) {
    element.style.height = "5px";
    element.style.height = Math.max(element.scrollHeight, 45) + "px";
}

htmx.onLoad((content) => {
    content
        .querySelectorAll("textarea")
        .forEach(area => {
            auto_grow(area)
            area.oninput = () => auto_grow(area)
        })
})

