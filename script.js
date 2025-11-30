// --- REAL WEBSOCKET CONNECTION ---
const socket = new WebSocket("wss://tts-donation-server.onrender.com");

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

// ------------------------------
// SHOW DONATION
// ------------------------------
function showDonation(data) {
    // INVALID DONO
    if (!data.UserId || !data.Username || !data.Amount) return;

    // FILTER BY USERID
    if (filterUserId && data.UserId.toString() !== filterUserId) return;

    // MIN DONATION
    if (data.Amount < minAmount) return;

    // MESSAGE LENGTH FILTER
    if (data.Message.length > maxMessageLength) return;

    // PREVENT REPEAT SPAM
    const donationId = `${data.UserId}-${data.Amount}-${data.Message}`;
    if (lastDonationId === donationId) return;
    lastDonationId = donationId;

    // UPDATE UI
    gifEl.src = "gifs/donation.gif";
    nameEl.textContent = data.Username;
    amountEl.textContent = `${data.Amount} Robux`;
    messageEl.textContent = data.Message;

    // SOUND EFFECT
    donationSound.currentTime = 0;
    donationSound.play().catch(() => {});

    // ------------------------------
    // FIXED TTS FOR OBS/STREAMLABS
    // ------------------------------
    window.speechSynthesis.cancel(); // stop stuck TTS

    const tts = new SpeechSynthesisUtterance(
        `${data.Username} donated ${data.Amount} Robux via Developer Donate. ${data.Message}`
    );

    // Force voice selection for OBS
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
        tts.voice = voices.find(v => v.name.includes("Microsoft") || v.name.includes("Google")) || voices[0];
    }

    setTimeout(() => {
        speechSynthesis.speak(tts);
    }, 300); // delay fixes OBS blocking

    // SHOW OVERLAY
    overlay.classList.add("show");
    setTimeout(() => overlay.classList.remove("show"), 7000);
}

// ------------------------------
// WEBSOCKET LISTENER
// ------------------------------
socket.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        showDonation(data);
    } catch (e) {
        console.error("Invalid WebSocket Data:", e);
    }
};
