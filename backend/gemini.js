import axios from "axios";

/*
=====================================================
NORMAL GEMINI RESPONSE
=====================================================
*/

const geminiResponse = async (
  command,
  assistantName,
  userName
) => {
  try {
    const apiKey =
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is missing in .env"
      );
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
2. For normal questions, "response" must contain the actual answer.
3. Keep normal answers short and useful.
4. For calculations, provide the actual calculated answer.
5. For "open Google", use "google_open".
6. For Google searches, use "google_search".
7. For Google searches, put the search text inside "query".
8. For "open YouTube", use "youtube_open".
9. For YouTube searches, use "youtube_search".
10. For playing something on YouTube, use "youtube_play".
11. For "open calculator", use "calculator_open".
12. For calculations, use "calculator_calculate".
13. For Instagram, use "instagram_open".
14. For Facebook, use "facebook_open".
15. For weather requests, use "weather_show".
16. userInput must contain the original command.
17. Return ONLY JSON.
18. Do not use Markdown.
19. Do not use code fences.
20. Do not write anything before or after the JSON.

USER COMMAND:
${command}
`;

    const apiUrl =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    const result =
      await axios.post(
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
            responseMimeType:
              "application/json"
          }
        },
        {
          headers: {
            "Content-Type":
              "application/json"
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
      throw new Error(
        "Gemini response text not found"
      );
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
      error.response?.data ||
        error.message
    );

    throw error;
  }
};


/*
=====================================================
IMAGE ANALYSIS
=====================================================
*/

export const geminiImageResponse =
  async (
    command,
    imageBuffer,
    mimeType,
    assistantName,
    userName
  ) => {
    try {
      const apiKey =
        process.env.GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error(
          "GEMINI_API_KEY is missing in .env"
        );
      }

      if (!imageBuffer) {
        throw new Error(
          "Image is required"
        );
      }

      const imageBase64 =
        imageBuffer.toString(
          "base64"
        );

      const prompt = `
You are ${assistantName}, a helpful AI virtual assistant.

The user's name is ${userName}.

The user has uploaded an image and asked:

"${command}"

Analyze the uploaded image carefully.

You can help with:

- handwritten notes
- printed notes
- mathematics problems
- graphs
- charts
- diagrams
- chemistry diagrams
- physics diagrams
- programming screenshots
- code screenshots
- documents
- tables
- general images

Give a clear and useful answer.

If the image contains a question, solve it completely and explain the solution.

If the image contains code, explain the code and identify errors if present.

If the image contains notes, summarize the important information.

If the image contains a multiple-choice question, identify the correct option and explain why.

If the image is unclear, honestly tell the user which part is unclear.

Do not invent information that cannot be seen.

Answer the user's question directly.

Give a complete answer rather than only repeating the topic name.
`;

      const apiUrl =
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

      const result =
        await axios.post(
          apiUrl,
          {
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  },

                  {
                    inline_data: {
                      mime_type:
                        mimeType,

                      data:
                        imageBase64
                    }
                  }
                ]
              }
            ],

            generationConfig: {
              temperature: 0.2
            }
          },
          {
            headers: {
              "Content-Type":
                "application/json"
            },

            timeout: 60000
          }
        );

      const text =
        result.data
          ?.candidates?.[0]
          ?.content?.parts
          ?.map(
            part =>
              part.text || ""
          )
          .join("")
          .trim();

      if (!text) {
        throw new Error(
          "Gemini image response not found"
        );
      }

      return text;

    } catch (error) {
      console.error(
        "Gemini IMAGE ERROR:",
        error.response?.data ||
          error.message
      );

      throw error;
    }
  };


/*
=====================================================
PDF ANALYSIS
=====================================================
*/

export const geminiPdfResponse =
  async (
    command,
    pdfBuffer,
    assistantName,
    userName
  ) => {
    try {
      const apiKey =
        process.env.GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error(
          "GEMINI_API_KEY is missing in .env"
        );
      }

      if (!pdfBuffer) {
        throw new Error(
          "PDF is required"
        );
      }

      const pdfBase64 =
        pdfBuffer.toString(
          "base64"
        );

      const prompt = `
You are ${assistantName}, a helpful AI virtual assistant.

The user's name is ${userName}.

The user has uploaded a PDF document and asked:

"${command}"

Read and analyze the uploaded PDF carefully before answering.

You can help with:

- textbooks
- notes
- assignments
- question papers
- research papers
- resumes
- reports
- programming documents
- mathematics documents
- chemistry documents
- physics documents
- tables
- charts
- diagrams
- scanned documents
- educational PDFs

IMPORTANT RULES:

1. Use the uploaded PDF as the primary source.
2. Answer the user's exact question.
3. If the user asks for a summary, summarize the relevant PDF content clearly.
4. If the user asks about a chapter or section, explain that section.
5. If the user asks a question from the PDF, solve it completely.
6. If the PDF contains multiple-choice questions, identify the correct answer and explain it.
7. If the PDF contains mathematical problems, show the calculation and final answer.
8. If the PDF contains tables, use the relevant information from the tables.
9. If the PDF contains code, explain the code and identify errors where appropriate.
10. If the PDF contains diagrams, explain what they represent.
11. If the PDF contains scanned text, use the readable text from the document.
12. Do not invent information that is not present in the PDF.
13. If the requested information cannot be found in the PDF, clearly say that it could not be found.
14. Give a complete and useful answer.
15. Do not give only a short one-line answer when the question requires explanation.

Answer the user's question directly.
`;

      const apiUrl =
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

      const result =
        await axios.post(
          apiUrl,
          {
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  },

                  {
                    inline_data: {
                      mime_type:
                        "application/pdf",

                      data:
                        pdfBase64
                    }
                  }
                ]
              }
            ],

            generationConfig: {
              temperature: 0.2
            }
          },
          {
            headers: {
              "Content-Type":
                "application/json"
            },

            timeout: 120000
          }
        );

      const text =
        result.data
          ?.candidates?.[0]
          ?.content?.parts
          ?.map(
            part =>
              part.text || ""
          )
          .join("")
          .trim();

      if (!text) {
        throw new Error(
          "Gemini PDF response not found"
        );
      }

      return text;

    } catch (error) {
      console.error(
        "Gemini PDF ERROR:",
        error.response?.data ||
          error.message
      );

      throw error;
    }
  };


export default geminiResponse;