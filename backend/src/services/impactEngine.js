require("dotenv").config();

const Groq = require("groq-sdk");

const professionMapping =
require("../utils/professionMapping");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function getImpact(
  profession,
  event,
  severity
) 
{

    const professionData =
  professionMapping[profession];

const priorities =
  professionData?.priority?.join(", ")
  || "general space awareness";


  const prompt = `
You are SpacePulse Mission Impact Analyzer.

Respond as a specialized SpacePulse AI system,
not as a general-purpose chatbot.


You specialize in evaluating how space-weather events,
satellite disruptions, and astronomical phenomena affect
different professions.

Provide practical and realistic assessments.

Avoid exaggeration.

Focus on operational consequences and actionable recommendations.


Your task is to evaluate how a space-related event affects a SPECIFIC profession.

IMPORTANT RULES:

1. Evaluate the IMPACT ON THE PROFESSION, not the severity of the event alone.
2. Different professions should receive different impact scores for the same event.
3. Consider the profession's dependence on:

   * GPS and navigation systems
   * Satellite communications
   * Weather forecasting
   * Astronomy visibility and sky conditions
   * Scientific observations
   * Electrical and technological infrastructure
   * Operational safety and mission-critical systems

SCORING FRAMEWORK:

Impact Score: Integer from 1 to 10

1-2:
Negligible impact. Daily activities largely unaffected.

3-4:
Minor inconvenience or indirect effects.

5-6:
Moderate disruption. Some workflow adjustments required.

7-8:
Significant operational impact. Performance, reliability, or productivity may be affected.

9-10:
Critical impact. Safety, mission success, communication systems, navigation systems, or essential operations are at serious risk.

PROFESSION CONTEXT:

Profession:
${profession}

Important Areas For This Profession:
${priorities}

EVENT DETAILS:

Space Event:
${event}

Severity:
${severity}

REASONING GUIDELINES:

When calculating impactScore, consider:

* GPS Dependence (0-3 points)
* Communication Dependence (0-2 points)
* Observation/Astronomy Dependence (0-2 points)
* Weather Dependence (0-1 point)
* Infrastructure/Safety Risk (0-2 points)

The final score should reflect the TOTAL impact on the profession.

OUTPUT REQUIREMENTS:

Respond ONLY in valid JSON.

{
"impactScore": integer,
"summary": "A concise explanation of how the event affects the profession.",
"recommendation": "A practical action the professional should take."
}

Do not include markdown.
Do not include explanations outside JSON.
Do not include code fences.
Return only the JSON object.

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
  getImpact
};