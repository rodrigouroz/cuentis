import db from "../dbClient";

// Insert new information for a user
async function addUserFact(userId: string, fact: string): Promise<void> {
  await db("user_facts")
    .insert({ userId, fact })
    .onConflict(["userId", "fact"])
    .ignore();
}

// Retrieve facts for a user by `userId`
async function getUserFacts(userId: string): Promise<string[]> {
  const information = await db("user_facts").where({ userId });
  return information.map((info) => info.fact);
}

// Export the methods
export { addUserFact, getUserFacts };
