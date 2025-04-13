package main

type OllamaChatResponse struct {
	Message Message `json:"message"`
}

func Ask(messages []Message, cb func(response string)) (string, error) {
	url := "http://localhost:11434/api/chat"

	body := map[string]any{
		"model":    "llama3.1",
		"stream":   true,
		"messages": messages,
		"options": map[string]any{
			"seed":        42,
			"temperature": 0,
		},
	}

	type Chunk struct {
		Message Message `json:"message"`
		Done    bool    `json:"done"`
	}

	message := ""

	err := PostJsonStream(url, body, func(chunk Chunk) bool {
		message += chunk.Message.Content
		cb(message)
		return chunk.Done
	})

	if err != nil {
		return message, NewHttpError(500, "Can't connect to ollama!")
	}

	return message, err
}
