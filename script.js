// Simulate WebSocket server for testing
// Replace this with your real server URL later
// const socket = new WebSocket("wss://tts-donation-server.onrender.com");

const overlay = document.getElementById("overlay");
const nameEl = document.getElementById("name");
const amountEl = document.getElementById("amount");
const messageEl = document.getElementById("message");
const gifEl = document.getElementById("gif");
const donationSound = new Audio("sounds/success.wav");

const params = new URLSearchParams(window.location.search);
const filterUserId = params.get("userid");
const minAmount = parseInt(params.get("min")) || 0;
const maxMessageLength = parseInt(params.get("max")) || Infinity;

let lastDonationId = null;

// Function to show donation
function showDonation(data) {
    if (!data.UserId || !data.Username || !data.Amount) return;
    if (filterUserId && data.UserId.toString() !== filterUserId) return;
    if (data.Amount < minAmount) return;
    if (data.Message.length > maxMessageLength) return;

    const donationId = `${data.UserId}-${data.Amount}-${data.Message}`;
    if (lastDonationId === donationId) return;
    lastDonationId = donationId;

    gifEl.src = "gifs/donation.gif";
    nameEl.textContent = data.Username;
    amountEl.textContent = `${data.Amount} Robux`;
    messageEl.textContent = data.Message;

    donationSound.currentTime = 0;
    donationSound.play();

    // TTS
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const tts = new SpeechSynthesisUtterance(
            `${data.Username} donated ${data.Amount} Robux via Developer Donate. ${data.Message}`
        );
        speechSynthesis.speak(tts);
    }

    overlay.classList.add("show");
    setTimeout(() => overlay.classList.remove("show"), 7000);
}

// --- TEST DONATION ---
// Remove after testing
setInterval(() => {
    showDonation({
        UserId: "1069987229",
        Username: "TestUser",
        Amount: 25,
        Message: "This is a test donation!"
    });
}, 10000);

// --- Real WebSocket ---
// Uncomment when using live server
/*
const socket = new WebSocket("wss://tts-donation-server.onrender.com");
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    showDonation(data);
};
*/
