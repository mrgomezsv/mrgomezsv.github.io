// Online mode using Firebase (client-side). Intended for casual play with friends.

(function () {
  console.log("[Online] Script loaded");
  const cfg = window.FIREBASE_CONFIG || null;
  const warn = document.getElementById("online-warning");

  if (!cfg) {
    if (warn) {
      warn.style.display = "block";
      warn.textContent = "Falta configuración de Firebase. Edita 'firebase-config.js' con tu proyecto para habilitar el modo en línea.";
    }
    // Adjuntar manejadores básicos para informar al usuario si hace clic
    const createBtn = document.getElementById("btn-create-room");
    const joinBtn = document.getElementById("btn-join-room");
    const connectStatus = document.getElementById("connect-status");
    if (connectStatus) connectStatus.textContent = "Config de Firebase no detectada";
    const onClick = () => {
      console.log("[Online] Click bloqueado: falta configuración de Firebase");
      alert("Falta configuración de Firebase. Completa 'project/splash/firebase-config.js'.");
    };
    if (createBtn) createBtn.addEventListener("click", onClick);
    if (joinBtn) joinBtn.addEventListener("click", onClick);
    return;
  }

  // Initialize Firebase
  // eslint-disable-next-line no-undef
  const app = firebase.initializeApp(cfg);
  // eslint-disable-next-line no-undef
  const auth = firebase.auth();
  // eslint-disable-next-line no-undef
  const db = firebase.firestore();

  const ui = {
    name: $("online-name"),
    theme: $("online-theme"),
    createBtn: $("btn-create-room"),
    joinCode: $("join-code"),
    joinBtn: $("btn-join-room"),
    lobby: $("lobby"),
    lobbyList: $("lobby-players"),
    startBtn: $("btn-start-online"),
    roomCode: $("room-code"),
    roomCodeInline: $("room-code-inline"),
    copyCode: $("btn-copy-code"),
    shareRoom: $("btn-share-room"),
    joinLink: $("join-link"),
    helpBtn: $("btn-help"),
    connectStatus: $("connect-status"),
    revealCounter: $("reveal-counter"),
    revealPlayerName: $("reveal-player-name"),
    revealContent: $("reveal-content"),
    btnShow: $("btn-show"),
    btnHideNext: $("btn-hide-next"),
    playTheme: $("play-theme"),
    roundNumber: $("round-number"),
    turnPlayer: $("turn-player"),
    chatLog: $("chat-log"),
    hintForm: $("hint-form"),
    hintInput: $("hint-input"),
    btnNewRound: $("btn-new-round"),
    btnGoVote: $("btn-go-vote"),
    voteCounter: $("vote-counter"),
    votePlayerName: $("vote-player-name"),
    candidates: $("candidates"),
    btnStartRevote: $("btn-start-revote"),
    resultWord: $("result-word"),
    resultImpostor: $("result-impostor"),
    leaveBtn: $("btn-leave-room")
  };

  const local = {
    user: null,
    roomRef: null,
    playersRef: null,
    chatRef: null,
    unsubRoom: null,
    unsubPlayers: null,
    unsubChat: null,
    revealShown: false,
    presenceTimer: null
  };

  const PHASE = { LOBBY: "lobby", REVEAL: "reveal", PLAY: "play", VOTE: "vote", RESULTS: "results" };

  function $(id) { return document.getElementById(id); }

  function choice(array) { return array[Math.floor(Math.random() * array.length)]; }

  // Fallback de palabras si no existe window.THEME_WORDS (no cargamos el script local)
  const FALLBACK_WORDS = {
    Hogar: ["Casa","Cocina","Cama","Sofá","Ventana","Puerta","Mesa","Silla","Lámpara","Baño"],
    Trabajo: ["Oficina","Jefe","Reunión","Teclado","Escritorio","Proyecto","Informe","Correo","Horario","Meta"],
    Transporte: ["Auto","Autobús","Bicicleta","Avión","Tren","Estación","Semáforo","Tráfico","Taxi","Metro"],
    Comida: ["Pizza","Sopa","Carne","Arroz","Ensalada","Pan","Queso","Huevo","Fruta","Salsa"],
    Naturaleza: ["Árbol","Río","Montaña","Playa","Bosque","Viento","Lluvia","Sol","Nube","Nieve"],
    Tecnología: ["Computadora","Celular","Internet","Robot","Servidor","Red","Código","Pantalla","Teclado","Router"]
  };

  function roomIdFromCode(code) { return code.toUpperCase(); }

  function randomCode(len = 6) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }

  function showScreen(name) {
    ["online-setup", "reveal", "play", "vote", "results"].forEach((n) => {
      const el = document.getElementById(`screen-${n}`);
      if (!el) return;
      el.classList.toggle("active", n === name);
    });
  }

  function getJoinUrl(code) {
    const url = new URL(window.location.href);
    url.searchParams.set("room", code);
    return url.toString();
  }

  function updateOnlineStatus() {
    if (ui.connectStatus) {
      if (!navigator.onLine) {
        ui.connectStatus.textContent = "Sin conexión. Revisa tu internet o bloqueadores.";
      } else {
        ui.connectStatus.textContent = "Listo. Puedes crear una sala o unirte.";
      }
    }
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // Modal simple (soporta string u objeto con opciones)
  function showModal(message) {
    const overlay = document.getElementById("modal");
    const titleEl = document.getElementById("modal-title");
    const text = document.getElementById("modal-text");
    const ok = document.getElementById("modal-ok");
    const cancel = document.getElementById("modal-cancel");
    if (!overlay || !text || !ok) {
      // eslint-disable-next-line no-alert
      alert(typeof message === "string" ? message : (message?.message || ""));
      return;
    }

    const opts = typeof message === "object" ? message : {};
    if (titleEl) titleEl.textContent = opts.title || "Aviso";
    text.textContent = typeof message === "string" ? message : (opts.message || "");
    ok.textContent = opts.confirmText || "Aceptar";
    if (cancel) {
      if (opts.cancelText) {
        cancel.style.display = "inline-block";
        cancel.textContent = opts.cancelText;
      } else {
        cancel.style.display = "none";
      }
    }

    overlay.classList.add("open");
    const onOk = () => { try { opts.onConfirm && opts.onConfirm(); } finally { close(); } };
    const onCancel = () => { try { opts.onCancel && opts.onCancel(); } finally { close(); } };
    function close() {
      overlay.classList.remove("open");
      ok.removeEventListener("click", onOk);
      if (cancel) cancel.removeEventListener("click", onCancel);
    }
    ok.addEventListener("click", onOk);
    if (cancel) cancel.addEventListener("click", onCancel);
  }

  function showConfirm(message, opts = {}) {
    showModal({ message, title: opts.title || "Confirmar", confirmText: opts.confirmText || "Aceptar", cancelText: opts.cancelText || "Cancelar", onConfirm: opts.onConfirm, onCancel: opts.onCancel });
  }

  function showAuthHelpModal(error) {
    const code = (error && error.code) || "";
    const msg = (error && error.message) || "";
    const body = [
      "No se pudo inicializar Firebase Auth.",
      "\nPasos:",
      "1) En Firebase Console → Authentication: presiona 'Get started' para inicializar.",
      "2) Sign-in method: habilita 'Anonymous'.",
      "3) Settings → Authorized domains: agrega 'localhost' y 'mrgomezsv.github.io'.",
      "4) Verifica 'firebase-config.js' (apiKey, authDomain, projectId).",
    ].join("\n");
    showModal({ title: "Configurar Firebase Auth", message: `${body}\n\n${code ? `Código: ${code}` : ""}${msg ? `\n${msg}` : ""}`, confirmText: "Entendido" });
  }

  function showFirestoreHelpModal(error) {
    const code = (error && error.code) || "";
    const msg = (error && error.message) || "";
    const body = [
      "Revisa Firestore:",
      "1) Crea la base de datos (Production mode).",
      "2) Publica reglas mínimas para rooms/players/chat.",
      "3) Verifica que tu usuario esté autenticado (Auth anónimo habilitado).",
    ].join("\n");
    showModal({ title: "Permisos de Firestore", message: `${body}\n\n${code ? `Código: ${code}` : ""}${msg ? `\n${msg}` : ""}`, confirmText: "Ok" });
  }

  async function signIn() {
    // Asegurar persistencia local para que el uid sobreviva recargas
    try {
      await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    } catch (_) {}
    if (auth.currentUser) return auth.currentUser;
    try {
      const res = await auth.signInAnonymously();
      return res.user;
    } catch (err) {
      // Errores típicos: auth/configuration-not-found, auth/operation-not-allowed
      showAuthHelpModal(err);
      throw err;
    }
  }

  // Lobby
  async function createRoom() {
    console.log("[Online] Create button handler -> createRoom()");
    const name = ui.name.value.trim();
    if (!name) { showModal("Ingresa tu nombre"); return; }
    let user;
    try { user = await signIn(); console.log("[Online] Signed in (host)", user && user.uid); } catch (_) { return; }
    local.user = user;

    const code = randomCode();
    const rid = roomIdFromCode(code);
    const roomRef = db.collection("rooms").doc(rid);
    const created = Date.now();

    // Mostrar el código inmediatamente en la UI (antes de Firestore)
    try {
      if (ui.roomCode) ui.roomCode.textContent = code;
      if (ui.roomCodeInline) ui.roomCodeInline.textContent = code;
      if (ui.joinLink) ui.joinLink.textContent = `Enlace para unirse: ${getJoinUrl(code)}`;
      if (ui.lobby) ui.lobby.style.display = "block";
      console.log("[Online] Provisional room code displayed", code);
    } catch (_) {}
    try {
      await roomRef.set({
      code,
      hostId: user.uid,
      theme: ui.theme.value,
      created,
      phase: PHASE.LOBBY,
      round: 1,
      maxRounds: 3,
      revealOrder: [],
      revealIndex: 0,
      activeIds: [],
      turnIndex: 0,
      hintsThisRound: 0,
      waitingNextRound: false
    });
    } catch (e) {
      showFirestoreHelpModal(e);
      return;
    }

    await roomRef.collection("players").doc(user.uid).set({ name, joinedAt: created, eliminated: false, lastSeen: Date.now() }, { merge: true });
    console.log("[Online] Room created", { code, rid });

    try {
      localStorage.setItem("imp_name", name);
      localStorage.setItem("imp_room", code);
    } catch (_) {}

    bindRoom(roomRef);
  }

  async function joinRoom() {
    console.log("[Online] Join button handler -> joinRoom()");
    const name = ui.name.value.trim();
    if (!name) { showModal("Ingresa tu nombre"); return; }
    const code = ui.joinCode.value.trim().toUpperCase();
    if (!code) { showModal("Ingresa el código de sala"); return; }
    const rid = roomIdFromCode(code);
    const roomRef = db.collection("rooms").doc(rid);
    const room = await roomRef.get();
    if (!room.exists) { showModal("La sala no existe"); return; }
    let user;
    try { user = await signIn(); console.log("[Online] Signed in (join)", user && user.uid); } catch (_) { return; }
    local.user = user;
    const now = Date.now();
    try {
      await roomRef.collection("players").doc(user.uid).set({ name, joinedAt: now, eliminated: false, lastSeen: now }, { merge: true });
    } catch (e) {
      showFirestoreHelpModal(e);
      return;
    }
    console.log("[Online] Joined room", { code, rid });

    try {
      localStorage.setItem("imp_name", name);
      localStorage.setItem("imp_room", code);
    } catch (_) {}
    bindRoom(roomRef);
  }

  function bindRoom(roomRef) {
    cleanupSubs();
    local.roomRef = roomRef;
    local.playersRef = roomRef.collection("players");
    local.chatRef = roomRef.collection("chat");

    ui.lobby.style.display = "block";
    showScreen("online-setup");

    local.unsubRoom = roomRef.onSnapshot((snap) => {
      if (!snap.exists) return;
      renderRoom(snap.data());
    });
    local.unsubPlayers = local.playersRef.orderBy("joinedAt").onSnapshot((qs) => {
      const list = [];
      qs.forEach((d) => list.push({ id: d.id, ...d.data() }));
      renderPlayers(list);
    });
    local.unsubChat = local.chatRef.orderBy("ts").limit(500).onSnapshot((qs) => {
      const items = [];
      qs.forEach((d) => items.push(d.data()));
      renderChat(items);
    });
    startPresence();
  }

  function cleanupSubs() {
    if (local.unsubRoom) local.unsubRoom();
    if (local.unsubPlayers) local.unsubPlayers();
    if (local.unsubChat) local.unsubChat();
    local.unsubRoom = local.unsubPlayers = local.unsubChat = null;
    stopPresence();
  }

  function renderPlayers(players) {
    ui.lobbyList.innerHTML = "";
    players.forEach((p) => {
      const li = document.createElement("li");
      li.className = "chat-item";
      li.innerHTML = `<span class="author">${escapeHtml(p.name)}</span> ${p.eliminated ? '<span class="muted">(eliminado)</span>' : ''}`;
      ui.lobbyList.appendChild(li);
    });
  }

  function renderChat(items) {
    ui.chatLog.innerHTML = "";
    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "chat-item";
      li.innerHTML = `<span class="author">${escapeHtml(item.name)}</span> <span class="text">${escapeHtml(item.text)}</span> <span class="muted">(Ronda ${item.round})</span>`;
      ui.chatLog.appendChild(li);
    });
    ui.chatLog.scrollTop = ui.chatLog.scrollHeight;
  }

  function isHost(room) { return local.user && room.hostId === local.user.uid; }

  function getMyId() { return (local.user && local.user.uid) || null; }

  function getCurrentRevealUid(room) {
    const idx = room.revealIndex || 0;
    return (room.revealOrder && room.revealOrder[idx]) || null;
  }

  function renderRoom(room) {
    ui.roomCode.textContent = room.code || "-";
    ui.roomCodeInline.textContent = room.code || "-";
    ui.playTheme.textContent = room.theme || "-";
    ui.roundNumber.textContent = String(room.round || 1);
    if (ui.joinLink && room.code) {
      ui.joinLink.textContent = `Enlace para unirse: ${getJoinUrl(room.code)}`;
    }

    if (room.phase === PHASE.LOBBY) {
      showScreen("online-setup");
      ui.startBtn.disabled = !isHost(room);
    }

    if (room.phase === PHASE.REVEAL) {
      showScreen("reveal");
      const total = (room.revealOrder || []).length;
      const idx = room.revealIndex || 0;
      ui.revealCounter.textContent = `${idx} / ${total}`;
      const uid = getCurrentRevealUid(room);
      ui.revealPlayerName.textContent = room.playerNames?.[uid] || "-";
      const myTurn = getMyId() === uid;
      ui.btnShow.disabled = !myTurn;
      ui.btnHideNext.disabled = !myTurn || !local.revealShown;
      if (!myTurn) {
        ui.revealContent.textContent = "Oculto";
        local.revealShown = false;
      }
    }

    if (room.phase === PHASE.PLAY) {
      showScreen("play");
      const turnUid = room.activeIds?.[room.turnIndex || 0] || null;
      ui.turnPlayer.textContent = room.playerNames?.[turnUid] || "-";
      const myTurn = getMyId() === turnUid;
      ui.hintInput.disabled = !myTurn;
      const submitBtn = ui.hintForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = !myTurn;

      if (room.waitingNextRound) {
        ui.hintInput.disabled = true;
        if (submitBtn) submitBtn.disabled = true;
        if (room.round < (room.maxRounds || 3)) {
          ui.btnNewRound.disabled = !isHost(room);
          ui.btnNewRound.textContent = `Comenzar ronda ${room.round + 1}`;
          ui.btnGoVote.style.display = "none";
        } else {
          ui.btnNewRound.disabled = true;
          ui.btnGoVote.style.display = isHost(room) ? "inline-block" : "none";
        }
      } else {
        ui.btnNewRound.disabled = true;
        ui.btnGoVote.style.display = "none";
      }
    }

    if (room.phase === PHASE.VOTE) {
      showScreen("vote");
      renderVote(room);
    }

    if (room.phase === PHASE.RESULTS) {
      showScreen("results");
      ui.resultWord.textContent = room.word || "-";
      ui.resultImpostor.textContent = room.playerNames?.[room.impostorId] || "-";
    }
  }

  // Start game (host)
  async function startGame() {
    const snap = await local.roomRef.get();
    const room = snap.data();
    if (!isHost(room)) return;

    const playersSnap = await local.playersRef.get();
    const players = [];
    playersSnap.forEach((d) => { if (!d.data().eliminated) players.push({ id: d.id, name: d.data().name }); });
    if (players.length < 3) { showModal("Se requieren al menos 3 jugadores"); return; }

    const playerNames = {};
    players.forEach((p) => playerNames[p.id] = p.name);
    const activeIds = players.map(p => p.id);
    const impostorId = choice(activeIds);
    const pool = (window.THEME_WORDS && window.THEME_WORDS[ui.theme.value]) || FALLBACK_WORDS[ui.theme.value] || [];
    const word = choice(pool);

    await local.roomRef.update({
      theme: ui.theme.value,
      playerNames,
      activeIds,
      impostorId,
      word,
      revealOrder: activeIds,
      revealIndex: 0,
      phase: PHASE.REVEAL,
      round: 1,
      turnIndex: 0,
      hintsThisRound: 0,
      waitingNextRound: false
    });
  }

  // Reveal actions (only current player)
  async function clickShow() {
    const snap = await local.roomRef.get();
    const room = snap.data();
    const uid = getCurrentRevealUid(room);
    if (getMyId() !== uid) return;
    const isImpostor = uid === room.impostorId;
    ui.revealContent.textContent = isImpostor ? "IMPOSTOR" : (room.word || "-");
    local.revealShown = true;
    ui.btnHideNext.disabled = false;
  }

  async function clickHideNext() {
    const snap = await local.roomRef.get();
    const room = snap.data();
    const uid = getCurrentRevealUid(room);
    if (getMyId() !== uid || !local.revealShown) return;
    const nextIndex = (room.revealIndex || 0) + 1;
    if (nextIndex >= (room.revealOrder || []).length) {
      await local.roomRef.update({ phase: PHASE.PLAY, revealIndex: nextIndex });
    } else {
      await local.roomRef.update({ revealIndex: nextIndex });
    }
    local.revealShown = false;
  }

  // Play actions
  async function submitHint(ev) {
    ev.preventDefault();
    const snap = await local.roomRef.get();
    const room = snap.data();
    const turnUid = room.activeIds?.[room.turnIndex || 0] || null;
    if (getMyId() !== turnUid) return;
    const text = ui.hintInput.value.trim();
    if (!text) return;
    const name = room.playerNames?.[getMyId()] || "-";
    await local.chatRef.add({ ts: Date.now(), uid: getMyId(), name, text, round: room.round || 1 });
    ui.hintInput.value = "";

    const hints = (room.hintsThisRound || 0) + 1;
    const activeCount = (room.activeIds || []).length;
    if (hints >= activeCount) {
      await local.roomRef.update({ hintsThisRound: hints, waitingNextRound: true });
    } else {
      const nextTurn = (room.turnIndex || 0) + 1 >= activeCount ? 0 : (room.turnIndex || 0) + 1;
      await local.roomRef.update({ hintsThisRound: hints, turnIndex: nextTurn });
    }
  }

  async function startNextRound() {
    const snap = await local.roomRef.get();
    const room = snap.data();
    if (!isHost(room)) return;
    if (!room.waitingNextRound) return;
    if ((room.round || 1) >= (room.maxRounds || 3)) return;
    await local.roomRef.update({
      round: (room.round || 1) + 1,
      turnIndex: 0,
      hintsThisRound: 0,
      waitingNextRound: false
    });
  }

  async function goToVote() {
    const snap = await local.roomRef.get();
    const room = snap.data();
    if (!isHost(room)) return;
    await local.roomRef.update({ phase: PHASE.VOTE, vote: { votes: {}, orderIndex: 0, tie: false } });
  }

  // Voting
  function renderVote(room) {
    const active = (room.activeIds || []).slice();
    const voterUid = active[room.vote?.orderIndex || 0] || null;
    ui.voteCounter.textContent = `${room.vote?.orderIndex || 0} / ${active.length}`;
    ui.votePlayerName.textContent = room.playerNames?.[voterUid] || "-";
    ui.candidates.innerHTML = "";
    if (!voterUid) return;
    const myTurn = getMyId() === voterUid;
    (active).forEach((uid) => {
      if (uid === voterUid) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn";
      btn.textContent = room.playerNames?.[uid] || uid;
      btn.disabled = !myTurn;
      btn.addEventListener("click", () => submitVote(uid));
      ui.candidates.appendChild(btn);
    });
    ui.btnStartRevote.style.display = room.vote?.tie ? "inline-block" : "none";
  }

  async function submitVote(candidateUid) {
    const snap = await local.roomRef.get();
    const room = snap.data();
    const active = (room.activeIds || []).slice();
    const voterUid = active[room.vote?.orderIndex || 0] || null;
    if (getMyId() !== voterUid) return;
    const votes = room.vote?.votes || {};
    votes[voterUid] = candidateUid;
    const nextIndex = (room.vote?.orderIndex || 0) + 1;
    if (nextIndex >= active.length) {
      // tally
      const counts = {};
      Object.values(votes).forEach((uid) => { counts[uid] = (counts[uid] || 0) + 1; });
      let max = 0; Object.values(counts).forEach((c) => { if (c > max) max = c; });
      const top = Object.entries(counts).filter(([, c]) => c === max).map(([id]) => id);
      if (top.length !== 1 || max === 0) {
        await local.roomRef.update({ vote: { votes: {}, orderIndex: 0, tie: true } });
        return;
      }
      const eliminated = top[0];
      if (eliminated === room.impostorId) {
        await local.roomRef.update({ phase: PHASE.RESULTS });
        return;
      }
      const newActive = active.filter((id) => id !== eliminated);
      if (newActive.length <= 1) {
        await local.roomRef.update({ phase: PHASE.RESULTS, activeIds: newActive });
        return;
      }
      await local.roomRef.update({ activeIds: newActive, vote: { votes: {}, orderIndex: 0, tie: false } });
    } else {
      await local.roomRef.update({ vote: { votes, orderIndex: nextIndex, tie: false } });
    }
  }

  async function startRevote() {
    const snap = await local.roomRef.get();
    const room = snap.data();
    await local.roomRef.update({ vote: { votes: {}, orderIndex: 0, tie: false } });
  }

  // Tutorial interactivo (pasos básicos)
  function startTutorial() {
    const steps = [
      { title: "Paso 1/6", message: "Escribe tu nombre en el campo 'Tu nombre'." },
      { title: "Paso 2/6", message: "Pulsa 'Crear sala'. Se generará un código y un enlace." },
      { title: "Paso 3/6", message: "Comparte el código con 'Copiar código' o 'Compartir'." },
      { title: "Paso 4/6", message: "Tus amigos ingresan el código y pulsan 'Unirme'." },
      { title: "Paso 5/6", message: "Como anfitrión, pulsa 'Iniciar juego' cuando estén listos." },
      { title: "Paso 6/6", message: "Cada jugador revela su rol cuando le toque; luego dan pistas por 3 rondas y finalmente votan al impostor." },
    ];
    let i = 0;
    const next = () => {
      const s = steps[i];
      showModal({
        title: s.title,
        message: s.message,
        confirmText: i === steps.length - 1 ? "Entendido" : "Siguiente",
        cancelText: i > 0 ? "Anterior" : undefined,
        onConfirm: () => { if (i < steps.length - 1) { i++; next(); } },
        onCancel: () => { if (i > 0) { i--; next(); } }
      });
    };
    next();
  }

  // Presence & sesión
  function startPresence() {
    stopPresence();
    if (!local.roomRef || !getMyId()) return;
    local.presenceTimer = setInterval(() => {
      try {
        local.roomRef.collection("players").doc(getMyId()).set({ lastSeen: Date.now() }, { merge: true });
      } catch (_) {}
    }, 20000);
    window.addEventListener("beforeunload", onBeforeUnload);
  }

  function stopPresence() {
    if (local.presenceTimer) clearInterval(local.presenceTimer);
    local.presenceTimer = null;
    window.removeEventListener("beforeunload", onBeforeUnload);
  }

  function onBeforeUnload() {
    try {
      if (local.roomRef && getMyId()) {
        local.roomRef.collection("players").doc(getMyId()).set({ lastSeen: Date.now() }, { merge: true });
      }
    } catch (_) {}
  }

  async function leaveRoom() {
    try {
      if (local.roomRef && getMyId()) {
        await local.roomRef.collection("players").doc(getMyId()).delete();
      }
    } catch (_) {}
    cleanupSubs();
    try {
      localStorage.removeItem("imp_room");
    } catch (_) {}
    showScreen("online-setup");
  }

  function resumeIfPossible() {
    try {
      const savedName = localStorage.getItem("imp_name") || "";
      const savedRoom = (new URLSearchParams(window.location.search).get("room") || localStorage.getItem("imp_room") || "").toUpperCase();
      if (savedName) ui.name.value = savedName;
      if (savedRoom) ui.joinCode.value = savedRoom;
    } catch (_) {}
  }

  // Event wiring
  ui.createBtn.addEventListener("click", () => { console.log("[Online] Create button clicked"); createRoom(); });
  ui.joinBtn.addEventListener("click", () => { console.log("[Online] Join button clicked"); joinRoom(); });
  ui.startBtn.addEventListener("click", startGame);
  ui.btnShow.addEventListener("click", clickShow);
  ui.btnHideNext.addEventListener("click", clickHideNext);
  ui.hintForm.addEventListener("submit", submitHint);
  ui.btnNewRound.addEventListener("click", () => showConfirm("¿Comenzar la siguiente ronda?", { onConfirm: startNextRound }));
  ui.btnGoVote.addEventListener("click", () => showConfirm("¿Ir a votación ahora?", { onConfirm: goToVote }));
  ui.btnStartRevote.addEventListener("click", startRevote);
  ui.leaveBtn.addEventListener("click", () => showConfirm("¿Salir de la sala?", { onConfirm: leaveRoom }));
  if (ui.helpBtn) ui.helpBtn.addEventListener("click", startTutorial);
  if (ui.copyCode) ui.copyCode.addEventListener("click", async () => {
    const code = ui.roomCode.textContent.trim();
    if (!code) return;
    try { await navigator.clipboard.writeText(code); if (warn) { warn.style.display = "block"; warn.textContent = "Código copiado"; setTimeout(() => warn.style.display = "none", 1500); } } catch (_) {}
  });
  if (ui.shareRoom) ui.shareRoom.addEventListener("click", async () => {
    const code = ui.roomCode.textContent.trim();
    if (!code) return;
    const link = getJoinUrl(code);
    if (navigator.share) {
      try { await navigator.share({ title: "Impostor - Sala", text: `Únete con el código ${code}`, url: link }); } catch (_) {}
    } else {
      try { await navigator.clipboard.writeText(link); if (warn) { warn.style.display = "block"; warn.textContent = "Enlace copiado"; setTimeout(() => warn.style.display = "none", 1500); } } catch (_) {}
    }
  });

  // Prefill posibles datos de sesión
  resumeIfPossible();

  // Indicador de red
  try { db.enableNetwork && db.enableNetwork(); } catch (_) {}
  updateOnlineStatus();
  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
})();


