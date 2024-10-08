import db from "../dbClient";
import logger from "../logger";
import { getUserFacts } from "./userFacts";

// Define the `User` type
export interface User {
  userId: string;
  credits: number;
  language?: string;
  facts: string[];
}

// Insert a new user into the `user` table
async function addUser(userId: string, credits: number): Promise<void> {
  await db("user").insert({ userId, credits });
}

async function decreaseCredit(userId: string): Promise<void> {
  await db("user").where({ userId }).decrement("credits", 1);
}

// Retrieve a user by `userId`
async function getUserById(userId: string): Promise<User> {
  let user = await db("user").where({ userId }).first();
  if (user) {
    const facts = await getUserFacts(userId);
    return { ...user, facts };
  } else {
    // return a new user
    logger.info(`Creating new user ${userId}`);
    user = {
      userId,
      credits: 12,
      facts: [],
    };
    await addUser(userId, user.credits);
  }

  return user;
}

// Update a user's language by `userId`
async function updateUserLanguage(
  userId: string,
  language: string
): Promise<void> {
  await db("user").where({ userId }).update({ language });
}

// Export the methods
export { addUser, getUserById, updateUserLanguage, decreaseCredit };
