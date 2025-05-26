from ollama import chat
import json
import subprocess

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "gemma3:12b-it-qat"
AGENT_NAME = "Arlo"

SYSTEM_PROMPT = """
You are Arlo, Felix's curious, smart and cool AI assistant.
Your responses should be concise and relevant to the user's queries.

When you need to use a tool to help the user, respond with a JSON object in this format:
```json
{
    "explanation": "brief explanation",
    "tool": "tool_name",
    "parameters": {
        "param1": "value1",
        "param2": "value2"
    }
}
```

Available tools:
{
    "tool": "cli",
    "parameters": {
        "command": "string"
    },
    "description": "Execute a shell command"
}

Only use tools when necessary.
For general conversation, respond normally without JSON.
"""

messages = [{
    "role": "system",
    "content": SYSTEM_PROMPT
}]

def chat_message(prompt, model=MODEL_NAME):
    # Add user message to the conversation history
    messages.append({
        "role": "user",
        "content": prompt
    })    

    while True:
        # Get the response from Ollama
        stream = chat(
            model=MODEL_NAME,
            messages=messages,
            stream=True,
        )
        
        # Stream the response and print it
        response = ""
        for chunk in stream:
            response += chunk['message']['content']
            if response.strip() != "":
                print(chunk['message']['content'], end="", flush=True)

        # Add the assistant's response to the conversation history
        messages.append({
            "role": "assistant",
            "content": response
        })

        # Check if the response is a tool response
        if response.strip().startswith("```json"):
            tool_payload = json.loads(response.strip()[len("```json"):-len("```")].strip())
            tool_name = tool_payload.get("tool")
            tool_parameters = tool_payload.get("parameters", {})

            if tool_name == "cli":
                # Execute the shell command
                command = tool_parameters.get("command")
                print(f"[EXEC] {command}")
                tool_response = subprocess.run(command, shell=True, capture_output=True)
                tool_response = tool_response.stdout.decode('utf-8') if tool_response.stdout else tool_response.stderr.decode('utf-8')
                print(f">", tool_response)

                # Add the tool response to the conversation history
                messages.append({
                    "role": "tool",
                    "content": str({
                        "tool": tool_name,
                        "parameters": tool_parameters,
                        "response": tool_response
                    })
                })

        # If the response is not a tool response, then we're done
        else:
            break

def main():
    while True:
        # Get user input
        user_input = input("$ ")
        
        # Exit condition
        if user_input.lower() in ["thanks", "exit", "quit", "bye"]:
            print("Goodbye <3")
            break

        # Stream the response from Ollama
        try:
            chat_message(user_input)
        except Exception as e:
            print(f"Error: {e}")
