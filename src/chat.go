package main

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

var messages = []Message{
	{ // add system prompt
		Role:    "system",
		Content: MD("chat-system-prompt", nil),
	},
	{ // add the opening question
		Role:    "assistant",
		Content: "What can I help you with?",
	},
}

func addMessage(message Message) {
	messages = append(messages, message)
}

func chat(prompt string, cb func(chunk string)) error {
	// add user response to the message log
	addMessage(Message{
		Role:    "user",
		Content: prompt,
	})

	// llm response
	response, err := Ask(messages, cb)
	if err != nil {
		return err
	}

	// add response message
	addMessage(Message{
		Role:    "assistant",
		Content: response,
	})

	return nil
}
