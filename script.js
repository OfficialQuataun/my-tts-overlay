document.addEventListener("DOMContentLoaded", () => {
  // URL params
  const urlParams = new URLSearchParams(window.location.search);
  const targetUserId = Number(urlParams.get("userid"));
  const minAmount = parseInt(urlParams.get("min")) || 0;
  const maxMessageLength = parseInt(urlParams.get("max")) || 999;

  const overlay = document.getElementById("overlay");
  const nameEl = document.getElementById("name");
  const amountEl = document.getElementById("amount");
  const messageEl = document.getElementById("message");
  const gifEl = document.getElementById("gif");
  const donationSound = new Audio("sounds/success.wav");

  // Queue to prevent overlapping alerts
  let donationQueue = [];
  let isSpeaking = false;

  // Clean message for TTS
  function cleanMessage(str) {
    return str.replace(/[^\x00-\x7F]/g, "");
  }

  // Show overlay
  async function processQueue() {
    if (isSpeaking || donationQueue.length === 0) return;
    isSpeaking = true;

    const data = donationQueue.shift();

    // Update overlay
    gifEl.src = "gifs/donation.gif";
    nameEl.textContent = data.Username;
    amountEl.textContent = `${data.Amount} Robux`;
    messageEl.textContent = data.Message + " (via Developer Donate)";
    overlay.classList.add("show");

    // Play sound
    donationSound.currentTime = 0;
    try { await donationSound.play(); } catch(e){}

    // TTS
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel(); // reset
      const msg = new SpeechSynthesisUtterance(
        `${data.Username} donated ${data.Amount} Robux. ${cleanMessage(data.Message)}`
      );
      msg.rate = 1;
      msg.pitch = 1;
      msg.onerror = () => {
        overlay.classList.remove("show");
        isSpeaking = false;
        processQueue();
      };
      msg.onend = () => {
        overlay.classList.remove("show");
        isSpeaking = false;
        processQueue();
      };
      setTimeout(() => speechSynthesis.speak(msg), 150); // small delay for Streamlabs
    } else {
      // fallback if TTS unavailable
      setTimeout(() => {
        overlay.classList.remove("show");
        isSpeaking = false;
        processQueue();
      }, 5000);
    }
  }

  // Validate and queue donation
  function showDonation(data) {
    if (!data.UserId || !data.Username || !data.Amount) return;
    if (targetUserId && data.UserId !== targetUserId) return;
    if (data.Amount < minAmount) return;
    if (data.Message.length > maxMessageLength) return;

    donationQueue.push(data);
    processQueue();
  }

  // WebSocket
  const socket = new WebSocket("wss://tts-donation-server.onrender.com");
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      showDonation(data);
    } catch (e) {
      console.error("Invalid donation data:", e);
    }
  };

  // TEST overlay manually (uncomment for debugging)
  // donationQueue.push({ Username: "TestUser", Amount: 123, Message: "Hello World" });
  // processQueue();
});
