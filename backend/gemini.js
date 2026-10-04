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

        /*
        =================================================
        GEMINI PROMPT
        =================================================
        */

        const prompt = `
You are a virtual assistant named ${assistantName}, created by ${userName}.

Understand the user's command and provide the best possible answer.

Return ONLY valid JSON in this exact structure:

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
calculator_open
calculator_calculate
instagram_open
facebook_open
weather_show

Rules:

1. Normal questions must use "general".

2. Give the actual useful answer in "response".

3. Give complete and informative answers.

4. Do not return only the topic name.

5. If the user asks an educational question, explain it properly.

6. If the user asks a definition, provide the definition and useful explanation.

7. If the user asks a calculation, provide the actual result.

8. For Google searches, use "google_search".

9. For YouTube searches, use "youtube_search".

10. For YouTube playing requests, use "youtube_play".

11. For opening Google, use "google_open".

12. For opening YouTube, use "youtube_open".

13. For opening a calculator, use "calculator_open".

14. For Instagram requests, use "instagram_open".

15. For Facebook requests, use "facebook_open".

16. userInput must contain the original user command.

17. query should contain the search query when a search action is required.

18. Return ONLY valid JSON.

19. Do not use Markdown code fences.

20. Do not guess the current date, time, day, month, or year.

21. Date, time, day, month, and year requests are handled by the frontend using the user's system clock.

22. For normal questions, provide a complete useful answer rather than only naming the topic.

23. Never respond with only a single keyword when the user asks a question requiring an explanation.

USER COMMAND:
${command}
`;

        /*
        =================================================
        GEMINI API
        =================================================
        */

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

        /*
        =================================================
        GET GEMINI RESPONSE TEXT
        =================================================
        */

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

        /*
        =================================================
        PARSE JSON
        =================================================
        */

        try {
            const parsed =
                JSON.parse(text);

            return parsed;

        } catch (parseError) {

            console.warn(
                "Gemini returned invalid JSON. Using fallback."
            );

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

            /*
            =============================================
            CONVERT IMAGE TO BASE64
            =============================================
            */

            const imageBase64 =
                imageBuffer.toString(
                    "base64"
                );

            /*
            =============================================
            IMAGE PROMPT
            =============================================
            */

            const prompt = `
You are ${assistantName}, a helpful AI virtual assistant.

The user's name is ${userName}.

The user uploaded an image and asked:

"${command}"

Analyze the image carefully.

You can analyze:

- handwritten notes
- printed notes
- mathematics
- chemistry
- physics
- graphs
- charts
- diagrams
- programming code
- screenshots
- tables
- documents
- multiple-choice questions

Rules:

1. Answer the user's exact question.

2. If there is a question, solve it completely.

3. If there is a calculation, show the calculation.

4. If there are MCQs, identify the correct option and explain why.

5. If there is code, explain errors and corrections.

6. If there are notes, explain the important points.

7. Do not invent information.

8. If something is unreadable, clearly say so.

9. Give a complete answer rather than only naming the topic.

10. Make the answer easy to understand.
`;

            /*
            =============================================
            GEMINI API
            =============================================
            */

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
                                        text:
                                            prompt
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

            /*
            =============================================
            GET IMAGE RESPONSE
            =============================================
            */

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

            /*
            =============================================
            CONVERT PDF TO BASE64
            =============================================
            */

            const pdfBase64 =
                pdfBuffer.toString(
                    "base64"
                );

            /*
            =============================================
            PDF PROMPT
            =============================================
            */

            const prompt = `
You are ${assistantName}, an advanced AI virtual assistant.

The user's name is ${userName}.

The user has uploaded a PDF document.

The user asks:

"${command}"

IMPORTANT:

Read and understand the uploaded PDF before answering.

The PDF is the PRIMARY SOURCE for your answer.

You can analyze:

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
- educational documents
- tables
- charts
- diagrams
- scanned pages
- MCQ papers
- exam papers

RULES:

1. Answer the user's exact question.

2. If the user asks "summarize this PDF", provide a useful structured summary.

3. If the user asks about a particular chapter, section, or page, explain that part.

4. If the user asks a question contained in the PDF, solve it completely.

5. If the PDF contains MCQs, identify the correct answer and explain why.

6. If the PDF contains mathematics, show the steps and final answer.

7. If the PDF contains chemistry, provide equations and explanations where appropriate.

8. If the PDF contains physics, show formulas, substitutions, and final answers where appropriate.

9. If the PDF contains programming code, explain it and identify errors.

10. If the PDF contains tables, use the actual information from the table.

11. If the PDF contains diagrams, explain what they represent.

12. If the PDF is scanned, use readable text from the scanned pages.

13. Do not invent information that cannot be found or reasonably derived from the PDF.

14. If the requested information cannot be found in the PDF, clearly say that it is not available in the uploaded document.

15. Give complete answers.

16. Do not answer with only the topic name.

17. If the question requires explanation, provide the explanation.

18. If the user asks for a direct answer, still include enough reasoning to make the answer understandable.
`;

            /*
            =============================================
            GEMINI API
            =============================================
            */

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
                                        text:
                                            prompt
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

            /*
            =============================================
            GET PDF RESPONSE
            =============================================
            */

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


/*
=====================================================
DEFAULT EXPORT
=====================================================
*/

export default geminiResponse;