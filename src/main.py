from ollama import chat

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "gemma3:12b-it-qat"
AGENT_NAME = "Arlo"

messages = []

def chat_message(prompt, model=MODEL_NAME):
    # Add user message to the conversation history
    messages.append({
        "role": "user",
        "content": prompt
    })

    # Get the response from Ollama
    stream = chat(
        model=MODEL_NAME,
        messages=messages,
        stream=True,
    )

    # Stream the response and print it
    response = ""
    for chunk in stream:
        print(chunk['message']['content'], end="", flush=True)
        response += chunk['message']['content']

    # Add the assistant's response to the conversation history
    messages.append({
        "role": "assistant",
        "content": response
    })

def main():
    while True:
        # Get user input
        user_input = input("$ ")
        
        # Exit condition
        if user_input.lower() in ["exit", "quit"]:
            break

        # Stream the response from Ollama
        try:
            chat_message(user_input)
        except Exception as e:
            print(f"Error: {e}")
