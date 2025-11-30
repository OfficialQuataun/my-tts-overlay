const socket = new WebSocket("wss://tts-donation-server.onrender.com");

const overlay = document.getElementById("overlay");
const nameEl = document.getElementById("name");
const amountEl = document.getElementById("amount");
const messageEl = document.getElementById("message");
const gifEl = document.getElementById("gif");
const donationSound = new Audio("https://YOUR_DOMAIN/sounds/success.wav"); // hosted URL

let lastDonationId = null;

function showDonation(data) {
    if (!data.UserId || !data.Username || !data.Amount) return;
    if (lastDonationId === data.UserId + data.Amount + data.Message) return;
    lastDonationId = data.UserId + data.Amount + data.Message;

    gifEl.src = "https://YOUR_DOMAIN/gifs/donation.gif"; // hosted URL
    nameEl.textContent = data.Username;
    amountEl.textContent = `${data.Amount} Robux`;
    messageEl.textContent = data.Message;

    // Play sound
    donationSound.currentTime = 0;
    donationSound.play();

    overlay.classList.add("show");

    // Hide overlay after 7 seconds
    setTimeout(() => overlay.classList.remove("show"), 7000);
}

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    showDonation(data);
};
