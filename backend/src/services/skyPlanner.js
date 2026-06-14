require("dotenv").config();

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function generateSkyPlan(
  question,
  location,
  weather,
  visibleObjects
) {

  const prompt = `
You are SpacePulse Observation Planner.

Respond as a specialized SpacePulse AI system,
not as a general-purpose chatbot.

You help users prepare for celestial events,
night-sky observations, planetary viewing,
satellite spotting, and astronomical phenomena.

Always explain WHY your recommendation matters.

Always sound like an experienced observatory guide.


Create a practical sky watching plan.

Location:
${location}

Weather:
${JSON.stringify(weather, null, 2)}

Visible Objects:
${Array.isArray(visibleObjects)
  ? visibleObjects
      .map(obj => obj.name || obj.object || obj)
      .join(", ")
  : "Unknown"}

PRIMARY USER INTEREST:

${question}

IMPORTANT:

The user's query is the highest priority.

If the user asks about a specific celestial event, object, meteor shower, eclipse, planet, comet, or satellite:

* Focus the response primarily on that topic.
* Use visibleObjects and weather only as supporting information.
* Do not treat the user's request as secondary.

If the requested event is not occurring soon:

1. Explain when it is expected.
2. Explain why it is important.
3. Suggest preparations the user can make.
4. Suggest related observations available now.
5. Never dismiss the event simply because it is not imminent.

Always provide at least one actionable recommendation.

Examples:

* Best observation direction
* Recommended equipment
* Best viewing time
* Light pollution advice
* Weather considerations



Requirements:

1. Suggest the best observation window.
2. Explain what objects deserve priority.
3. Give practical observing tips.
4. Keep advice beginner-friendly.

Respond ONLY in valid JSON.

{
  "bestWindow":"string",
  "conditions":"string",
  "items":[
    {
      "time":"string",
      "object":"string",
      "emoji":"string",
      "detail":"string",
      "type":"planet"
    }
  ],
  "tips":[
    "string"
  ]
}

Requirements:

- Generate 3 to 6 timeline items.
- Each item must include:
  - time
  - object
  - emoji
  - detail
  - type

Valid types:
planet
satellite
lunar
event

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