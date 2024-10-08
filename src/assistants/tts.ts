import openai from "./openAI";

export const textToSpeech = async (text: string): Promise<Buffer> => {
  const response = await openai.audio.speech.create({
    model: "tts-1",
    voice: "nova",
    input: text,
    response_format: "opus",
  });

  if (!response.ok) {
    throw new Error("Failed to convert text to speech");
  }

  // Return the audio as a Buffer
  return Buffer.from(await response.arrayBuffer());
};
