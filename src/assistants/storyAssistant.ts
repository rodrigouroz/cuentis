import logger from "../logger";
import { User } from "../models/user";
import { getThreadId, setThreadId } from "../sessionStore";
import openai from "./openAI";

export type StoryAssistantAnswer = {
  language: string;
  content: string;
  type: "story" | "conversation";
  facts: string[];
};

export default class StoryAssistant {
  private user: User | null;

  public constructor(user: User | null) {
    this.user = user;
  }

  private async getThread(): Promise<string> {
    // assert user is not null
    if (!this.user) {
      throw new Error("User not initialized");
    }

    let threadId = getThreadId(this.user.userId);

    if (!threadId) {
      // Create a new thread using the Assistant API
      let newThread;

      newThread = await openai.beta.threads.create();

      threadId = newThread.id;
      setThreadId(this.user.userId, threadId);
      logger.info(
        `Created new thread ${threadId} for user ${this.user.userId}`
      );
    }

    return threadId;
  }

  public async handleTextMessage(
    message: string,
    handleAssistantResponse: (response: StoryAssistantAnswer) => void
  ) {
    const threadId = await this.getThread();

    // Send the message to the appropriate thread
    logger.debug("Sending message to thread");
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });

    logger.debug("Running assistant");
    const runOptions = {
      assistant_id: "asst_6vJbY94wdyzupBxche2c49Yq",
      ...(this.user?.facts.length && {
        additional_instructions: `These are known facts from a previous conversation\n ${this.user.facts.join(
          "\n"
        )}`,
      }),
    };
    logger.debug("Run options", runOptions);
    const run = openai.beta.threads.runs
      .stream(threadId, runOptions)
      .on("textDone", (content) => {
        logger.debug("Message done", content.value);

        handleAssistantResponse(JSON.parse(content.value));
      });

    return null;
  }
}
