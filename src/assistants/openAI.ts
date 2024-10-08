import OpenAI from "openai";

// Initialize OpenAI API Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;
