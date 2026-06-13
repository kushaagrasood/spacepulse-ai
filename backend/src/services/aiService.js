require("dotenv").config();

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function askAI(question) {

  const prompt = `
You are SpacePulse AI.

You are an astronomy, satellite, and space weather expert.

Your job is to answer user questions in simple,
clear language.

Guidelines:

- Explain concepts clearly.
- Avoid excessive technical jargon.
- If discussing risks, be factual.
- If discussing astronomy, be educational.
- Keep responses concise but useful.
- If unsure, say so.

User Question:

${question}
`;

  const response =
    await groq.chat.completions.create({

      model: "llama-3.1-8b-instant",

      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

  return response
    .choices[0]
    .message
    .content;
}

module.exports = {
  askAI
};  