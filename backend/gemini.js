import axios from "axios";

const geminiResponse = async (
    command,
    assistantName,
    userName
) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is missing in .env");
        }

        const prompt = `
You are a virtual assistant named ${assistantName}, created by ${userName}.

Understand the user's command.

Return ONLY valid JSON in exactly this format:

{
  "type": "general",
  "userInput": "original user command",
  "response": "actual useful answer",
  "query": ""
}

Allowed type values:

general
google_open
google_search
youtube_open
youtube_search
youtube_play
get_time
get_date
get_day
get_month
calculator_open
calculator_calculate
instagram_open
facebook_open
weather_show

Rules:

1. For normal questions and conversation, use "general".
2. For normal questions, "response" MUST contain the actual answer.
3. Never say "Searching for your answer", "Ask Google", or "I don't know" unless genuinely necessary.
4. Keep normal answers short and useful, usually 2-4 sentences.
5. For calculations, provide the actual calculated answer in "response".
6. For "open Google", use "google_open".
7. For Google searches, use "google_search".
8. For Google searches, put the search text inside "query".
9. For "open YouTube", use "youtube_open".
10. For YouTube searches, use "youtube_search".
11. For playing something on YouTube, use "youtube_play".
12. For "open calculator", use "calculator_open".
13. For calculations such as "25 plus 30", use "calculator_calculate".
14. For Instagram, use "instagram_open".
15. For Facebook, use "facebook_open".
16. For weather requests, use "weather_show".
17. userInput must contain the user's original command.
18. Return ONLY JSON.
19. Do not use Markdown.
20. Do not use code fences.
21. Do not write anything before or after the JSON.
22. The user does NOT need to say the assistant's name.

Examples:

User:
what is artificial intelligence

Return:
{
  "type": "general",
  "userInput": "what is artificial intelligence",
  "response": "Artificial intelligence is technology that enables computers to perform tasks that normally require human intelligence, such as learning, reasoning, and understanding language.",
  "query": ""
}

User:
who is Albert Einstein

Return:
{
  "type": "general",
  "userInput": "who is Albert Einstein",
  "response": "Albert Einstein was a German-born physicist best known for developing the theory of relativity. He received the Nobel Prize in Physics in 1921.",
  "query": ""
}

User:
search python tutorials on google

Return:
{
  "type": "google_search",
  "userInput": "search python tutorials on google",
  "response": "Searching Google for python tutorials.",
  "query": "python tutorials"
}

User:
open google

Return:
{
  "type": "google_open",
  "userInput": "open google",
  "response": "Opening Google for you.",
  "query": ""
}

User:
calculate 25 plus 30

Return:
{
  "type": "calculator_calculate",
  "userInput": "calculate 25 plus 30",
  "response": "25 plus 30 equals 55.",
  "query": "25 plus 30"
}

USER COMMAND:
${command}
`;

        const apiUrl =
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

        const result = await axios.post(
            apiUrl,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.2,
                    responseMimeType: "application/json"
                }
            },
            {
                headers: {
                    "Content-Type": "application/json"
                },
                timeout: 30000
            }
        );

        const text =
            result.data
                ?.candidates?.[0]
                ?.content?.parts?.[0]
                ?.text;

        if (!text) {
            throw new Error("Gemini response text not found");
        }

        try {
            return JSON.parse(text);
        } catch {
            return {
                type: "general",
                userInput: command,
                response: text.trim(),
                query: ""
            };
        }
    } catch (error) {
        console.error(
            "Gemini error:",
            error.response?.data || error.message
        );

        throw error;
    }
};

export default geminiResponse;