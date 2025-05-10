# Arlo

Meet Arlo, my personal AI assistant. The goal is to have a bot that can work on tasks for me while I'm away from my laptop (such as when I'm asleep). The first and current feature I'm working on is research, modeled after OpenAI's Deep Research.

## How it works

Most of my inspiration is coming from Microsoft's AutoGen. IE: the core of Arlo a system of different agents all collaborating on tasks.

Right now my set up is very simple: when you ask a question a teacher and student have a round robin discusions talking turns asking questions and awnsering them. After ten rounds the conversation get's summerized and outputted at the final markdown file.

Next steps:
- Webreaserch
- Implement GraphRAG
