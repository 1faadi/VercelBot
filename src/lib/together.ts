import Together from "together-ai";

export const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});
