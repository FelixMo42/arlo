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
		messages, err := LoadJson[[]Message]("./dat/conversation.json")

		if err != nil {
			messages = []Message{}
		} else {
			messages = messages[1:]
		}

		println(len(messages))

		c.HTML(200, "agent.html", gin.H{
			"Messages": messages,
		})
	})

	router.POST("/api/chat", func(c *gin.Context) {
		// Get the user input
		type MessageRequest struct {
			Message string `json:"message"`
		}
		body, _ := ReadJsonBody[MessageRequest](c)

		//
		w := c.Writer
		flusher, _ := w.(http.Flusher)
		w.Header().Set("Content-Type", "text")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Transfer-Encoding", "chunked")

		// llm response
		err := chat(body.Message, func(chunk string) {
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
