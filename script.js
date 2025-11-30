// Query parameters for filtering donations
const urlParams = new URLSearchParams(window.location.search);
const targetUserId = Number(urlParams.get("userid"));
const minAmount = parseInt(urlParams.get("min")) || 0;
const maxMessageLength = parseInt(urlParams.get("max")) || 999;

const socket = new WebSocket("wss://tts-donation-server.onrender.com");

const overlay = document.getElementById("overlay");
const gifEl = document.getElementById("gif");
const nameEl = document.getElementById("name");
const amountEl = document.getElementById("amount");
const messageEl = document.getElementById("message");
const donationSound = new Audio("sounds/success.wav");
donationSound.volume = 1;
donationSound.load();

// Donation queue system
let donationQueue = [];
let isProcessing = false;
const shownDonations = new Set();

// Process one donation at a time
function processQueue() {
  if (isProcessing || donationQueue.length === 0) return;
  isProcessing = true;

  const data = donationQueue.shift();

  // Reset and show GIF
  gifEl.src = ""; 
  gifEl.src = "gifs/donation.gif";
  gifEl.style.display = "block";

  // Set overlay text
  nameEl.textContent = data.Username;
  amountEl.textContent = `${data.Amount} Robux`;
  messageEl.textContent = data.Message;

  // Play donation sound
  donationSound.currentTime = 0;
  donationSound.play().catch(() => {});

  // Show overlay
  overlay.classList.add("show");

  // TTS
  if ('speechSynthesis' in window) {
    const msg = new SpeechSynthesisUtterance(
      `${data.Username} donated ${data.Amount} Robux via Developer Donate. ${data.Message}`
    );
    msg.onend = () => hideOverlay();
    speechSynthesis.speak(msg);
  } else {
    setTimeout(hideOverlay, 7000);
  }
}

// Hide overlay after donation
function hideOverlay() {
  overlay.classList.remove("show");
  gifEl.style.display = "none";
  isProcessing = false;
  processQueue();
}

// Queue donations, prevent duplicates
function showDonation(data) {
  if (!data.UserId || !data.Username || !data.Amount) return;
  if (targetUserId && data.UserId !== targetUserId) return;
  if (data.Amount < minAmount) return;
  if (data.Message.length > maxMessageLength) return;

  const key = `${data.UserId}-${data.Amount}-${data.Message}`;
  if (shownDonations.has(key)) return;
  shownDonations.add(key);

  donationQueue.push(data);
  processQueue();
}

// WebSocket listener
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  showDonation(data);
};

socket.onopen = () => console.log("Connected to donation server");
socket.onclose = () => console.warn("Disconnected from donation server");
socket.onerror = (err) => console.error("WebSocket error:", err);

// Optional: trigger TTS in OBS/Streamlabs manually once to allow autoplay
document.body.addEventListener('click', () => {
  const msg = new SpeechSynthesisUtterance("Overlay ready");
  speechSynthesis.speak(msg);
}, { once: true });
