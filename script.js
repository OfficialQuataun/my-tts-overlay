// URL query params
const urlParams = new URLSearchParams(window.location.search);
const targetUserId = Number(urlParams.get("userid")); // show only this user
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

// queue system
let donationQueue = [];
let isSpeaking = false;

// track shown donations to prevent duplicates
const shownDonations = new Set();

function processQueue() {
  if (isSpeaking || donationQueue.length === 0) return;
  isSpeaking = true;

  const data = donationQueue.shift();

  // show GIF
  gifEl.style.display = "block";
  gifEl.src = ""; // reset GIF
  gifEl.src = "gifs/donation.gif"; // restart GIF

  // overlay text
  nameEl.textContent = data.Username;
  amountEl.textContent = `${data.Amount} Robux`;
  messageEl.textContent = data.Message; // only message, no "via Developer Donate"

  // play sound
  donationSound.currentTime = 0;
  donationSound.play().catch(e => console.warn("Sound failed:", e));

  // TTS reads with "via Developer Donate"
  if ('speechSynthesis' in window) {
    const msg = new SpeechSynthesisUtterance(
      `${data.Username} donated ${data.Amount} Robux via Developer Donate. ${data.Message}`
    );
    msg.onend = () => {
      overlay.classList.remove("show");
      gifEl.style.display = "none";
      isSpeaking = false;
      processQueue();
    };
    overlay.classList.add("show");
    speechSynthesis.speak(msg);
  } else {
    overlay.classList.add("show");
    setTimeout(() => {
      overlay.classList.remove("show");
      gifEl.style.display = "none";
      isSpeaking = false;
      processQueue();
    }, 7000);
  }
}

function showDonation(data) {
  if (!data.UserId || !data.Username || !data.Amount) return;
  if (targetUserId && data.UserId !== targetUserId) return;
  if (data.Amount < minAmount) return;
  if (data.Message.length > maxMessageLength) return;

  // prevent duplicates
  const donationKey = `${data.UserId}-${data.Amount}-${data.Message}`;
  if (shownDonations.has(donationKey)) return;
  shownDonations.add(donationKey);

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
