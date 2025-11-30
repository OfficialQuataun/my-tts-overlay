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

// Queue control
let donationQueue = [];
let isSpeaking = false;

// Clean messages for TTS (Streamlabs sometimes breaks on emojis or control chars)
function cleanMessage(str) {
  return str.replace(/[^\x00-\x7F]/g, "");
}

async function processQueue() {
  if (isSpeaking || donationQueue.length === 0) return;
  isSpeaking = true;

  const data = donationQueue.shift();

  gifEl.src = "gifs/donation.gif";
  nameEl.textContent = data.Username;
  amountEl.textContent = `${data.Amount} Robux`;
  messageEl.textContent = `${data.Message} (via Developer Donate)`;

  // Audio fix for Streamlabs — must be promise handled
  donationSound.currentTime = 0;
  try {
    await donationSound.play();
  } catch (err) {
    console.warn("Audio autoplay blocked, but continuing anyway.");
  }

  overlay.classList.add("show");

  // --- STREAMLABS TTS FIX BELOW ---
  if ("speechSynthesis" in window) {
    // Reset TTS — important for Streamlabs
    speechSynthesis.cancel();

    const msg = new SpeechSynthesisUtterance(
      `${data.Username} donated ${data.Amount} Robux. ${cleanMessage(data.Message)}`
    );

    msg.rate = 1;
    msg.pitch = 1;

    msg.onerror = () => {
      console.error("TTS error");
      overlay.classList.remove("show");
      isSpeaking = false;
      processQueue();
    };

    msg.onend = () => {
      overlay.classList.remove("show");
      isSpeaking = false;
      processQueue();
    };

    // Small delay required in Streamlabs to avoid muted utterances
    setTimeout(() => {
      speechSynthesis.speak(msg);
    }, 150);
  } else {
    // Fallback no-TTS mode
    setTimeout(() => {
      overlay.classList.remove("show");
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

  donationQueue.push(data);
  processQueue();
}

// WebSocket listener
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  showDonation(data);
};
