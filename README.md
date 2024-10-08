# Cuentis 📚🎙️

**Cuentis** is a storytelling assistant that generates personalized stories for children based on their preferences and current interests. The assistant is designed to provide interactive and engaging experiences, responding to children’s preferences and evolving each story session to make them unique.

## Project Overview

The goal of **Cuentis** is to offer a digital assistant that can create custom stories for children using AI, either in text or as narrated audio. The assistant interacts via a messaging platform like WhatsApp, allowing users to initiate story requests through text or voice notes. Using OpenAI’s language models and Twilio’s messaging services, the assistant can dynamically craft tales for different audiences.

### Features

- **Personalized Storytelling**: Tailors each story based on static (e.g., child’s name, age, and favorite themes) and contextual (e.g., current preferences, today’s favorite characters) information.
- **Interactive Elements**: Pauses mid-story to ask engaging questions, promoting a two-way interaction.
- **Multilingual Support**: Responds in the language used by the user (currently supporting English and Spanish).
- **Text & Audio Options**: Can deliver stories as text or generate an audio response.

### Key Integrations

- **OpenAI API**: Generates the core content and stories.
- **Twilio API**: Manages communication between the assistant and users via WhatsApp.
- **SQLite Database**: Stores user information and preferences.

## How It Works

1. **User Interaction**: A parent or guardian sends a message (either text or audio) to Cuentis through WhatsApp, specifying story elements or letting Cuentis decide.
2. **Personalization**: Cuentis references previously stored information (e.g., child’s name, age, favorite themes) and combines it with new details for the session.
3. **Story Creation**: Using OpenAI’s API, Cuentis creates a unique story that can include pauses for interaction, asking questions like “What should our hero do next?”
4. **Response Delivery**: The story is sent back either as text or as an audio message, depending on the user’s preference.

## Contact

If you have any questions or want to contribute to Cuentis, feel free to reach out!
