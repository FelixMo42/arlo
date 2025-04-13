package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func setupServer() {
	router := gin.Default()
	router.LoadHTMLGlob("web/html/*")
	router.Static("/css", "./web/css")
	router.Static("/js", "./web/js")

	// Make sure the index page works
	router.GET("/", func(c *gin.Context) {
		c.HTML(200, "agent.html", gin.H{
			"Messages": messages,
		})
	})

	router.POST("/api/chat", func(c *gin.Context) {
		// Get the user input
		type MessageRequest struct {
			Message string `json:"message"`
		}
		var jsonData MessageRequest
		if err := c.BindJSON(&jsonData); err != nil {
			// TODO: Better error handling
			println("ERR: failed to parse JSON")
			return
		}
		if jsonData.Message == "" {
			// TODO: Better error handling
			println("ERR: empty message string")
			return
		}

		w := c.Writer
		flusher, ok := w.(http.Flusher)
		if !ok {
			c.String(http.StatusInternalServerError, "Streaming unsupported")
			return
		}

		//
		w.Header().Set("Content-Type", "text")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Transfer-Encoding", "chunked")

		// llm response
		err := chat(jsonData.Message, func(chunk string) {
			w.Write([]byte(chunk))
			flusher.Flush()
		})

		if err != nil {
			w.Write([]byte(err.Error()))
			flusher.Flush()
		}
	})

	router.Run()
}

func main() {
	setupServer()
}
