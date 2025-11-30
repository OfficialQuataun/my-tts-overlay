// URL query params
const urlParams = new URLSearchParams(window.location.search);
const targetUserId = Number(urlParams.get("userid"));
const minAmount = parseInt(urlParams.get("min")) || 0;
const maxMessageLength = parseInt(urlParams.get("max")) || 999;

const socket = new WebSocket("wss://tts-donation-server.onrender.com");

const overlay = document.getElementById("overlay");
const nameEl = document.getElementById("name");
const amountEl = document.getElementById("amount");
const messageEl = document.getElementById("message");
const gifEl = document.getElementById("gif");
const donationSound = new Audio("sounds/success.wav");

// Queue to prevent overlapping TTS
let donationQueue = [];
let isSpeaking = false;

function processQueue() {
  if (isSpeaking || donationQueue.length === 0) return;
  isSpeaking = true;

  const data = donationQueue.shift();

  gifEl.src = "gifs/donation.gif";
  nameEl.textContent = data.Username;
  amountEl.textContent = `${data.Amount} Robux`;
  messageEl.textContent = `${data.Message} (via Developer Donate)`;

  donationSound.currentTime = 0;
  donationSound.play();

  if ('speechSynthesis' in window) {
    const msg = new SpeechSynthesisUtterance(
      `${data.Username} donated ${data.Amount} Robux via Developer Donate. ${data.Message}`
    );
    msg.onend = () => {
      overlay.classList.remove("show");
      isSpeaking = false;
      processQueue();
    };
    overlay.classList.add("show");
    speechSynthesis.speak(msg);
  } else {
    // fallback: just show overlay
    overlay.classList.add("show");
    setTimeout(() => {
      overlay.classList.remove("show");
      isSpeaking = false;
      processQueue();
    }, 7000);
  }
}

// Show donation if it matches filters
function showDonation(data) {
  if (!data.UserId || !data.Username || !data.Amount) return;
  if (targetUserId && data.UserId !== targetUserId) return;
  if (data.Amount < minAmount) return;
  if (data.Message.length > maxMessageLength) return;

  donationQueue.push(data);
  processQueue();
}

// Listen for donations
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  showDonation(data);
};
