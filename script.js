// Connect to your server WebSocket
const socket = new WebSocket("wss://tts-donation-server.onrender.com");

// All overlay elements
const overlay = document.getElementById("overlay");
const gifEl = document.getElementById("gif");
const nameEl = document.getElementById("name");
const amountEl = document.getElementById("amount");
const messageEl = document.getElementById("message");

// Donation sound
const donateSound = new Audio("donation.wav");

// Hidden TTS frame
const frame = document.getElementById("tts-frame");

// Create speechSynthesis-enabled environment
frame.srcdoc = `
<html>
<body>
<script>
window.say = function(text) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 1;
    msg.pitch = 1;
    speechSynthesis.speak(msg);
}
</script>
</body>
</html>
`;

function speak(text) {
    frame.contentWindow.say(text);
}

// Show overlay + play TTS
function showDonation(data) {
    nameEl.textContent = data.Username;
    amountEl.textContent = data.Amount + " Robux";
    messageEl.textContent = data.Message || "";
    gifEl.src = "donation.gif";

    donateSound.currentTime = 0;
    donateSound.play();

    // TTS
    const ttsText =
        `${data.Username} donated ${data.Amount} Robux. ${data.Message || ""}`;

    speak(ttsText);

    // Show animation
    overlay.classList.add("show");
    setTimeout(() => overlay.classList.remove("show"), 6000);
}

// Listen for donations
socket.onmessage = event => {
    const data = JSON.parse(event.data);
    showDonation(data);
};
