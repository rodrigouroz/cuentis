// src/sessionStore.ts
interface SessionEntry {
  threadId: string;
  lastAccessed: number;
}

interface SessionStore {
  [phoneNumber: string]: SessionEntry;
}

const sessionStore: SessionStore = {};

const EXPIRATION_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Retrieves the existing thread ID for a given phone number if not expired.
 * @param phoneNumber - The WhatsApp phone number
 */
export function getThreadId(phoneNumber: string): string | undefined {
  const entry = sessionStore[phoneNumber];
  if (entry && Date.now() - entry.lastAccessed < EXPIRATION_TIME) {
    // Directly update the last accessed time in sessionStore
    sessionStore[phoneNumber].lastAccessed = Date.now(); // Update last accessed time
    return entry.threadId;
  }
  // If expired or not found, remove the entry and return undefined
  delete sessionStore[phoneNumber];
  return undefined;
}

/**
 * Stores the thread ID for a given phone number with current timestamp.
 * @param phoneNumber - The WhatsApp phone number
 * @param threadId - The OpenAI thread ID
 */
export function setThreadId(phoneNumber: string, threadId: string): void {
  sessionStore[phoneNumber] = {
    threadId,
    lastAccessed: Date.now(),
  };
}

/**
 * Removes the thread ID for a given phone number (to reset a conversation).
 * @param phoneNumber - The WhatsApp phone number
 */
export function clearThreadId(phoneNumber: string): void {
  delete sessionStore[phoneNumber];
}

// Optional: Add a function to clean up expired entries periodically
export function cleanupExpiredSessions(): void {
  const now = Date.now();
  Object.keys(sessionStore).forEach((phoneNumber) => {
    if (now - sessionStore[phoneNumber].lastAccessed >= EXPIRATION_TIME) {
      delete sessionStore[phoneNumber];
    }
  });
}
