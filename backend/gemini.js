
import axios from "axios";

/*
=====================================================
INDIAN DATE / TIME HELPERS
=====================================================
*/

const getIndianDateTime = () => {
    const now = new Date();

    const dateTime = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    }).formatToParts(now);

    const parts = {};

    dateTime.forEach((part) => {
        if (part.type !== "literal") {
            parts[part.type] = part.value;
        }
    });

    return parts;
};


/*
=====================================================
DETECT REAL DATE / TIME COMMANDS
=====================================================
*/

const getDateTimeResponse = (command) => {
    const text = command
        .toLowerCase()
        .trim()
        .replace(/[?!.]/g, "");

    const parts = getIndianDateTime();

    const time = `${parts.hour}:${parts.minute}:${parts.second} ${parts.dayPeriod}`;

    const date = `${parts.weekday}, ${parts.day} ${parts.month} ${parts.year}`;

    const day = parts.weekday;

    const month = parts.month;

    const year = parts.year;


    /*
    =================================================
    TIME
    =================================================
    */

    const isTimeCommand =
        text === "time" ||
        text.includes("what time is it") ||
        text.includes("what is the time") ||
        text.includes("current time") ||
        text.includes("tell me the time") ||
        text.includes("tell me current time") ||
        text.includes("time right now") ||
        text.includes("what's the time") ||
        text.includes("whats the time");


    if (isTimeCommand) {
        return {
            type: "get_time",
            userInput: command,
            response: `The current time is ${time}.`,
            query: ""
        };
    }


    /*
    =================================================
    DATE
    =================================================
    */

    const isDateCommand =
        text === "date" ||
        text.includes("what date is it") ||
        text.includes("what is the date") ||
        text.includes("what's the date") ||
        text.includes("whats the date") ||
        text.includes("today's date") ||
        text.includes("todays date") ||
        text.includes("current date") ||
        text.includes("today date") ||
        text.includes("tell me today's date") ||
        text.includes("tell me todays date");


    if (isDateCommand) {
        return {
            type: "get_date",
            userInput: command,
            response: `Today is ${date}.`,
            query: ""
        };
    }


    /*
    =================================================
    DAY
    =================================================
    */

    const isDayCommand =
        text === "day" ||
        text.includes("what day is it") ||
        text.includes("what is the day") ||
        text.includes("what day today") ||
        text.includes("which day is today") ||
        text.includes("what day is today") ||
        text.includes("today's day") ||
        text.includes("todays day") ||
        text.includes("current day") ||
        text.includes("tell me the day");


    if (isDayCommand) {
        return {
            type: "get_day",
            userInput: command,
            response: `Today is ${day}.`,
            query: ""
        };
    }


    /*
    =================================================
    MONTH
    =================================================
    */

    const isMonthCommand =
        text === "month" ||
        text.includes("what month is it") ||
        text.includes("what is the month") ||
        text.includes("which month is it") ||
        text.includes("current month") ||
        text.includes("what month are we in") ||
        text.includes("which month are we in") ||
        text.includes("tell me the month");


    if (isMonthCommand) {
        return {
            type: "get_month",
            userInput: command,
            response: `The current month is ${month}.`,
            query: ""
        };
    }


    /*
    =================================================
    YEAR
    =================================================
    */

    const isYearCommand =
        text === "year" ||
        text.includes("what year is it") ||
        text.includes("what is the year") ||
        text.includes("which year is it") ||
        text.includes("current year") ||
        text.includes("what year are we in") ||
        text.includes("which year are we in") ||
        text.includes("tell me the year");


    if (isYearCommand) {
        return {
            type: "get_date",
            userInput: command,
            response: `The current year is ${year}.`,
            query: ""
        };
    }


    /*
    =================================================
    FULL DATE + TIME
    =================================================
    */

    const isDateTimeCommand =
        text.includes("date and time") ||
        text.includes("date & time") ||
        text.includes("date plus time") ||
        text.includes("current date and time") ||
        text.includes("today and time");


    if (isDateTimeCommand) {
        return {
            type: "get_date",
            userInput: command,
            response: `Today is ${date}, and the current time is ${time}.`,
            query: ""
        };
    }


    return null;
};


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

        /*
        =================================================
        FIRST:
        HANDLE DATE/TIME LOCALLY
        DO NOT ASK GEMINI
        =================================================
        */

        const dateTimeResponse =
            getDateTimeResponse(command);

        if (dateTimeResponse) {

            console.log(
                "REAL DATE/TIME RESPONSE:",
                dateTimeResponse
            );

            return dateTimeResponse;
        }


        /*
        =================================================
        GEMINI API KEY
        =================================================
        */

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

Understand the user's command.

Return ONLY valid JSON:

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

1. Normal questions use "general".
2. Give the actual answer in "response".
3. Give complete useful answers.
4. For calculations, provide the actual result.
5. For Google searches, use "google_search".
6. For YouTube searches, use "youtube_search".
7. For YouTube playing, use "youtube_play".
8. For opening Google, use "google_open".
9. For opening YouTube, use "youtube_open".
10. For opening calculator, use "calculator_open".
11. userInput must contain the original command.
12. Return ONLY JSON.
13. Do not use Markdown code fences.
14. Do not guess the current date, time, month, day, or year.
15. Date/time commands are handled by the server and should normally never reach you.
16. For normal questions, provide a complete useful answer rather than only naming the topic.

USER COMMAND:
${command}
`;


        /*
        =================================================
        GEMINI API URL
        =================================================
        */

        const apiUrl =
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;


        /*
        =================================================
        GEMINI REQUEST
        =================================================
        */

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
        GET GEMINI RESPONSE
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

        } catch {

            return {

                type:
                    "general",

                userInput:
                    command,

                response:
                    text.trim(),

                query:
                    ""
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
6. If there are notes, explain important points.
7. Do not invent information.
8. If something is unreadable, say so.
9. Give a complete answer rather than only naming the topic.
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
                            temperature:
                                0.2
                        }
                    },

                    {
                        headers: {

                            "Content-Type":
                                "application/json"
                        },

                        timeout:
                            60000
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

3. If the user asks about a particular chapter, section or page, explain that part.

4. If the user asks a question contained in the PDF, solve it completely.

5. If the PDF contains MCQs, identify the correct answer and explain why.

6. If the PDF contains mathematics, show the steps and final answer.

7. If the PDF contains chemistry, provide equations and explanations where appropriate.

8. If the PDF contains physics, show formulas, substitutions and final answers where appropriate.

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
                            temperature:
                                0.2
                        }
                    },

                    {
                        headers: {

                            "Content-Type":
                                "application/json"
                        },

                        timeout:
                            120000
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