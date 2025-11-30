const socket = new WebSocket("wss://tts-donation-server.onrender.com");

const overlay = document.getElementById("overlay");
const nameEl = document.getElementById("name");
const amountEl = document.getElementById("amount");
const messageEl = document.getElementById("message");
const gifEl = document.getElementById("gif");
const ttsAudio = new Audio();
const donationSound = new Audio("sounds/success.wav");

function showDonation(data) {
  if (!data.UserId || !data.Username || !data.Amount) return;

  gifEl.src = "gifs/donation.gif";
  nameEl.textContent = data.Username;
  amountEl.textContent = `${data.Amount} Robux`;
  messageEl.textContent = data.Message;

  // Play donation sound
  donationSound.currentTime = 0;
  donationSound.play();

  // Play TTS MP3
  if (data.TTS) {
    ttsAudio.src = data.TTS;
    ttsAudio.play().catch(err => console.log("TTS blocked", err));
  }

  overlay.classList.add("show");

  setTimeout(() => {
    overlay.classList.remove("show");
  }, 7000);
}

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  showDonation(data);
};
