const Groq = require("groq-sdk");

const generateSummary = async (req, res) => {
  const { transcript } = req.body;

  if (!transcript || transcript.trim() === "") {
    return res.status(400).json({ message: "Transcript required hai" });
  }

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
  try {
    const completion = await groq.chat.completions.create({
     model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an AI meeting assistant. Given a meeting transcript, return ONLY a valid JSON object like this:
          {
            "summary": "2-3 line meeting summary",
            "keyPoints": ["point 1", "point 2", "point 3"],
            "actionItems": [
              { "task": "task description", "assignee": "person name or Unassigned" }
            ]
          }
          Return ONLY JSON. No extra text. No markdown.`,
        },
        {
          role: "user",
          content: `Meeting Transcript:\n${transcript}`,
        },
      ],
      max_tokens: 800,
      temperature: 0.3,
    });

    // Response
    const raw = completion.choices[0].message.content.trim();

    const cleaned = raw.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(cleaned);
    res.json(parsed);
  } catch (err) {
    console.error("AI error:", err.message);
    res.status(500).json({ message: "AI generation failed: " + err.message });
  }
};


module.exports = { generateSummary };
