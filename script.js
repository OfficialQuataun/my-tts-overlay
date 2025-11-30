// URL query params
const urlParams = new URLSearchParams(window.location.search);
const targetUserId = Number(urlParams.get("userid")); // filter by UserId
const minAmount = parseInt(urlParams.get("min")) || 0;
const maxMessageLength = parseInt(urlParams.get("max")) || 999;

const socket = new WebSocket("wss://tts-donation-server.onrender.com");

const overlay = document.getElementById("overlay");
const nameEl = document.getElementById("name");
const amountEl = document.getElementById("amount");
const messageEl = document.getElementById("message");
const gifEl = document.getElementById("gif");
const donationSound = new Audio("sounds/success.wav");

// preload sound
donationSound.volume = 1;
donationSound.load();

// donation queue
let donationQueue = [];
let isSpeaking = false;

// process queued donations
function processQueue() {
  if (isSpeaking || donationQueue.length === 0) return;
  isSpeaking = true;

  const data = donationQueue.shift();

  gifEl.src = "gifs/donation.gif";
  nameEl.textContent = data.Username;
  amountEl.textContent = `${data.Amount} Robux`;
  messageEl.textContent = data.Message; // only message on screen

  donationSound.currentTime = 0;
  donationSound.play().catch(e => console.warn("Sound failed:", e));

  // TTS reads "via Developer Donate"
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
    overlay.classList.add("show");
    setTimeout(() => {
      overlay.classList.remove("show");
      isSpeaking = false;
      processQueue();
    }, 7000);
  }
}

// filter and queue donations
function showDonation(data) {
  if (!data.UserId || !data.Username || !data.Amount) return;
  if (targetUserId && data.UserId !== targetUserId) return;
  if (data.Amount < minAmount) return;
  if (data.Message.length > maxMessageLength) return;

  donationQueue.push(data);
  processQueue();
}

// WebSocket connection
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  showDonation(data);
};

socket.onopen = () => console.log("Connected to donation server");
socket.onclose = () => console.warn("Disconnected from donation server");
socket.onerror = (err) => console.error("WebSocket error:", err);
