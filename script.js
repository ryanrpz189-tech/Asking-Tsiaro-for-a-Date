/* ═══════════════════════════════════════════════════════════════
   CONFIG — edit everything here to personalise the experience
═══════════════════════════════════════════════════════════════ */
const CONFIG = {

  /* Your name shown in the chat header (matches index.html) */
  yourName: "Your Name",

  /* The fake chat messages.
     type: "them" = her bubble  |  type: "me" = your bubble
     Adjust the delay (ms) to control when each message appears. */
  chatMessages: [
    { type: "them", text: "Hey! 👀",                  delay: 600  },
    { type: "me",   text: "Heyy 🌸",                  delay: 1400 },
    { type: "them", text: "What's up?",                delay: 2400 },
    { type: "me",   text: "I have a question for you :)", delay: 3400 },
    { type: "them", text: "Oh? Tell me! 🥺",           delay: 4600 },
  ],

  /* How long (ms) after the last message before the card slides in */
  cardDelay: 1600,

  /* Emojis used for the floating background hearts */
  floatingEmojis: ["🌸", "💕", "✨", "🌷", "💗", "🫶", "🌙"],

  /* Number of floating hearts on screen at once */
  heartsCount: 18,

  /* NO button: messages that flash at the top when she tries to click it */
  noMessages: [
    "That's not an option 😇",
    "Wrong button bestie 💅",
    "Try again 🙃",
    "Nope! 🚫",
    "Are you sure? 🥺",
    "…really? 😭",
    "Come on… 🌷",
  ],

  /* Emojis that burst out when she clicks YES */
  burstEmojis: ["💖", "✨", "🌸", "💕", "🎉"],
};

/* ═══════════════════════════════════════════════════════════════
   SCREEN MANAGER
═══════════════════════════════════════════════════════════════ */
const screens = {
  chat:   document.getElementById("screen-chat"),
  card:   document.getElementById("screen-card"),
  yes:    document.getElementById("screen-yes"),
  picker: document.getElementById("screen-picker"),
  final:  document.getElementById("screen-final"),
};

let currentScreen = "chat";

function goTo(name) {
  const from = screens[currentScreen];
  const to   = screens[name];

  from.classList.add("exit");
  setTimeout(() => {
    from.classList.remove("active", "exit");
    to.classList.add("active");
    currentScreen = name;
  }, 500);
}

/* ═══════════════════════════════════════════════════════════════
   FLOATING HEARTS
═══════════════════════════════════════════════════════════════ */
const heartsContainer = document.getElementById("hearts-container");

function spawnHeart() {
  const el = document.createElement("span");
  el.className = "heart-particle";
  el.textContent = CONFIG.floatingEmojis[Math.floor(Math.random() * CONFIG.floatingEmojis.length)];
  el.style.left     = Math.random() * 100 + "vw";
  el.style.fontSize = (0.8 + Math.random() * 1.2) + "rem";
  const dur = 7 + Math.random() * 8;
  el.style.animationDuration = dur + "s";
  el.style.animationDelay   = -(Math.random() * dur) + "s";
  heartsContainer.appendChild(el);

  // remove after one cycle to keep DOM clean
  setTimeout(() => el.remove(), (dur + 1) * 1000);
}

function initHearts() {
  for (let i = 0; i < CONFIG.heartsCount; i++) spawnHeart();
  setInterval(spawnHeart, 3000);
}

/* ═══════════════════════════════════════════════════════════════
   CHAT TYPEWRITER
═══════════════════════════════════════════════════════════════ */
const chatBody = document.getElementById("chat-body");

function appendBubble(type, text) {
  const row = document.createElement("div");
  row.className = `bubble-row ${type}`;

  const avatarEl = document.createElement("div");
  avatarEl.className = "bubble-avatar";
  avatarEl.textContent = type === "me" ? "😊" : "🥰"; // ← change avatars here

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  if (type === "me") {
    row.append(bubble, avatarEl);
  } else {
    row.append(avatarEl, bubble);
  }

  chatBody.appendChild(row);
  // Trigger animation on next frame
  requestAnimationFrame(() => requestAnimationFrame(() => row.classList.add("visible")));
  chatBody.scrollTop = chatBody.scrollHeight;
}

function showTypingIndicator() {
  const row = document.createElement("div");
  row.className = "bubble-row them";
  row.id = "typing-row";

  const avatarEl = document.createElement("div");
  avatarEl.className = "bubble-avatar";
  avatarEl.textContent = "🥰";

  const dots = document.createElement("div");
  dots.className = "bubble typing-dots";
  dots.innerHTML = "<span></span><span></span><span></span>";

  row.append(avatarEl, dots);
  chatBody.appendChild(row);
  requestAnimationFrame(() => requestAnimationFrame(() => row.classList.add("visible")));
  chatBody.scrollTop = chatBody.scrollHeight;
}

function removeTypingIndicator() {
  document.getElementById("typing-row")?.remove();
}

async function runChat() {
  for (const msg of CONFIG.chatMessages) {
    await wait(msg.delay - (CONFIG.chatMessages.indexOf(msg) > 0
      ? CONFIG.chatMessages[CONFIG.chatMessages.indexOf(msg) - 1].delay : 0));

    if (msg.type === "them") {
      showTypingIndicator();
      await wait(700);
      removeTypingIndicator();
    }
    appendBubble(msg.type, msg.text);
  }

  await wait(CONFIG.cardDelay);
  goTo("card");
}

/* ═══════════════════════════════════════════════════════════════
   NO BUTTON BEHAVIOUR
═══════════════════════════════════════════════════════════════ */
const btnNo = document.getElementById("btn-no");
let noIdx = 0;
let noFlash = null;

btnNo.addEventListener("mouseenter", runAway);
btnNo.addEventListener("touchstart", runAway, { passive: true });

function runAway() {
  const msg = CONFIG.noMessages[noIdx % CONFIG.noMessages.length];
  noIdx++;

  // Flash message at top
  if (noFlash) noFlash.remove();
  noFlash = document.createElement("div");
  noFlash.textContent = msg;
  Object.assign(noFlash.style, {
    position: "fixed", top: "18px", left: "50%",
    transform: "translateX(-50%)",
    background: "white", color: "var(--rose-deep)",
    padding: "10px 22px", borderRadius: "50px",
    boxShadow: "0 4px 20px rgba(0,0,0,.12)",
    fontWeight: "500", fontSize: "0.9rem",
    zIndex: "999", transition: "opacity 0.4s",
    whiteSpace: "nowrap",
  });
  document.body.appendChild(noFlash);
  setTimeout(() => { noFlash.style.opacity = "0"; }, 1800);

  // Move the button to a random position
  const vw = window.innerWidth  - btnNo.offsetWidth  - 20;
  const vh = window.innerHeight - btnNo.offsetHeight - 20;
  const x  = Math.max(10, Math.floor(Math.random() * vw));
  const y  = Math.max(10, Math.floor(Math.random() * vh));

  btnNo.classList.add("escaped");
  btnNo.style.position = "fixed";
  btnNo.style.left = x + "px";
  btnNo.style.top  = y + "px";
}

/* ═══════════════════════════════════════════════════════════════
   YES BUTTON
═══════════════════════════════════════════════════════════════ */
document.getElementById("btn-yes").addEventListener("click", function(e) {
  burstHearts(e.clientX, e.clientY);
  goTo("yes");
});

document.getElementById("btn-next").addEventListener("click", () => goTo("picker"));

/* ═══════════════════════════════════════════════════════════════
   DATE PICKER — CONFIRM
═══════════════════════════════════════════════════════════════ */
document.getElementById("btn-confirm").addEventListener("click", () => {
  const dateVal = document.getElementById("pick-date").value;
  const timeVal = document.getElementById("pick-time").value;
  const noteVal = document.getElementById("pick-note").value.trim();

  if (!dateVal || !timeVal) {
    alert("Please pick a date and a time 🥺");
    return;
  }

  const dateStr = new Date(dateVal).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
  const timeStr = formatTime(timeVal);

  let summary = `📅 ${dateStr}\n🕐 ${timeStr}`;
  if (noteVal) summary += `\n🌙 "${noteVal}"`;

  document.getElementById("final-summary").textContent = summary;
  goTo("final");
});

/* ═══════════════════════════════════════════════════════════════
   HEART BURST EFFECT
═══════════════════════════════════════════════════════════════ */
function burstHearts(x, y) {
  for (let i = 0; i < 10; i++) {
    const el = document.createElement("span");
    el.className = "burst-heart";
    el.textContent = CONFIG.burstEmojis[Math.floor(Math.random() * CONFIG.burstEmojis.length)];
    const angle = (Math.random() * 360) * (Math.PI / 180);
    const dist  = 60 + Math.random() * 80;
    el.style.setProperty("--dx", Math.cos(angle) * dist + "px");
    el.style.setProperty("--dy", Math.sin(angle) * dist + "px");
    el.style.left = x - 10 + "px";
    el.style.top  = y - 10 + "px";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

function formatTime(t) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${((h % 12) || 12)}:${String(m).padStart(2, "0")} ${ampm}`;
}

/* ═══════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════ */
initHearts();
runChat();
