let currentMode = "Ask";

// =====================================
// THINKING INDICATOR
// =====================================

function showThinking(text = "NoviAI is thinking") {
    hideThinking();

    const chat = document.getElementById("chat");

    const thinking = document.createElement("div");

    thinking.id = "thinkingIndicator";
    thinking.className = "message ai thinking-message";

    thinking.innerHTML = `
        <div class="message-content thinking-content">
            <span>${text}</span>
            <span class="thinking-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
            </span>
        </div>
    `;

    chat.appendChild(thinking);
    chat.scrollTop = chat.scrollHeight;
}


function hideThinking() {
    const thinking =
        document.getElementById("thinkingIndicator");

    if (thinking) {
        thinking.remove();
    }
}


// =====================================
// SEND MESSAGE
// =====================================

async function sendMessage() {

    const input =
        document.getElementById("messageInput");

    if (!input) return;

    const message =
        input.value.trim();

    if (!message) return;

    // Show user's message
    addMessage(message, "user");

    input.value = "";

    // =================================
    // IMAGE REQUEST
    // =================================

    if (needsImageSearch(message)) {

        showThinking("NoviAI is searching");

        await searchAndShowImages(message);

        if (isImageOnlyRequest(message)) {
            return;
        }
    }


    // =================================
    // NORMAL AI REQUEST
    // =================================

    showThinking("NoviAI is thinking");

    try {

        const response = await fetch("/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message,
                mode: currentMode
            })

        });


        const data =
            await response.json();


        console.log(
            "NoviAI response:",
            data
        );


        hideThinking();


        if (!response.ok) {

            addMessage(
                data.error ||
                "NoviAI returned an error.",
                "ai"
            );

            return;
        }


        if (data.reply) {

            addMessage(
                data.reply,
                "ai"
            );

        } else {

            addMessage(
                "NoviAI didn't return an answer.",
                "ai"
            );

        }


    } catch (error) {

        console.error(
            "CHAT ERROR:",
            error
        );

        hideThinking();

        addMessage(
            "NoviAI couldn't connect to the AI service. Please try again.",
            "ai"
        );

    }

}


// =====================================
// IMAGE DETECTION
// =====================================

function needsImageSearch(message) {

    const text =
        message.toLowerCase();

    const imageWords = [

        "diagram",
        "image",
        "picture",
        "photo",
        "illustration",
        "anatomy",
        "visual",

        "show me",
        "show a",
        "show the",

        "find me",
        "find a",
        "find the",

        "i need a diagram",
        "i need an image",
        "i need a picture",

        "what does it look like"

    ];

    return imageWords.some(
        word => text.includes(word)
    );

}


// =====================================
// IMAGE-ONLY REQUEST
// =====================================

function isImageOnlyRequest(message) {

    const text =
        message.toLowerCase().trim();

    const explanationWords = [

        "explain",
        "what is",
        "what are",
        "how does",
        "how do",
        "why",
        "tell me about",
        "describe",
        "teach me"

    ];

    const needsExplanation =
        explanationWords.some(
            word => text.includes(word)
        );

    return !needsExplanation &&
           needsImageSearch(text);

}


// =====================================
// SEARCH IMAGES
// =====================================

async function searchAndShowImages(query) {

    try {

        const searchQuery =
            cleanImageQuery(query);

        const response =
            await fetch(
                "/image-search?q=" +
                encodeURIComponent(searchQuery)
            );

        if (!response.ok) {

            throw new Error(
                "Image search failed."
            );

        }

        const data =
            await response.json();

        console.log(
            "Image search:",
            data
        );


        if (
            !data.results ||
            data.results.length === 0
        ) {

            hideThinking();

            addMessage(
                "I couldn't find suitable images for that.",
                "ai"
            );

            return;
        }


        hideThinking();

        displayImages(
            data.results,
            searchQuery
        );


    } catch (error) {

        console.error(
            "IMAGE SEARCH ERROR:",
            error
        );

        hideThinking();

        addMessage(
            "I couldn't search for images right now.",
            "ai"
        );

    }

}


// =====================================
// CLEAN IMAGE QUERY
// =====================================

function cleanImageQuery(query) {

    let cleaned =
        query.toLowerCase();

    cleaned = cleaned
        .replace(/show me/gi, "")
        .replace(/show a/gi, "")
        .replace(/show the/gi, "")
        .replace(/find me/gi, "")
        .replace(/find a/gi, "")
        .replace(/find the/gi, "")
        .replace(/i need a/gi, "")
        .replace(/i need an/gi, "")
        .replace(/please show/gi, "")
        .replace(/please find/gi, "")
        .replace(/image of/gi, "")
        .replace(/picture of/gi, "")
        .replace(/photo of/gi, "")
        .replace(/diagram of/gi, "")
        .trim();


    // Better searches for common school topics

    if (cleaned.includes("heart")) {
        return "human heart anatomy labeled diagram";
    }

    if (cleaned.includes("digestive system")) {
        return "human digestive system labeled diagram";
    }

    if (cleaned.includes("respiratory system")) {
        return "human respiratory system labeled diagram";
    }

    if (cleaned.includes("human eye")) {
        return "human eye anatomy labeled diagram";
    }

    if (cleaned.includes("plant cell")) {
        return "plant cell labeled diagram";
    }

    if (cleaned.includes("animal cell")) {
        return "animal cell labeled diagram";
    }

    if (cleaned.includes("photosynthesis")) {
        return "photosynthesis labeled diagram";
    }

    if (cleaned.includes("atom")) {
        return "atomic structure diagram";
    }

    return cleaned;

}


// =====================================
// DISPLAY IMAGES
// =====================================

function displayImages(results, query) {

    const chat =
        document.getElementById("chat");

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "message ai";

    const content =
        document.createElement("div");

    content.className =
        "message-content image-results";

    const heading =
        document.createElement("div");

    heading.className =
        "image-results-title";

    heading.textContent =
        "🔎 Diagrams I found for " + query;

    content.appendChild(heading);

    const grid =
        document.createElement("div");

    grid.className =
        "image-grid";


    results.slice(0, 6).forEach(
        result => {

            const card =
                document.createElement("div");

            card.className =
                "image-card";

            const link =
                document.createElement("a");

            link.href =
                result.original ||
                result.source;

            link.target =
                "_blank";

            link.rel =
                "noopener noreferrer";


            const image =
                document.createElement("img");

            image.src =
                result.image;

            image.alt =
                result.title ||
                "NoviAI image";

            image.loading =
                "lazy";


            image.onerror =
                function() {
                    card.remove();
                };


            link.appendChild(image);


            const title =
                document.createElement("div");

            title.className =
                "image-title";

            title.textContent =
                result.title;


            const source =
                document.createElement("a");

            source.href =
                result.source;

            source.target =
                "_blank";

            source.rel =
                "noopener noreferrer";

            source.className =
                "image-source";

            source.textContent =
                "View source";


            card.appendChild(link);
            card.appendChild(title);
            card.appendChild(source);

            grid.appendChild(card);

        }
    );


    content.appendChild(grid);


    const note =
        document.createElement("div");

    note.className =
        "image-note";

    note.textContent =
        "Images from Wikimedia Commons. Click an image to view its source.";

    content.appendChild(note);

    wrapper.appendChild(content);

    chat.appendChild(wrapper);

    chat.scrollTop =
        chat.scrollHeight;

}


// =====================================
// CLEAN AI RESPONSE FORMATTER
// =====================================

function formatAIResponse(text) {

    if (!text) {
        return "";
    }

    let html = String(text);


    // =================================
    // ESCAPE HTML
    // =================================

    html = html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");


    // =================================
    // CODE BLOCKS
    // =================================

    const codeBlocks = [];

    html = html.replace(
        /```([\s\S]*?)```/g,
        function(match, code) {

            const index =
                codeBlocks.length;

            codeBlocks.push(code.trim());

            return `___CODE_BLOCK_${index}___`;

        }
    );


    // =================================
    // INLINE CODE
    // =================================

    html = html.replace(
        /`([^`]+)`/g,
        "<code>$1</code>"
    );


    // =================================
    // BOLD + ITALIC
    // =================================

    html = html.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );

    html = html.replace(
        /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
        "<em>$1</em>"
    );


    // =================================
    // HEADINGS
    // =================================

    html = html.replace(
        /^###\s+(.*)$/gm,
        "<h4>$1</h4>"
    );

    html = html.replace(
        /^##\s+(.*)$/gm,
        "<h3>$1</h3>"
    );

    html = html.replace(
        /^#\s+(.*)$/gm,
        "<h2>$1</h2>"
    );


    // =================================
    // NUMBERED LISTS
    // =================================

    html = html.replace(
        /^\s*\d+\.\s+(.*)$/gm,
        "<li>$1</li>"
    );


    // =================================
    // BULLET LISTS
    // =================================

    html = html.replace(
        /^\s*[-*•]\s+(.*)$/gm,
        "<li>$1</li>"
    );


    // =================================
    // GROUP LIST ITEMS
    // =================================

    html = html.replace(
        /((?:<li>.*?<\/li>\s*)+)/gs,
        function(match) {

            const items =
                match.match(
                    /<li>.*?<\/li>/gs
                );

            if (!items) {
                return match;
            }

            return `
                <ul class="ai-list">
                    ${items.join("")}
                </ul>
            `;

        }
    );


    // =================================
    // PARAGRAPHS
    // =================================

    const blocks =
        html.split(/\n\s*\n/);


    html =
        blocks.map(block => {

            block = block.trim();

            if (!block) {
                return "";
            }


            // Don't wrap special blocks

            if (
                block.startsWith("<h2>") ||
                block.startsWith("<h3>") ||
                block.startsWith("<h4>") ||
                block.startsWith("<ul") ||
                block.startsWith("___CODE_BLOCK_")
            ) {
                return block;
            }


            // Keep single line breaks clean

            return `
                <p>
                    ${block.replace(/\n/g, "<br>")}
                </p>
            `;

        }).join("");


    // =================================
    // RESTORE CODE BLOCKS
    // =================================

    codeBlocks.forEach(
        function(code, index) {

            const formattedCode =
                escapeCode(code);

            html = html.replace(
                `___CODE_BLOCK_${index}___`,
                `
                <pre class="ai-code">
                    <code>${formattedCode}</code>
                </pre>
                `
            );

        }
    );


    return html;

}


// =====================================
// ESCAPE CODE
// =====================================

function escapeCode(code) {

    return String(code)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}


// =====================================
// ADD MESSAGE
// =====================================

function addMessage(text, sender) {

    const chat =
        document.getElementById("chat");

    const message =
        document.createElement("div");

    message.className =
        "message " + sender;


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    // Format AI responses
    // Keep user messages simple

    if (sender === "ai") {

        content.innerHTML =
            formatAIResponse(text);

    } else {

        content.textContent =
            text;

    }


    message.appendChild(content);

    chat.appendChild(message);


    // Smooth scroll

    requestAnimationFrame(() => {

        chat.scrollTo({
            top: chat.scrollHeight,
            behavior: "smooth"
        });

    });

}


// =====================================
// SUGGESTION BUTTONS
// =====================================

function useSuggestion(text) {

    const input =
        document.getElementById("messageInput");

    if (!input) return;

    input.value =
        text;

    sendMessage();

}


// =====================================
// ENTER KEY
// =====================================

function handleKey(event) {

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        sendMessage();

    }

}


// =====================================
// CHANGE MODE
// =====================================

function changeMode(mode) {

    currentMode =
        mode;

    const title =
        document.getElementById("modeTitle");

    const description =
        document.getElementById("modeDescription");

    if (!title || !description) {
        return;
    }


    if (mode === "Study") {

        title.textContent =
            "Study with NoviAI";

        description.textContent =
            "Learn, revise and prepare for your exams.";

    }


    else if (mode === "Create") {

        title.textContent =
            "Create with NoviAI";

        description.textContent =
            "Create plans, proposals, reports and ideas.";

    }


    else if (mode === "Ask") {

        title.textContent =
            "Ask NoviAI";

        description.textContent =
            "Ask questions and get helpful answers.";

    }


    else if (mode === "Support") {

        title.textContent =
            "Talk with NoviAI";

        description.textContent =
            "A supportive space to talk and reflect.";

    }

}


// =====================================
// NEW CHAT
// =====================================

function newChat() {

    hideThinking();

    const chat =
        document.getElementById("chat");

    chat.innerHTML = `

        <div class="welcome">

            <div class="welcome-icon">
                ✦
            </div>

            <h1>New conversation</h1>

            <p>
                What would you like help with?
            </p>

        </div>

    `;

}


// =====================================
// HOME
// =====================================

function goHome() {

    window.location.href =
        "index.html";

}