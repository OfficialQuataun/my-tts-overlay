// Overlay WebSocket
const socket = new WebSocket("wss://tts-donation-server.onrender.com");

// Get URL query parameters
const params = new URLSearchParams(window.location.search);
const filterUserId = params.get("userid");          // filter by user
const minAmount = parseInt(params.get("min")) || 0; // min donation
const maxMessageLength = parseInt(params.get("max")) || 500; // max message length

const overlay = document.getElementById("overlay");
const nameEl = document.getElementById("name");
const amountEl = document.getElementById("amount");
const messageEl = document.getElementById("message");
const gifEl = document.getElementById("gif");
const donationSound = new Audio("sounds/success.wav");

// TTS function
function speak(text) {
  if ('speechSynthesis' in window) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 1;
    msg.pitch = 1;
    msg.volume = 1;
    speechSynthesis.speak(msg);
  }
}

// Show overlay
function showDonation(data) {
  gifEl.src = "gifs/donation.gif";
  nameEl.textContent = data.username;
  amountEl.textContent = `${data.amount} Robux`;
  messageEl.textContent = data.message;

  donationSound.currentTime = 0;
  donationSound.play();

  speak(`${data.username} donated ${data.amount} Robux via Developer Donate. ${data.message}`);

  overlay.classList.add("show");
  setTimeout(() => overlay.classList.remove("show"), 7000);
}

// Listen for donations
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  // Apply filters
  if (filterUserId && data.userid.toString() !== filterUserId) return;
  if (data.amount < minAmount) return;
  if (data.message.length > maxMessageLength) return;

  showDonation(data);
};
