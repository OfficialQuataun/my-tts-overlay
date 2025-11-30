const socket = new WebSocket("wss://tts-donation-server.onrender.com");

const overlay = document.getElementById("overlay");
const nameEl = document.getElementById("name");
const amountEl = document.getElementById("amount");
const messageEl = document.getElementById("message");
const gifEl = document.getElementById("gif");
const donationSound = new Audio("https://officialquataun.github.io/my-tts-overlay/sounds/success.wav");

// Prevent duplicate donations from showing repeatedly
let lastDonationId = null;

// Parse URL params
const params = new URLSearchParams(window.location.search);
const filterUserId = params.get("userid");
const minAmount = parseInt(params.get("min")) || 0;
const maxMessageLength = parseInt(params.get("max")) || Infinity;

function showDonation(data) {
    if (!data.UserId || !data.Username || !data.Amount) return;

    // Filter by user ID
    if (filterUserId && data.UserId.toString() !== filterUserId) return;

    // Filter by minimum donation amount
    if (data.Amount < minAmount) return;

    // Filter by maximum message length
    if (data.Message.length > maxMessageLength) return;

    // Prevent repeated display of same donation
    const donationId = `${data.UserId}-${data.Amount}-${data.Message}`;
    if (lastDonationId === donationId) return;
    lastDonationId = donationId;

    // Update overlay elements
    gifEl.src = "https://officialquataun.github.io/my-tts-overlay/gifs/donation.gif";
    nameEl.textContent = data.Username;
    amountEl.textContent = `${data.Amount} Robux`;
    messageEl.textContent = data.Message; // only message, no extra text

    // Play sound
    donationSound.currentTime = 0;
    donationSound.play();

    // Text-to-Speech
    if ('speechSynthesis' in window) {
        const ttsMessage = `${data.Username} donated ${data.Amount} Robux via Developer Donate. ${data.Message}`;
        const utterance = new SpeechSynthesisUtterance(ttsMessage);
        speechSynthesis.speak(utterance);
    }

    // Show overlay
    overlay.classList.add("show");
    setTimeout(() => overlay.classList.remove("show"), 7000);
}

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    showDonation(data);
};
