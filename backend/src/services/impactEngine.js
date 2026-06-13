require("dotenv").config();

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function getImpact(
  profession,
  event,
  severity
) {
  const prompt = `
You are an expert space weather analyst.

Profession: ${profession}
Current Event: ${event}
Severity (1-10): ${severity}

Respond ONLY in valid JSON.

{
  "impactScore": number,
  "summary": "one sentence",
  "recommendation": "one actionable sentence"
}
`;

  const response =
    await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

  return JSON.parse(
    response.choices[0].message.content
  );
}

module.exports = {
  getImpact
};