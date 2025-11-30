// WebSocket server URL
const socket = new WebSocket("wss://officialqua-tts-server-69.deno.dev/");

// Sound effect
const donationSound = new Audio("sounds/success.wav");

// Overlay elements
const overlay = document.getElementById("overlay");
const nameEl = document.getElementById("name");
const amountEl = document.getElementById("amount");
const messageEl = document.getElementById("message");
const gifEl = document.getElementById("gif");

// TTS function
function speak(text) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 1;
    msg.pitch = 1;
    msg.volume = 1;
    speechSynthesis.speak(msg);
}

// Show donation overlay
function showDonation(data) {
    gifEl.src = "gifs/donation.gif";

    nameEl.textContent = data.username;
    amountEl.textContent = `${data.amount} Robux`;
    messageEl.textContent = data.message;

    // Play sound
    donationSound.currentTime = 0;
    donationSound.play();

    // Speak TTS
    const ttsLine = `${data.username} donated ${data.amount} Robux via Developer Donate. ${data.message}`;
    speak(ttsLine);

    // Display overlay
    overlay.classList.add("show");

    setTimeout(() => {
        overlay.classList.remove("show");
    }, 7000);
}

// Handle real donations from WebSocket
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    showDonation(data);
};

// Optional test donation every 10 seconds
setInterval(() => {
    showDonation({
        username: "Tester",
        amount: Math.floor(Math.random() * 100),
        message: "This is a test!",
        gif: "gifs/donation.gif"
    });
}, 10000);
