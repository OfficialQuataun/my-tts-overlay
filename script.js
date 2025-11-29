const socket = new WebSocket("wss://officialqua-tts-server-69.deno.dev/");

socket.onopen = () => {
  console.log("Connected to TTS server!");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Donation received:", data);

  showPopup(data);
  speakTTS(data);
};

function speakTTS(data) {
  const text = `${data.username} donated ${data.amount} Robux. ${data.message}`;
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1.0;
  utter.pitch = 1.0;
  speechSynthesis.speak(utter);
}

function showPopup(data) {
  const popup = document.getElementById("popup");
  const gif = document.getElementById("gif");
  const textDiv = document.getElementById("text");

  gif.src = data.gif;
  textDiv.textContent = `${data.username}: ${data.message}`;

  popup.style.display = "flex";

  // Hide after 7 seconds
  setTimeout(() => {
    popup.style.display = "none";
  }, 7000);
}
