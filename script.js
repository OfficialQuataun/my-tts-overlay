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

  gifEl.src = "gifs/donation.gif";
  nameEl.textContent = data.Username;
  amountEl.textContent = `${data.Amount} Robux`;
  // ALWAYS append "via Developer Donate"
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
