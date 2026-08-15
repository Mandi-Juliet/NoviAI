// =====================================
// NOVIAI HOME PAGE JAVASCRIPT
// =====================================

// Open the AI chat page
function openAI() {
    window.location.href = "ai.html";
}


// Smoothly scroll to the features section
function scrollToFeatures() {
    const features = document.getElementById("features");

    if (features) {
        features.scrollIntoView({
            behavior: "smooth"
        });
    }
}


// =====================================
// MODE SELECTION
// =====================================

function selectMode(mode) {

    // Save the selected mode
    localStorage.setItem("noviaiMode", mode);

    // Open the AI page
    window.location.href = "ai.html";
}


// =====================================
// GET CURRENT MODE
// =====================================

function getCurrentMode() {

    return localStorage.getItem("noviaiMode") || "Ask";
}


// =====================================
// START NOVIAI
// =====================================

function startNoviAI() {

    // Default to Ask mode
    localStorage.setItem("noviaiMode", "Ask");

    window.location.href = "ai.html";
}


// =====================================
// PAGE LOAD
// =====================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("NoviAI Home loaded");

});