// URL query params
const urlParams = new URLSearchParams(window.location.search);
const targetUserId = Number(urlParams.get("userid")); // only show donations for this UserId
const minAmount = parseInt(urlParams.get("min")) || 0;
const maxMessageLength = parseInt(urlParams.get("max")) || 999;

const socket = new WebSocket("wss://tts-donation-server.onrender.com");

const overlay = document.getElementById("overlay");
const nameEl = document.getElementById("name");
const amountEl = document.getElementById("amount");
const messageEl = document.getElementById("message");
const gifEl = document.getElementById("gif");
const donationSound = new Audio("sounds/success.wav");

// Preload sound
donationSound.volume = 1;
donationSound.load();

// Queue system for multiple donations
let donationQueue = [];
let isSpeaking = false;

// Process queue
function processQueue() {
  if (isSpeaking || donationQueue.length === 0) return;
  isSpeaking = true;

  const data = donationQueue.shift();

  gifEl.src = "gifs/donation.gif";
  nameEl.textContent = data.Username;
  amountEl.textContent = `${data.Amount} Robux`;
  messageEl.textContent = data.Message; // overlay shows only message

  donationSound.currentTime = 0;
  donationSound.play().catch(e => console.warn("Sound failed:", e));

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
    // fallback if no TTS
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

// Listen for donations from Node.js WebSocket
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  showDonation(data);
};

// Optional: log connection status
socket.onopen = () => console.log("Connected to donation server");
socket.onclose = () => console.warn("Disconnected from donation server");
socket.onerror = (err) => console.error("WebSocket error:", err);
