import openai from "./openAI";

const DEFAULT_MESSAGES = {
  english: "You don't have enough credits. Contact Rodrigo Uroz",
  spanish: "No tienes suficientes créditos. Contacta a Rodrigo Uroz",
  default: "You don't have enough credits. Contact Rodrigo Uroz",
};

type Language = keyof typeof DEFAULT_MESSAGES;

export const generateNoCreditsResponse = async (
  language: Language
): Promise<string> => {
  const defaultMessage =
    language in DEFAULT_MESSAGES
      ? DEFAULT_MESSAGES[language]
      : DEFAULT_MESSAGES["default"];

  const message = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a customer support agent and the user wants to perform an operation but doesn't have enough credits. Explain that they need to contact Rodrigo Uroz (rodrigouroz@gmail.com) to get more credints while the story generation bot is in Beta mode. The message should be in " +
          language,
      },
    ],
  });

  return message.choices[0].message.content || defaultMessage;
};
