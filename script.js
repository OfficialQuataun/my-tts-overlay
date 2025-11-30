// CHANGE THIS TO YOUR SERVER URL!!
const socket = new WebSocket("wss://officialqua-tts-server-69.deno.dev/");

const donationSound = new Audio("/sounds/success.wav");

// overlay elements
const overlay = document.getElementById("overlay");
const nameEl = document.getElementById("name");
const amountEl = document.getElementById("amount");
const messageEl = document.getElementById("message");
const gifEl = document.getElementById("gif");

socket.onopen = () => {
    console.log("Connected to TTS server.");
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // update overlay
    nameEl.textContent = data.username;
    amountEl.textContent = `${data.amount} Robux`;
    messageEl.textContent = data.message;
    gifEl.src = data.gif;

    // play sound
    donationSound.currentTime = 0;
    donationSound.play();

    // show overlay
    overlay.classList.add("show");

    // hide after 7 seconds
    setTimeout(() => {
        overlay.classList.remove("show");
    }, 7000);
};
