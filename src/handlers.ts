import fs from "fs";
import { Context } from "koa";
import os from "os";
import path from "path";
import twilio from "twilio";
import { generateNoCreditsResponse } from "./assistants/creditAssistant";
import StoryAssistant, {
  StoryAssistantAnswer,
} from "./assistants/storyAssistant";
import { textToSpeech } from "./assistants/tts";
import {
  decreaseCredit,
  getUserById,
  updateUserLanguage,
  User,
} from "./models/user";
import { addUserFact } from "./models/userFacts";
import logger from "./logger";

const DEBUG = 0;

// Initialize Twilio Client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Twilio WhatsApp number
const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER;

interface RequestBody {
  From: string;
  Body: string;
}

export const handleIncomingMessage = async (ctx: Context) => {
  const { From, Body } = ctx.request.body as unknown as RequestBody;

  if (!From || !Body) {
    ctx.status = 400;
    return;
  }

  const user = await getUserById(From);

  const assistant = new StoryAssistant(user);

  logger.info(`User request: ${Body}`);

  assistant.handleTextMessage(
    Body,
    async (response) => await handleAssistantResponse(ctx, user, From, response)
  );

  ctx.status = 204;
};

const handleAssistantResponse = async (
  ctx: Context,
  user: User,
  From: string,
  response: StoryAssistantAnswer
) => {
  if (!user.language) {
    logger.debug(`Setting user language to ${response.language}`);
    user.language = response.language;
    await updateUserLanguage(user.userId, user.language);
  }

  if (user.credits === 0) {
    const language = user.language as "english" | "spanish" | "default";
    const message = await generateNoCreditsResponse(language);
    await sendWhatsAppAnswer(From, message);
    return;
  }

  const answer = response.content;

  logger.info(`Assistant response: ${JSON.stringify(answer)}`);

  response.facts.forEach(
    async (fact: string) => await addUserFact(user.userId, fact)
  );

  if (response.type === "conversation") {
    await sendWhatsAppAnswer(From, answer);
  } else {
    logger.debug("Generating story");
    await decreaseCredit(user.userId);

    setImmediate(async () => {
      const audioBuffer = await textToSpeech(answer);
      const audioId = crypto.randomUUID();
      const tmpDir = os.tmpdir();
      const audioFilePath = path.join(tmpDir, `${audioId}.ogg`);

      // Write the audio buffer to a temporary file
      await fs.promises.writeFile(audioFilePath, audioBuffer);

      const audioUrl = `${process.env.EXTERNAL_AUDIO_URL}/audio/${audioId}.ogg`;
      logger.debug(`Audio URL: ${audioUrl}`);
      await sendWhatsAppAnswer(From, undefined, audioUrl);
    });
  }
};

// Helper function to send WhatsApp audio using Twilio SDK
const sendWhatsAppAnswer = async (
  to: string,
  content?: string,
  audioUrl?: string
) => {
  if (DEBUG) {
    logger.debug(`Sending message to ${to}`);
    logger.debug(`Content: ${content}`);
    logger.debug(`Audio URL: ${audioUrl}`);
    return;
  }
  await twilioClient.messages.create({
    from: `whatsapp:${twilioNumber}`,
    to: `${to}`,
    ...(audioUrl && { mediaUrl: [audioUrl] }),
    ...(content && { body: content }),
  });
};
