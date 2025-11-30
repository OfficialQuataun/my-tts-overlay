const socket = new WebSocket("wss://tts-donation-server.onrender.com");

const overlay = document.getElementById("overlay");
const nameEl = document.getElementById("name");
const amountEl = document.getElementById("amount");
const messageEl = document.getElementById("message");
const gifEl = document.getElementById("gif");
const donationSound = new Audio("sounds/success.wav");

let lastDonationId = null;

const params = new URLSearchParams(window.location.search);
const filterUserId = params.get("userid");
const minAmount = parseInt(params.get("min")) || 0;
const maxMessageLength = parseInt(params.get("max")) || Infinity;

// Function to trigger TTS
function speak(text) {
    if (!('speechSynthesis' in window)) return;

    // Cancel previous TTS if any
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
}

function showDonation(data) {
    if (!data.UserId || !data.Username || !data.Amount) return;
    if (filterUserId && data.UserId.toString() !== filterUserId) return;
    if (data.Amount < minAmount) return;
    if (data.Message.length > maxMessageLength) return;

    const donationId = `${data.UserId}-${data.Amount}-${data.Message}`;
    if (lastDonationId === donationId) return; // prevent repeats
    lastDonationId = donationId;

    gifEl.src = "gifs/donation.gif";
    nameEl.textContent = data.Username;
    amountEl.textContent = `${data.Amount} Robux`;
    messageEl.textContent = data.Message;

    donationSound.currentTime = 0;
    donationSound.play();

    // TTS
    const ttsText = `${data.Username} donated ${data.Amount} Robux via Developer Donate. ${data.Message}`;
    speak(ttsText);

    overlay.classList.add("show");
    setTimeout(() => overlay.classList.remove("show"), 7000);
}

// Listen for donation events
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    showDonation(data);
};
