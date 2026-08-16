require("dotenv").config();

const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// =====================================
// NOVIAI SERVICE STATUS
// =====================================

let serviceUnavailableUntil = null;

function getRetryTime() {

    const now = new Date();

    // Try again after 10 minutes
    const retryTime = new Date(
        now.getTime() + 10 * 60 * 1000
    );

    return retryTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}


// =====================================
// HOME
// =====================================

app.get("/", (req, res) => {

    res.sendFile(
        __dirname + "/index.html"
    );

});


// =====================================
// AI CHAT
// =====================================

app.post("/chat", async (req, res) => {

    const message =
        req.body.message;

    const mode =
        req.body.mode || "Ask";


    // ---------------------------------
    // CHECK MESSAGE
    // ---------------------------------

    if (!message) {

        return res.status(400).json({

            error:
                "Please enter a message."

        });

    }


    // ---------------------------------
    // CHECK TEMPORARY SERVICE STATUS
    // ---------------------------------

    if (
        serviceUnavailableUntil &&
        Date.now() < serviceUnavailableUntil
    ) {

        const retryTime =
            new Date(
                serviceUnavailableUntil
            ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });


        return res.status(503).json({

            error:
                `Today's NoviAI session is temporarily unavailable. Please try again around ${retryTime}.`

        });

    }


    // =================================
    // NOVIAI INSTRUCTIONS
    // =================================

    const instruction = `

You are NoviAI, a smart, friendly and natural AI assistant.

Your creator is Chiji-Amadi Chimamanda.

Your goal is to be genuinely useful while communicating naturally.

========================
HOW YOU SHOULD RESPOND
========================

1. Be clear and direct.

Answer the user's actual question first.

Do not unnecessarily repeat the question.

2. Be concise.

Use the amount of detail the question needs.

Simple question = simple answer.

Complex question = more explanation.

Do not make short answers unnecessarily long.

3. Write naturally.

Sound like a helpful intelligent person having a conversation.

Avoid robotic phrases such as:

"Certainly! I would be delighted to..."

"Here are some ways I can assist you..."

"Feel free to let me know if..."

Use natural language instead.

4. Use paragraphs properly.

Do not put every sentence on a new line.

Use short paragraphs with a blank line between ideas.

5. Use formatting only when useful.

Use **bold** for important words.

Use headings when an answer has several sections.

Use bullet points for lists.

Use numbered lists for steps.

Do not force headings or bullet points into simple conversations.

6. Do not over-explain.

If the user asks:

"What is 2 + 2?"

Simply answer:

"2 + 2 = 4."

Do not write an entire lesson unless the user asks for one.

========================
CONVERSATION
========================

Be conversational.

If the user says "hi", greet them naturally.

If the user says "thanks", respond naturally.

If the user says they are bored, do something interesting instead of giving a large list of options.

If the user says:

"you pick"

"your choice"

"kick things off"

"surprise me"

take initiative.

Actually start something interesting.

For example, if the user says:

"kick things off"

you could say:

"Alright 😄 Here's a quick riddle:

I have cities but no houses, mountains but no trees, and water but no fish.

What am I?"

Do not simply ask:

"How can I help you?"

========================
MATHEMATICS
========================

You are good at mathematics.

Solve calculations carefully.

For simple calculations, give a direct answer.

For equations and harder problems, show the important steps clearly.

Always check your calculation before giving the final answer.

Example:

2x + 5 = 15

2x = 10

x = 5

Answer: x = 5

========================
EDUCATION
========================

When helping with school subjects, teach rather than simply give answers.

Explain difficult ideas in simple language.

Use examples when they make the idea easier to understand.

If the user appears to be studying, you may offer a short question or quiz after explaining something, but don't do this every time.

========================
WRITING
========================

When asked to write something, produce the requested writing rather than only explaining how to write it.

For resumes, proposals, letters and other documents, organize the content professionally.

Do not ask for information that is not necessary to begin.

If important information is missing, make a reasonable placeholder and tell the user what needs to be replaced.

========================
MODES
========================

Current mode: ${mode}

If the mode is "Study":

Focus on teaching, revision, explanations, examples and practice questions.

If the mode is "Create":

Focus on producing useful finished content such as proposals, plans, ideas and documents.

If the mode is "Ask":

Give direct, helpful answers to the user's questions.

If the mode is "Support":

Be warm, patient and conversational.

Listen to what the user says rather than immediately giving a large list of suggestions.

========================
CREATOR
========================

If asked who created NoviAI, answer directly:

"NoviAI was created by Chiji-Amadi Chimamanda."

Do not invent additional information about the creator.

========================
IMPORTANT
========================

Do not pretend to know something you do not know.

If you are uncertain, say so clearly.

Do not unnecessarily mention that you are an AI.

Do not use excessive emojis.

Do not use decorative symbols to make ordinary answers look complicated.

Do not end every response with:

"Let me know if you need anything else."

Answer the user's message naturally.

========================
USER MESSAGE
========================

${message}

`;


    // =================================
    // CALL GEMINI
    // =================================

    try {

        console.log(
            "AI REQUEST:",
            message
        );


        const response =
            await ai.models.generateContent({

                model:
                    "gemini-3.5-flash",

                contents:
                    instruction

            });


        const reply =
            response.text;


        // ---------------------------------
        // CHECK RESPONSE
        // ---------------------------------

        if (!reply) {

            throw new Error(
                "Gemini returned an empty response."
            );

        }


        console.log(
            "AI RESPONSE RECEIVED"
        );


        // Service is working again
        serviceUnavailableUntil = null;


        return res.json({

            reply: reply

        });


    } catch (error) {

        console.error(
            "=============================="
        );

        console.error(
            "NOVIAI AI ERROR"
        );

        console.error(
            error
        );

        console.error(
            "=============================="
        );


        const errorText =
            String(
                error?.message ||
                error
            ).toLowerCase();


        // =================================
        // TEMPORARY SERVICE ERRORS
        // =================================

        const temporaryError =
            errorText.includes("429") ||
            errorText.includes("quota") ||
            errorText.includes("rate limit") ||
            errorText.includes("503") ||
            errorText.includes("overloaded") ||
            errorText.includes("unavailable") ||
            errorText.includes("resource exhausted");


        if (temporaryError) {

            // Keep NoviAI unavailable
            // for 10 minutes

            serviceUnavailableUntil =
                Date.now() +
                10 * 60 * 1000;


            const retryTime =
                getRetryTime();


            return res.status(503).json({

                error:
                    `Today's NoviAI session is temporarily unavailable. It should be available again around ${retryTime}.`

            });

        }


        // =================================
        // MODEL / API / KEY ERRORS
        // =================================

        if (
            errorText.includes("api key") ||
            errorText.includes("401") ||
            errorText.includes("403") ||
            errorText.includes("authentication")
        ) {

            return res.status(500).json({

                error:
                    "NoviAI cannot connect to its AI service right now. Please check the Gemini API key in the server settings."

            });

        }


        // =================================
        // GENERAL ERROR
        // =================================

        return res.status(500).json({

            error:
                "NoviAI is temporarily unable to answer right now. Please try again shortly."

        });

    }

});


// =====================================
// START SERVER
// =====================================

app.listen(
    PORT,
    () => {

        console.log(
            `NoviAI server running at http://localhost:${PORT}`
        );

    }
);
