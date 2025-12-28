const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function askAI(message) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are AiBoO, an AI cybersecurity assistant. Give short, clear security-focused answers.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    throw error;
  }
}

module.exports = askAI;
