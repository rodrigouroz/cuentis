import db from "./dbClient";

export type HealthStats = {
  users: number;
  lastUserResult?: string;
  lastFactResult?: string;
};

export const getHealthStats = async (): Promise<HealthStats> => {
  // Retrieve the count of users
  const userCountResult = await db("user").count("* as users").first();
  let users = 0;

  if (userCountResult) {
    users = parseInt(userCountResult["users"].toString());
  }

  console.log("Number of Users:", users);

  const lastUserResult = await db<Date>("user").max("updatedAt").first();
  const lastFactResult = await db<Date>("user_facts").max("createdAt").first();
  let lastUser;
  let lastFact;

  if (lastUserResult) {
    lastUser = Object.values(lastUserResult)[0];
  }

  if (lastFactResult) {
    lastFact = Object.values(lastFactResult)[0];
  }

  return { users, lastUserResult: lastUser, lastFactResult: lastFact };
};
