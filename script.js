const socket = new WebSocket("wss://tts-donation-server.onrender.com");

const overlay = document.getElementById("overlay");
const gifEl = document.getElementById("gif");
const nameEl = document.getElementById("name");
const amountEl = document.getElementById("amount");
const messageEl = document.getElementById("message");

// SOUND SETUP
const donationSound = new Audio("sounds/success.wav");
donationSound.volume = 1.0;

// Show donation on screen
function showDonation(data) {
  console.log("Donation received:", data);

  // Validate
  if (!data.Username || !data.Amount) return;

  // GIF
  gifEl.src = "gifs/donation.gif";

  // TEXT
  nameEl.textContent = data.Username;
  amountEl.textContent = `${data.Amount} Robux`;
  messageEl.textContent = data.Message || "";

  // SOUND
  donationSound.currentTime = 0;
  donationSound.play().catch(err => console.warn("Sound error:", err));

  // TTS
  if ("speechSynthesis" in window) {
    const tts = new SpeechSynthesisUtterance(
      `${data.Username} donated ${data.Amount} Robux, via Developer Donate. ${data.Message || ""}`
    );
    window.speechSynthesis.cancel();
    speechSynthesis.speak(tts);
  }

  // Show overlay
  overlay.classList.add("show");

  // Hide after 7 seconds
  setTimeout(() => {
    overlay.classList.remove("show");
  }, 7000);
}

// WebSocket Listener
socket.onopen = () => console.log("WebSocket Connected.");

socket.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    showDonation(data);
  } catch (err) {
    console.error("WS parse error:", err);
  }
};

socket.onerror = (err) => console.error("WebSocket Error:", err);
