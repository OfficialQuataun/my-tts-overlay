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

    if ('speechSynthesis' in window) {
        const ttsMessage = `${data.Username} donated ${data.Amount} Robux via Developer Donate. ${data.Message}`;
        const utterance = new SpeechSynthesisUtterance(ttsMessage);
        speechSynthesis.speak(utterance);
    }

    overlay.classList.add("show");
    setTimeout(() => overlay.classList.remove("show"), 7000);
}

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    showDonation(data);
};
