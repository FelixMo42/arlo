package main

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

func chat(prompt string, cb func(chunk string)) error {
	messages, err := LoadJson[[]Message]("./dat/conversation.json")

	// If no log could be found, create a new conversation
	if err != nil {
		messages = []Message{
			{
				Role:    "system",
				Content: MD(SystemPrompt, nil),
			},
		}
	}

	// Add user response to the message log
	messages = append(messages, Message{
		Role:    "user",
		Content: prompt,
	})

	// LLM response
	response, err := Ask(messages, cb)
	if err != nil {
		return err
	}

	// Add response message
	messages = append(messages, Message{
		Role:    "assistant",
		Content: response,
	})

	// Save out the conversation
	return SaveJson("dat/conversation.json", messages)
}
