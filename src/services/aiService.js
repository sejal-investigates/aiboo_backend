const OpenAI = require("openai");

async function askAI(message) {
  try {
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.log("⚠️  OpenAI API key not found. Using mock response.");
      return mockAIResponse(message);
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

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
    // Fall back to mock response on error
    return mockAIResponse(message);
  }
}

// Mock response for local development or when API fails
function mockAIResponse(message) {
  const mockResponses = [
    `I would analyze: "${message}" - Checking system security now.`,
    "Security assessment: All telemetry streams nominal.",
    "Based on inventory data, system appears secure.",
    `Received query: "${message}". Processing cybersecurity analysis.`,
    "AI Assistant: Focus on telemetry collection is active.",
  ];
  
  return mockResponses[Math.floor(Math.random() * mockResponses.length)];
}

module.exports = askAI;