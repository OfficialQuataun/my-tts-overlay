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
    donationSound.play().catch(()=>{});

    window.speechSynthesis.cancel();
    const tts = new SpeechSynthesisUtterance(
        `${data.Username} donated ${data.Amount} Robux via Developer Donate. ${data.Message}`
    );

    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
        tts.voice = voices[0];
    }

    setTimeout(() => {
        speechSynthesis.speak(tts);
    }, 300);

    overlay.classList.add("show");
    setTimeout(() => overlay.classList.remove("show"), 7000);
}

socket.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        showDonation(data);
    } catch (e) {
        console.error("Invalid WebSocket Data:", e);
    }
};
