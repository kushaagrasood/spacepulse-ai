require("dotenv").config();

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function generateSkyPlan(
  location,
  weather,
  visibleObjects
) {

  const prompt = `
You are SpacePulse AI.

You are an astronomy observation expert.

Create a practical sky watching plan.

Location:
${location}

Weather:
${weather}

Visible Objects:
${visibleObjects.join(", ")}

Requirements:

1. Suggest the best observation window.
2. Explain what objects deserve priority.
3. Give practical observing tips.
4. Keep advice beginner-friendly.

Respond ONLY in valid JSON.

{
  "bestWindow":"string",
  "summary":"string",
  "objectsToWatch":[
    "string"
  ],
  "tips":[
    "string"
  ]
}
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

  return JSON.parse(
    response.choices[0].message.content
  );
}

module.exports = {
  generateSkyPlan
};