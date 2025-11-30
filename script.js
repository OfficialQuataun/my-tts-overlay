// Get query parameters from URL
const urlParams = new URLSearchParams(window.location.search);
const targetUserId = urlParams.get("userid"); // only show donations for this user
const minAmount = parseInt(urlParams.get("min")) || 0;
const maxMessageLength = parseInt(urlParams.get("max")) || 999;

const socket = new WebSocket("wss://tts-donation-server.onrender.com");

const overlay = document.getElementById("overlay");
const nameEl = document.getElementById("name");
const amountEl = document.getElementById("amount");
const messageEl = document.getElementById("message");
const gifEl = document.getElementById("gif");
const donationSound = new Audio("sounds/success.wav");

// Show donation overlay
function showDonation(data) {
  // Ignore incomplete donations
  if (!data.UserId || !data.Username || !data.Amount) return;

  // Only show donation if it matches the target UserId
  if (targetUserId && data.UserId != parseInt(targetUserId)) return;
  if (data.Amount < minAmount) return;
  if (data.Message.length > maxMessageLength) return;

  gifEl.src = "gifs/donation.gif";
  nameEl.textContent = data.Username;
  amountEl.textContent = `${data.Amount} Robux`;
  messageEl.textContent = `${data.Message} (via Developer Donate)`;

  donationSound.currentTime = 0;
  donationSound.play();

  // TTS
  if ('speechSynthesis' in window) {
    const msg = new SpeechSynthesisUtterance(
      `${data.Username} donated ${data.Amount} Robux via Developer Donate. ${data.Message}`
    );
    speechSynthesis.speak(msg);
  }

  overlay.classList.add("show");
  setTimeout(() => overlay.classList.remove("show"), 7000);
}

// Listen for donations
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  showDonation(data);
};
