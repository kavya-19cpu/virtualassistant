import axios from "axios";

// ============================================================
// GEMINI API
// ============================================================

const getGeminiApiUrl = () => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing");
    }

    return `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
};

// ============================================================
// EXTRACT GEMINI TEXT
// ============================================================

const extractGeminiText = (response) => {
    return response.data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim();
};

// ============================================================
// LOG GEMINI ERROR
// ============================================================

const logGeminiError = (label, error) => {
    console.error("=================================");
    console.error(label);
    console.error("=================================");

    console.error("MESSAGE:", error?.message);
    console.error("CODE:", error?.code);
    console.error("STATUS:", error?.response?.status);

    console.error(
        "GEMINI RESPONSE:",
        JSON.stringify(
            error?.response?.data || null,
            null,
            2
        )
    );

    if (error?.request && !error?.response) {
        console.error(
            "REQUEST ERROR: Gemini did not return an HTTP response."
        );
    }
};

// ============================================================
// NORMAL GEMINI RESPONSE
// USED BY askToAssistant
// ============================================================

async function geminiResponse(
    command,
    assistantName,
    userName
) {
    try {
        const apiUrl = getGeminiApiUrl();

        const prompt = `
You are ${assistantName}, a highly accurate AI virtual assistant.

The user's name is ${userName}.

The user asked:

"${command}"

Answer the user's question accurately and directly.

GENERAL ACCURACY RULES:

- Understand the complete question before answering.
- Do not invent information.
- Do not guess when important information is missing.
- Preserve numbers, signs, units, formulas and symbols.
- Check calculations before giving the final answer.
- For mathematics, recalculate the result.
- For trigonometry, verify identities and angle assumptions.
- For chemistry, preserve formulas, subscripts, charges and coefficients.
- For physics, verify formulas, substitutions and units.
- For science, use established scientific principles.
- For programming, check syntax and logic carefully.
- For MCQs, consider every option before selecting the answer.

If the user asks for a short answer, be concise.

If the user asks for an explanation, provide clear steps.

Give the best accurate answer to the user.
`;

        const response = await axios.post(
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
                    temperature: 0.1
                }
            },
            {
                timeout: 120000
            }
        );

        const answer = extractGeminiText(response);

        if (!answer) {
            throw new Error(
                "Gemini returned an empty response"
            );
        }

        return answer;

    } catch (error) {

        logGeminiError(
            "GEMINI NORMAL RESPONSE ERROR",
            error
        );

        throw error;
    }
}

// ============================================================
// GEMINI IMAGE RESPONSE
//
// TWO-PASS SYSTEM
//
// PASS 1 = SOLVE
// PASS 2 = VERIFY + CORRECT
// ============================================================

async function geminiImageResponse(
    command,
    imageBuffer,
    mimeType,
    assistantName,
    userName
) {
    try {

        // ====================================================
        // VALIDATE IMAGE
        // ====================================================

        if (!imageBuffer) {
            throw new Error(
                "Image buffer is missing"
            );
        }

        if (!Buffer.isBuffer(imageBuffer)) {
            throw new Error(
                "Image data is not a valid buffer"
            );
        }

        if (imageBuffer.length === 0) {
            throw new Error(
                "Image buffer is empty"
            );
        }

        if (!mimeType) {
            throw new Error(
                "Image MIME type is missing"
            );
        }

        console.log("=================================");
        console.log("IMAGE INPUT DEBUG");
        console.log("=================================");
        console.log("MIME TYPE:", mimeType);
        console.log("BUFFER SIZE:", imageBuffer.length);

        const supportedMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/heic",
            "image/heif"
        ];

        if (!supportedMimeTypes.includes(mimeType)) {
            throw new Error(
                `Unsupported image MIME type: ${mimeType}`
            );
        }

        const apiUrl = getGeminiApiUrl();

        const base64Image =
            imageBuffer.toString("base64");

        if (!base64Image) {
            throw new Error(
                "Failed to convert image to base64"
            );
        }

        console.log(
            "BASE64 IMAGE LENGTH:",
            base64Image.length
        );

        // ====================================================
        // PASS 1 — SOLVE
        // ====================================================

        const solvePrompt = `
You are ${assistantName}, a highly accurate AI virtual assistant.

The user's name is ${userName}.

The user uploaded an image and asked:

"${command}"

The uploaded image is the PRIMARY SOURCE.

Your job is to carefully read the image and solve the EXACT question asked by the user.

============================================================
STEP 1 — READ THE IMAGE
============================================================

Read the entire relevant image carefully.

Pay special attention to:

- numbers
- words
- + and - signs
- fractions
- numerator and denominator
- decimal points
- powers and exponents
- square roots
- brackets
- variables
- mathematical symbols
- angles
- units
- chemical formulas
- chemical subscripts
- superscripts
- charges
- reaction arrows
- diagrams
- graphs
- tables
- MCQ options
- programming code

NEVER guess information that is genuinely unreadable.

============================================================
STEP 2 — PRESERVE THE ORIGINAL QUESTION
============================================================

Do NOT accidentally change:

+ into -
- into +
× into ÷
÷ into ×

Do NOT:

- swap numerator and denominator
- remove a negative sign
- change an exponent
- change a root
- change a decimal
- change a chemical subscript
- change a chemical formula
- change a coefficient
- change a unit
- omit an important symbol

Read fractions, equations and expressions exactly as shown.

============================================================
MATHEMATICS
============================================================

For mathematics:

1. Read the complete expression.
2. Identify exactly what is being asked.
3. Select the correct formula or identity.
4. Substitute carefully.
5. Calculate carefully.
6. Recalculate the result.
7. Check the result against the original question.

For trigonometry:

- Correctly identify opposite, adjacent and hypotenuse.
- Use the correct trigonometric ratio.
- Preserve the angle.
- Check identities.
- Check whether an acute-angle assumption is required.
- Verify the final value.

Important identities:

sin²θ + cos²θ = 1

tan θ = sin θ / cos θ

cot θ = cos θ / sin θ

sec θ = 1 / cos θ

cosec θ = 1 / sin θ

============================================================
CHEMISTRY
============================================================

Read formulas EXACTLY.

Pay special attention to:

- subscripts
- superscripts
- coefficients
- charges
- brackets
- ions
- reaction arrows
- reaction conditions
- temperature
- catalysts
- physical states

For balancing equations:

1. Count every atom on both sides.
2. Balance using COEFFICIENTS.
3. NEVER change subscripts merely to balance.
4. Recount all atoms.
5. Check charge for ionic equations.
6. Verify the final equation.

============================================================
PHYSICS
============================================================

For physics:

1. Identify the given quantities.
2. Identify what is required.
3. Select the correct formula/law.
4. Substitute values carefully.
5. Calculate.
6. Check units.
7. Check dimensions when appropriate.
8. Verify the final result.

============================================================
BIOLOGY / SCIENCE
============================================================

- Read the question carefully.
- Use established scientific principles.
- Do not invent facts.
- Carefully inspect diagrams and labels.
- Do not assume information that is not given.

============================================================
PROGRAMMING
============================================================

If code is present:

- Read the complete visible code.
- Identify the language.
- Preserve variable names.
- Check syntax.
- Check logic.
- Check brackets.
- Check conditions.
- Check loops and functions.
- Do not invent missing code.

============================================================
MCQs
============================================================

For MCQs:

1. Read the complete question.
2. Read every option.
3. Solve independently.
4. Compare the result with the options.
5. Select the correct option.
6. Verify that the selected option matches the result.

============================================================
FINAL CHECK
============================================================

Before answering, verify internally:

- Question read correctly
- Numbers correct
- Signs correct
- Fractions correct
- Powers correct
- Roots correct
- Formula correct
- Calculation correct
- Units correct
- Chemical formulas correct
- MCQ option correct
- Final answer matches the question

If something is genuinely unreadable, DO NOT GUESS.

Answer the exact question asked.

If the user asks for "correct answers only", provide concise final answers.

If the user asks for steps, provide clear steps and the final answer.
`;

        console.log("=================================");
        console.log("IMAGE PASS 1 START");
        console.log("=================================");

        let firstResponse;

        try {

            firstResponse = await axios.post(
                apiUrl,
                {
                    contents: [
                        {
                            parts: [
                                {
                                    text: solvePrompt
                                },
                                {
                                    inline_data: {
                                        mime_type: mimeType,
                                        data: base64Image
                                    }
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.1
                    }
                },
                {
                    timeout: 120000
                }
            );

            console.log(
                "IMAGE PASS 1 HTTP STATUS:",
                firstResponse.status
            );

            console.log(
                "IMAGE PASS 1 SUCCESS"
            );

        } catch (error) {

            logGeminiError(
                "IMAGE PASS 1 FAILED",
                error
            );

            throw error;
        }

        const firstAnswer =
            extractGeminiText(firstResponse);

        if (!firstAnswer) {
            throw new Error(
                "Gemini first image pass returned empty response"
            );
        }

        console.log(
            "================================="
        );

        console.log(
            "GEMINI IMAGE PASS 1 ANSWER"
        );

        console.log(
            "================================="
        );

        console.log(firstAnswer);

        // ====================================================
        // PASS 2 — INDEPENDENT VERIFICATION
        // ====================================================

        const verifyPrompt = `
You are the FINAL VERIFICATION ENGINE.

The user asked:

"${command}"

The ORIGINAL IMAGE is attached.

The first AI produced this answer:

================ FIRST ANSWER ================

${firstAnswer}

================================================

DO NOT blindly trust the first answer.

You must independently read the ORIGINAL IMAGE again and verify the answer.

================================================
CHECK 1 — QUESTION READING
================================================

Verify that the first AI correctly understood:

- every number
- every word
- every symbol
- every sign
- every fraction
- numerator
- denominator
- exponent
- root
- bracket
- variable
- unit
- diagram
- graph
- table
- MCQ options

If the question was read incorrectly, correct it.

================================================
CHECK 2 — MATHEMATICS
================================================

Independently recalculate the answer.

Check:

- arithmetic
- algebra
- fractions
- signs
- powers
- roots
- substitutions
- equations
- trigonometry
- identities
- geometry

Do not accept the first answer merely because its working looks correct.

================================================
CHECK 3 — CHEMISTRY
================================================

If chemistry is involved, check:

- chemical formulas
- subscripts
- coefficients
- charges
- oxidation states
- atoms
- ionic charge
- reaction conditions

For a balanced equation:

COUNT EVERY ATOM AGAIN.

NEVER change subscripts to balance an equation.

Use coefficients only when balancing.

================================================
CHECK 4 — PHYSICS
================================================

Check:

- given values
- required value
- formula
- substitutions
- arithmetic
- units
- dimensions
- physical reasonableness

================================================
CHECK 5 — MCQ
================================================

Solve the MCQ independently.

Compare the calculated or derived answer against EVERY option.

If the first AI selected the wrong option, replace it with the correct option.

================================================
CHECK 6 — FINAL RESULT
================================================

If the first answer is correct:

KEEP IT.

If the first answer is wrong:

CORRECT IT.

If the first answer contains only a small calculation error:

CORRECT ONLY THE ERROR.

If the image is genuinely unreadable:

DO NOT GUESS.

Clearly state what cannot be determined.

================================================
FINAL RESPONSE
================================================

Return ONLY the final verified answer to the user.

Do NOT mention:

- Pass 1
- Pass 2
- verification
- first AI
- this prompt
- internal reasoning

If the user asked for "correct answers only":

Give only the final answers, clearly numbered.

If the user asked for explanation:

Give concise steps followed by the final answer.

Accuracy is more important than speed.
`;

        console.log("=================================");
        console.log("IMAGE PASS 2 START");
        console.log("=================================");

        let secondResponse;

        try {

            secondResponse = await axios.post(
                apiUrl,
                {
                    contents: [
                        {
                            parts: [
                                {
                                    text: verifyPrompt
                                },
                                {
                                    inline_data: {
                                        mime_type: mimeType,
                                        data: base64Image
                                    }
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.1
                    }
                },
                {
                    timeout: 120000
                }
            );

            console.log(
                "IMAGE PASS 2 HTTP STATUS:",
                secondResponse.status
            );

            console.log(
                "IMAGE PASS 2 SUCCESS"
            );

        } catch (error) {

            logGeminiError(
                "IMAGE PASS 2 FAILED",
                error
            );

            throw error;
        }

        const verifiedAnswer =
            extractGeminiText(secondResponse);

        if (!verifiedAnswer) {
            throw new Error(
                "Gemini image verification returned empty response"
            );
        }

        console.log(
            "================================="
        );

        console.log(
            "GEMINI FINAL VERIFIED IMAGE ANSWER"
        );

        console.log(
            "================================="
        );

        console.log(verifiedAnswer);

        return verifiedAnswer;

    } catch (error) {

        logGeminiError(
            "GEMINI IMAGE RESPONSE FINAL ERROR",
            error
        );

        throw error;
    }
}

// ============================================================
// GEMINI PDF RESPONSE
//
// TWO-PASS SYSTEM
//
// PASS 1 = SOLVE
// PASS 2 = VERIFY + CORRECT
// ============================================================

async function geminiPdfResponse(
    command,
    pdfBuffer,
    assistantName,
    userName
) {
    try {

        if (!pdfBuffer) {
            throw new Error(
                "PDF buffer is missing"
            );
        }

        if (!Buffer.isBuffer(pdfBuffer)) {
            throw new Error(
                "PDF data is not a valid buffer"
            );
        }

        if (pdfBuffer.length === 0) {
            throw new Error(
                "PDF buffer is empty"
            );
        }

        console.log("=================================");
        console.log("PDF INPUT DEBUG");
        console.log("=================================");
        console.log(
            "PDF BUFFER SIZE:",
            pdfBuffer.length
        );

        const apiUrl = getGeminiApiUrl();

        const base64Pdf =
            pdfBuffer.toString("base64");

        // ====================================================
        // PASS 1 — SOLVE PDF
        // ====================================================

        const solvePrompt = `
You are ${assistantName}, a highly accurate AI virtual assistant.

The user's name is ${userName}.

The user uploaded a PDF and asked:

"${command}"

The uploaded PDF is the PRIMARY SOURCE.

Read the relevant pages carefully and answer the EXACT question.

============================================================
READ CAREFULLY
============================================================

Pay special attention to:

- numbers
- words
- signs
- fractions
- numerator/denominator
- powers
- roots
- equations
- mathematical symbols
- chemical formulas
- subscripts
- superscripts
- charges
- reaction arrows
- units
- tables
- graphs
- diagrams
- MCQs
- programming code

Do NOT guess unreadable information.

============================================================
MATHEMATICS
============================================================

- Read the complete expression.
- Preserve every sign.
- Preserve fractions.
- Preserve powers and roots.
- Use the correct formula.
- Calculate carefully.
- Recalculate and verify the result.

For trigonometry:

- Identify the correct triangle relationships.
- Use the correct trigonometric ratio.
- Check identities.
- Verify the final answer.

============================================================
CHEMISTRY
============================================================

Preserve:

- chemical formulas
- subscripts
- coefficients
- charges
- brackets
- reaction conditions

For balancing:

- Count atoms.
- Balance using coefficients.
- NEVER change subscripts.
- Recount atoms.
- Check charge where applicable.

============================================================
PHYSICS
============================================================

- Identify given values.
- Identify required value.
- Select correct formula.
- Substitute carefully.
- Calculate.
- Check units.
- Verify the result.

============================================================
BIOLOGY / SCIENCE
============================================================

Use correct scientific principles.

Do not invent information.

============================================================
PROGRAMMING
============================================================

Read the relevant code completely.

Check:

- syntax
- logic
- variables
- functions
- loops
- conditions
- brackets

============================================================
MCQs
============================================================

Solve independently first.

Then compare against all options.

============================================================
FINAL CHECK
============================================================

Before answering, verify:

- question
- numbers
- signs
- fractions
- powers
- roots
- formulas
- calculations
- units
- chemical equations
- MCQ options
- final answer

If information is genuinely unreadable, do not guess.

Give the answer requested by the user.
`;

        console.log("=================================");
        console.log("PDF PASS 1 START");
        console.log("=================================");

        let firstResponse;

        try {

            firstResponse = await axios.post(
                apiUrl,
                {
                    contents: [
                        {
                            parts: [
                                {
                                    text: solvePrompt
                                },
                                {
                                    inline_data: {
                                        mime_type:
                                            "application/pdf",
                                        data: base64Pdf
                                    }
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.1
                    }
                },
                {
                    timeout: 120000
                }
            );

            console.log(
                "PDF PASS 1 HTTP STATUS:",
                firstResponse.status
            );

            console.log(
                "PDF PASS 1 SUCCESS"
            );

        } catch (error) {

            logGeminiError(
                "PDF PASS 1 FAILED",
                error
            );

            throw error;
        }

        const firstAnswer =
            extractGeminiText(firstResponse);

        if (!firstAnswer) {
            throw new Error(
                "Gemini first PDF pass returned empty response"
            );
        }

        console.log(
            "================================="
        );

        console.log(
            "GEMINI PDF PASS 1 ANSWER"
        );

        console.log(
            "================================="
        );

        console.log(firstAnswer);

        // ====================================================
        // PASS 2 — VERIFY PDF ANSWER
        // ====================================================

        const verifyPrompt = `
You are the FINAL ANSWER VERIFICATION ENGINE.

The user asked:

"${command}"

The ORIGINAL PDF is attached.

The first AI produced:

================ FIRST ANSWER ================

${firstAnswer}

================================================

DO NOT blindly trust this answer.

Read the ORIGINAL PDF again and independently verify it.

================================================
CHECK EVERYTHING
================================================

Check:

1. Question was read correctly.
2. Numbers were copied correctly.
3. Signs were copied correctly.
4. Fractions are correct.
5. Numerators and denominators are correct.
6. Powers and roots are correct.
7. Variables are correct.
8. Units are correct.
9. Diagrams were interpreted correctly.
10. Tables and graphs were read correctly.

================================================
MATHEMATICS
================================================

Recalculate independently.

Check:

- arithmetic
- algebra
- trigonometry
- equations
- identities
- substitutions
- final value

If the first answer is wrong, CORRECT IT.

================================================
CHEMISTRY
================================================

Check:

- chemical formulas
- subscripts
- coefficients
- charges
- atoms
- ionic charge
- reaction conditions

For balancing equations:

COUNT EVERY ATOM AGAIN.

Never change subscripts merely to balance.

================================================
PHYSICS
================================================

Check:

- formula
- given values
- substitution
- arithmetic
- units
- dimensions
- final result

================================================
MCQs
================================================

Solve independently.

Check every option.

Select the option that actually matches the correct result.

================================================
FINAL RESPONSE
================================================

Return ONLY the FINAL VERIFIED ANSWER.

Do not mention the verification process.

Do not mention the first AI.

Do not mention this prompt.

If the user requested "correct answers only", give only the answers.

If the user requested steps, give concise steps and the final answer.

If something important in the PDF is genuinely unreadable, say so rather than guessing.

Accuracy is more important than speed.
`;

        console.log("=================================");
        console.log("PDF PASS 2 START");
        console.log("=================================");

        let secondResponse;

        try {

            secondResponse = await axios.post(
                apiUrl,
                {
                    contents: [
                        {
                            parts: [
                                {
                                    text: verifyPrompt
                                },
                                {
                                    inline_data: {
                                        mime_type:
                                            "application/pdf",
                                        data: base64Pdf
                                    }
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.1
                    }
                },
                {
                    timeout: 120000
                }
            );

            console.log(
                "PDF PASS 2 HTTP STATUS:",
                secondResponse.status
            );

            console.log(
                "PDF PASS 2 SUCCESS"
            );

        } catch (error) {

            logGeminiError(
                "PDF PASS 2 FAILED",
                error
            );

            throw error;
        }

        const verifiedAnswer =
            extractGeminiText(secondResponse);

        if (!verifiedAnswer) {
            throw new Error(
                "Gemini PDF verification returned empty response"
            );
        }

        console.log(
            "================================="
        );

        console.log(
            "GEMINI FINAL VERIFIED PDF ANSWER"
        );

        console.log(
            "================================="
        );

        console.log(verifiedAnswer);

        return verifiedAnswer;

    } catch (error) {

        logGeminiError(
            "GEMINI PDF RESPONSE FINAL ERROR",
            error
        );

        throw error;
    }
}

// ============================================================
// EXPORTS
// ============================================================

export default geminiResponse;

export {
    geminiImageResponse,
    geminiPdfResponse
};