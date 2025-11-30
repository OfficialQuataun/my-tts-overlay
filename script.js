// Connect to your WebSocket server
const socket = new WebSocket("wss://tts-donation-server.onrender.com");

const overlay = document.getElementById("overlay");
const nameEl = document.getElementById("name");
const amountEl = document.getElementById("amount");
const messageEl = document.getElementById("message");
const gifEl = document.getElementById("gif");
const donationSound = new Audio("sounds/success.wav");

function showDonation(data) {
    if (!data.UserId || !data.Username || !data.Amount) return;

    gifEl.src = "gifs/donation.gif";
    nameEl.textContent = data.Username;
    amountEl.textContent = `${data.Amount} Robux`;
    messageEl.textContent = data.Message;

    // Play sound
    donationSound.currentTime = 0;
    donationSound.play();

    // Browser TTS
    if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance(
            `${data.Username} donated ${data.Amount} Robux. ${data.Message}`
        );
        speechSynthesis.speak(msg);
    }

    overlay.classList.add("show");

    // Hide overlay after 7 seconds
    setTimeout(() => overlay.classList.remove("show"), 7000);
}

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    showDonation(data);
};
