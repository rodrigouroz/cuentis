import { Context } from "koa";
import OpenAI from "openai";
import twilio from "twilio";
import { getThreadId, setThreadId } from "./sessionStore";
import MessagingResponse from "twilio/lib/twiml/MessagingResponse";

// Initialize OpenAI API Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Twilio Client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
); // {{ edit_2 }}

// Twilio WhatsApp number
const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER;

// Store URLs for temporary audio files
export const audioStorage: Record<string, Buffer> = {};

interface RequestBody {
  From: string;
  Body: string;
}

interface AssistantAsnwer {
  conversation: string;
  story: string;
}

export const handleIncomingMessage = async (ctx: Context) => {
  const { From, Body } = ctx.request.body as unknown as RequestBody;

  if (!From || !Body) {
    ctx.status = 400;
    return;
  }

  // Generate a story using GPT-4o-mini
  console.log(`User request: ${Body}`);

  // Check if a conversation thread already exists for this number
  let threadId = getThreadId(From);

  if (!threadId) {
    // Create a new thread using the Assistant API
    const newThread = await openai.beta.threads.create();

    threadId = newThread.id;
    setThreadId(From, threadId);
    console.log(`Created new thread ${threadId} for number ${From}`);
  }

  // Send the message to the appropriate thread
  console.log("Sending message to thread");
  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: Body,
  });

  console.log("Running assistant");
  let run = await openai.beta.threads.runs.createAndPoll(threadId, {
    assistant_id: "asst_ix0SOiE6kkxrOX36a4AA5fTL",
  });

  let clientAnswer;
  let story;

  if (run.status === "completed") {
    const messages = await openai.beta.threads.messages.list(run.thread_id);
    for (const message of messages.data.reverse()) {
      if (message.content[0].type === "text") {
        console.log(`${message.role} > ${message.content[0].text.value}`);
        if (message.role === "assistant") {
          const answer: AssistantAsnwer = JSON.parse(
            message.content[0].text.value
          );
          if (answer.conversation) {
            clientAnswer = answer.conversation;
          }
          if (answer.story) {
            story = answer.story;
          }
        }
      } else {
        console.error(message.content);
      }
    }
  } else {
    console.log(run.status);
  }

  const twiml = new MessagingResponse();
  ctx.set("Content-Type", "text/xml");
  ctx.status = 200;

  if (clientAnswer) {
    console.log("Answering to client", clientAnswer);
    twiml.message(clientAnswer);
    ctx.body = twiml.toString();
    console.log(twiml.toString());
  }

  if (story) {
    console.log("Generating story");
    twiml.message("Claro, la pienso y te la envio");
    ctx.body = twiml.toString();

    setImmediate(async () => {
      const audioBuffer = await textToSpeech(story);
      const audioId = crypto.randomUUID();
      audioStorage[audioId] = audioBuffer;
      const audioUrl = `https://informed-usually-horse.ngrok-free.app/audio/${audioId}.ogg`;
      console.log(`Audio URL: ${audioUrl}`);
      sendWhatsAppAnswer(From, audioUrl);
    });
  }

  // const storyResponse = await openai.chat.completions.create({
  //   model: "gpt-4o-mini",
  //   messages: [
  //     {
  //       role: "system",
  //       content:
  //         "Eres una maestra de jardin de infantes. Genera historias cortas y adecuadas para niños menores de 8 años.",
  //     }, // {{ edit_1 }}
  //     { role: "user", content: Body },
  //   ],
  // });

  // const story =
  //   storyResponse.choices[0]?.message?.content ||
  //   "No pude generar una historia";
  // // const story = "Habia una vez un submarino amarillo muy bonito.";

  // // Convert the story to audio using Whisper (produces mp3 in Buffer)
  // const audioBuffer = await textToSpeech(story);

  // // Generate a unique ID for this audio
  // const audioId = crypto.randomUUID();
  // audioStorage[audioId] = audioBuffer;

  // // Serve the file from a unique URL
  // const audioUrl = `https://e996-181-93-175-134.ngrok-free.app/audio/${audioId}.ogg`;

  // console.log(`Audio URL: ${audioUrl}`);

  // // Construct the TwiML response
  // // const twiml = new TwilioLib.twiml.MessagingResponse();

  // // Add the media URL to the TwiML response
  // // twiml.message("Aqui esta tu cuento").media(audioUrl);

  // // Respond to Twilio with the TwiML
  // // ctx.set("Content-Type", "text/xml");
  // // ctx.status = 200;
  // // ctx.body = "Claro, voy a crear una historia y te la envio";

  // sendWhatsAppAnswer(From, audioUrl);
  // console.log("TwiML response sent to Twilio:", twiml.toString());
};

// Helper function to convert text to speech using OpenAI SDK
const textToSpeech = async (text: string): Promise<Buffer> => {
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

// Helper function to send WhatsApp audio using Twilio SDK
const sendWhatsAppAnswer = async (to: string, audioUrl: string) => {
  await twilioClient.messages.create({
    // {{ edit_3 }}
    body: "Aca está tu historia",
    from: `whatsapp:${twilioNumber}`,
    to: `${to}`,
    mediaUrl: [audioUrl],
  });
};
