// YOUR REAL SERVER URL
const socket = new WebSocket("wss://officialqua-tts-server-69.deno.dev/");

// load sound
const donationSound = new Audio("sounds/success.wav");
donationSound.volume = 1.0;

// elements
const overlay = document.getElementById("overlay");
const nameEl = document.getElementById("name");
const amountEl = document.getElementById("amount");
const messageEl = document.getElementById("message");
const gifEl = document.getElementById("gif");

socket.onopen = () => {
    console.log("Connected to server.");
};

// show overlay for 7 seconds
function showDonation(data) {
    nameEl.textContent = data.username;
    amountEl.textContent = `${data.amount} Robux`;
    messageEl.textContent = data.message;
    gifEl.src = data.gif;

    donationSound.currentTime = 0;
    donationSound.play();

    overlay.classList.add("show");

    setTimeout(() => {
        overlay.classList.remove("show");
    }, 7000);
}

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    showDonation(data);
};

// test mode — every 10 seconds
setInterval(() => {
    showDonation({
        username: "TestUser",
        amount: Math.floor(Math.random() * 100),
        message: "Automatic test message!",
        gif: "gifs/donation.gif"
    });
}, 10000);
