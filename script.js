/* ═══════════════════════════════════════════════════════
   CONFIG — modifie tout ici pour personnaliser le site
═══════════════════════════════════════════════════════ */
const CONFIG = {

  /* Prénom de Ryan (affiché dans le chat) */
  yourName: "Ryan",

  /* Messages de la fausse conversation
     type "them" = bulle de Tsiaro (elle reçoit)
     type "me"   = bulle de Ryan (toi)
     delay = en millisecondes depuis le début */
  chatMessages: [
    { type: "them", text: "Coucou ! 👀",                             delay: 500  },
    { type: "me",   text: "Heyy 💙",                                 delay: 1400 },
    { type: "them", text: "Ça va ? T'as l'air bizarre lol 😭",       delay: 2500 },
    { type: "me",   text: "Je suis juste nerveux… 🥺",               delay: 3600 },
    { type: "them", text: "Pourquoi t'es nerveux ??",                 delay: 4800 },
    { type: "me",   text: "J'ai une question importante pour toi 😬", delay: 6000 },
    { type: "them", text: "Dis-moi ! Je t'écoute 🥹",                delay: 7400 },
  ],

  /* Délai après le dernier message avant la carte */
  cardDelay: 1800,

  /* Particules flottantes en arrière-plan */
  particles: ["💙", "🌸", "✨", "💕", "⭐", "🫶", "🌷"],
  particleCount: 20,

  /* Messages quand elle essaie de cliquer "non" */
  noMessages: [
    "Ce bouton ne fonctionne pas 😇",
    "Essaie encore 😏",
    "Non c'est pas une option 💅",
    "Tsiaro… sérieusement ? 🥺",
    "Je refuse que tu cliques là 😤",
    "Reviens ! 🌸",
    "Tu vas me faire pleurer 😭",
    "DORAEMON EST TRISTE 💙😢",
  ],

  /* Émojis du burst quand elle clique OUI */
  burstEmojis: ["💙", "✨", "🌸", "💕", "⭐", "🎉", "💫"],
};

/* ═══════════════════════════════════════════════════════
   GESTION DES ÉCRANS
═══════════════════════════════════════════════════════ */
const screens = {
  intro:  document.getElementById("screen-intro"),
  chat:   document.getElementById("screen-chat"),
  card:   document.getElementById("screen-card"),
  yes:    document.getElementById("screen-yes"),
  picker: document.getElementById("screen-picker"),
  final:  document.getElementById("screen-final"),
};

let currentScreen = "intro";

function goTo(name) {
  const from = screens[currentScreen];
  const to   = screens[name];
  from.classList.add("exit");
  setTimeout(() => {
    from.classList.remove("active", "exit");
    to.classList.add("active");
    currentScreen = name;
  }, 480);
}

/* ═══════════════════════════════════════════════════════
   PARTICULES FLOTTANTES
═══════════════════════════════════════════════════════ */
const particlesContainer = document.getElementById("particles");

function spawnParticle() {
  const el = document.createElement("span");
  el.className = "particle";
  el.textContent = CONFIG.particles[Math.floor(Math.random() * CONFIG.particles.length)];
  el.style.left     = Math.random() * 100 + "vw";
  el.style.fontSize = (0.75 + Math.random() * 1.1) + "rem";
  const dur = 8 + Math.random() * 9;
  el.style.animationDuration = dur + "s";
  el.style.animationDelay   = -(Math.random() * dur) + "s";
  particlesContainer.appendChild(el);
  setTimeout(() => el.remove(), (dur + 1) * 1000);
}

function initParticles() {
  for (let i = 0; i < CONFIG.particleCount; i++) spawnParticle();
  setInterval(spawnParticle, 2800);
}

/* ═══════════════════════════════════════════════════════
   CHAT ANIMÉ
═══════════════════════════════════════════════════════ */
const chatBody = document.getElementById("chat-body");

function appendBubble(type, text) {
  const row = document.createElement("div");
  row.className = `bubble-row ${type}`;

  const av = document.createElement("div");
  av.className = "bubble-avatar";
  av.textContent = type === "me" ? "😊" : "🥰";

  const bbl = document.createElement("div");
  bbl.className = "bubble";
  bbl.textContent = text;

  row.append(type === "me" ? bbl : av, type === "me" ? av : bbl);
  if (type === "me") { row.innerHTML = ""; row.append(bbl, av); }
  chatBody.appendChild(row);
  requestAnimationFrame(() => requestAnimationFrame(() => row.classList.add("visible")));
  chatBody.scrollTop = chatBody.scrollHeight;
}

function showTyping() {
  const row = document.createElement("div");
  row.className = "bubble-row them";
  row.id = "typing-indicator";
  const av = document.createElement("div");
  av.className = "bubble-avatar";
  av.textContent = "🥰";
  const dots = document.createElement("div");
  dots.className = "bubble typing-dots";
  dots.innerHTML = "<span></span><span></span><span></span>";
  row.append(av, dots);
  chatBody.appendChild(row);
  requestAnimationFrame(() => requestAnimationFrame(() => row.classList.add("visible")));
  chatBody.scrollTop = chatBody.scrollHeight;
}

function removeTyping() {
  document.getElementById("typing-indicator")?.remove();
}

async function runChat() {
  let prevDelay = 0;
  for (const msg of CONFIG.chatMessages) {
    const gap = msg.delay - prevDelay;
    prevDelay = msg.delay;
    await wait(gap);
    if (msg.type === "them") {
      showTyping();
      await wait(750);
      removeTyping();
    }
    appendBubble(msg.type, msg.text);
  }
  await wait(CONFIG.cardDelay);
  goTo("card");
}

/* ═══════════════════════════════════════════════════════
   BOUTON NON — s'enfuit !
═══════════════════════════════════════════════════════ */
const btnNo = document.getElementById("btn-no");
let noIdx = 0;
let activeToast = null;

function runAway() {
  // Toast message
  if (activeToast) activeToast.remove();
  activeToast = document.createElement("div");
  activeToast.className = "toast";
  activeToast.textContent = CONFIG.noMessages[noIdx % CONFIG.noMessages.length];
  noIdx++;
  document.body.appendChild(activeToast);
  setTimeout(() => {
    activeToast.style.opacity = "0";
    activeToast.style.transition = "opacity 0.4s";
    setTimeout(() => activeToast?.remove(), 450);
  }, 1800);

  // Bouton se déplace
  btnNo.classList.add("escaped");
  const vw = window.innerWidth  - btnNo.offsetWidth  - 16;
  const vh = window.innerHeight - btnNo.offsetHeight - 16;
  btnNo.style.left = Math.max(8, Math.floor(Math.random() * vw)) + "px";
  btnNo.style.top  = Math.max(8, Math.floor(Math.random() * vh)) + "px";
}

btnNo.addEventListener("mouseenter", runAway);
btnNo.addEventListener("touchstart",  runAway, { passive: true });

/* ═══════════════════════════════════════════════════════
   BOUTON OUI
═══════════════════════════════════════════════════════ */
document.getElementById("btn-yes").addEventListener("click", (e) => {
  burst(e.clientX, e.clientY, 14);
  goTo("yes");
});

document.getElementById("btn-next").addEventListener("click", () => goTo("picker"));

/* ═══════════════════════════════════════════════════════
   BOUTON INTRO
═══════════════════════════════════════════════════════ */
document.getElementById("btn-start").addEventListener("click", () => {
  goTo("chat");
  runChat();
});

/* ═══════════════════════════════════════════════════════
   CONFIRMATION DATE
═══════════════════════════════════════════════════════ */
document.getElementById("btn-confirm").addEventListener("click", () => {
  const dateVal = document.getElementById("pick-date").value;
  const timeVal = document.getElementById("pick-time").value;
  const noteVal = document.getElementById("pick-note").value.trim();

  if (!dateVal || !timeVal) {
    showToast("Choisis une date et une heure 🥺");
    return;
  }

  const dateStr = new Date(dateVal + "T12:00:00").toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  });
  const timeStr = formatTime(timeVal);

  let summary = `📅 ${capitalize(dateStr)}\n🕐 ${timeStr}`;
  if (noteVal) summary += `\n🌙 "${noteVal}"`;

  document.getElementById("final-summary").textContent = summary;
  burst(window.innerWidth / 2, window.innerHeight / 2, 20);
  goTo("final");
});

/* ═══════════════════════════════════════════════════════
   BURST D'ÉMOJIS
═══════════════════════════════════════════════════════ */
function burst(x, y, count = 10) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "burst-particle";
    el.textContent = CONFIG.burstEmojis[Math.floor(Math.random() * CONFIG.burstEmojis.length)];
    const angle = (Math.random() * 360) * (Math.PI / 180);
    const dist  = 55 + Math.random() * 90;
    el.style.setProperty("--dx", Math.cos(angle) * dist + "px");
    el.style.setProperty("--dy", Math.sin(angle) * dist + "px");
    el.style.left = (x - 12) + "px";
    el.style.top  = (y - 12) + "px";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
}

/* ═══════════════════════════════════════════════════════
   UTILITAIRES
═══════════════════════════════════════════════════════ */
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

function formatTime(t) {
  const [h, m] = t.split(":").map(Number);
  return `${String(h).padStart(2,"0")}h${String(m).padStart(2,"0")}`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function showToast(msg) {
  if (activeToast) activeToast.remove();
  activeToast = document.createElement("div");
  activeToast.className = "toast";
  activeToast.textContent = msg;
  document.body.appendChild(activeToast);
  setTimeout(() => {
    activeToast.style.opacity = "0";
    activeToast.style.transition = "opacity 0.4s";
  }, 2000);
}

/* ═══════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════ */
initParticles();
