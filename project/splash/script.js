// Estado del juego
const state = {
  players: [],
  impostorIndex: null,
  theme: "Hogar",
  secretWord: null,
  phase: "setup", // setup | reveal | play | results
  revealIndex: 0,
  turnIndex: 0, // índice relativo dentro de activos
  round: 1,
  chatLog: [], // { player, text, round }
  // Nuevos campos
  activePlayerIndices: [], // índices originales de jugadores activos
  hintsThisRound: 0,
  maxRounds: 3,
  waitingNextRound: false,
  // Votación
  votes: {}, // { voterOriginalIndex: candidateOriginalIndex }
  voteOrderIndex: 0,
  voteTie: false
};

// Diccionario de palabras por temática (listas ampliadas)
const THEME_WORDS = {
  Hogar: [
    "Casa",
    "Sala",
    "Cocina",
    "Cama",
    "Sofá",
    "Televisor",
    "Puerta",
    "Ventana",
    "Frío",
    "Calor",
    "Baño",
    "Ducha",
    "Toalla",
    "Espejo",
    "Escoba",
    "Refrigerador",
    "Microondas",
    "Horno",
    "Lavadora",
    "Secadora",
    "Platos",
    "Vasos",
    "Taza",
    "Tenedor",
    "Cuchillo",
    "Cuchara",
    "Mesa",
    "Silla",
    "Lámpara",
    "Enchufe",
    "Cable",
    "Alfombra",
    "Cortina",
    "Balcón",
    "Patio",
    "Techo",
    "Piso",
    "Pared",
    "Cuadro",
    "Reloj",
    "Perchero",
    "Closet",
    "Cajón",
    "Almohada",
    "Cobija",
    "Colchón",
    "Shampoo",
    "Jabón",
    "Cepillo",
    "Pasta dental",
    "Plancha",
    "Ventilador",
    "Calefacción",
    "Termostato",
    "Timbre",
    "Llave",
    "Cerradura",
    "Escalera",
    "Pasillo",
    "Garaje","Jardín","Sótano","Azotea","Comedor","Lavaplatos","Tetera","Cafetera","Cubeta","Escurridor",
    "Velador","Chimenea","Habitación","Cuna","Repisa","Biblioteca","Cesto","Interruptor","Foco","Persianas"
  ],
  Trabajo: [
    "Oficina",
    "Jefe",
    "Reunión",
    "Teclado",
    "Escritorio",
    "Informe",
    "Correo",
    "Proyecto",
    "Horario",
    "Vacaciones",
    "Salario",
    "Contrato",
    "Empleado",
    "Cliente",
    "Proveedor",
    "Presupuesto",
    "Factura",
    "Auditoría",
    "Reporte",
    "Meta",
    "Objetivo",
    "KPI",
    "Plan",
    "Agenda",
    "Calendario",
    "Presentación",
    "Proyector",
    "Sala de juntas",
    "Cafetería",
    "Pausa",
    "Break",
    "Uniforme",
    "Credencial",
    "ID",
    "Tarjeta",
    "Huella",
    "Nómina",
    "Recursos humanos",
    "Contabilidad",
    "Marketing",
    "Ventas",
    "Soporte",
    "Desarrollo",
    "Diseño",
    "QA",
    "Producción",
    "Logística",
    "Almacén",
    "Inventario",
    "Envío",
    "Reembolso",
    "Teletrabajo",
    "Videollamada",
    "Chat",
    "Ticket",
    "Incidente",
    "Prioridad",
    "Deadline",
    "Entrega",
    "Recepción","Planilla","Reunión virtual","Firma","Aprobación","Impresora","Escáner","Grapadora","Clip",
    "Post-it","Marcador","Archivador","Carpeta","Contraseña","Intranet","VPN","Sala de espera","Plantilla","Borrador","Minuta"
  ],
  Transporte: [
    "Auto",
    "Autobús",
    "Bicicleta",
    "Avión",
    "Tren",
    "Estación",
    "Conductor",
    "Semáforo",
    "Tráfico",
    "Garaje",
    "Metro",
    "Taxi",
    "Motocicleta",
    "Scooter",
    "Camión",
    "Barco",
    "Puerto",
    "Aeropuerto",
    "Terminal",
    "Andén",
    "Boleto",
    "Pasajero",
    "Maleta",
    "Casco",
    "Cinturón",
    "Gasolina",
    "Diésel",
    "Eléctrico",
    "Carga",
    "Peaje",
    "Rampa",
    "Túnel",
    "Puente",
    "Parada",
    "Ruta",
    "GPS",
    "Mapa",
    "Dirección",
    "Velocidad",
    "Acelerador",
    "Freno",
    "Volante",
    "Llanta",
    "Parabrisas",
    "Limpiaparabrisas",
    "Faros",
    "Bocina",
    "Claxon",
    "Asiento",
    "Vagón",
    "Cabina",
    "Despegue",
    "Aterrizaje",
    "Embarque",
    "Aduana",
    "Control",
    "Patineta","Tractor","Teleférico","Tranvía","Velero","Remolque","Carretera","Autopista","Avenida","Rotonda",
    "Estacionamiento","Peatón","Ciclovía","Caseta","Cambio","Embrague","Itinerario","Parquímetro","Helipuerto","Boya"
  ],
  Comida: [
    "Pizza",
    "Sopa",
    "Carne",
    "Arroz",
    "Ensalada",
    "Postre",
    "Salsa",
    "Dulce",
    "Salado",
    "Picante",
    "Pasta",
    "Pan",
    "Queso",
    "Huevo",
    "Leche",
    "Yogur",
    "Mantequilla",
    "Aceite",
    "Azúcar",
    "Sal",
    "Pimienta",
    "Tomate",
    "Cebolla",
    "Ajo",
    "Limón",
    "Naranja",
    "Manzana",
    "Plátano",
    "Uva",
    "Fresa",
    "Mango",
    "Piña",
    "Sandía",
    "Melón",
    "Zanahoria",
    "Papa",
    "Maíz",
    "Frijol",
    "Lenteja",
    "Garbanzo",
    "Pollo",
    "Pescado",
    "Cerdo",
    "Res",
    "Camarón",
    "Tofu",
    "Soya",
    "Caldo",
    "Estofado",
    "Asado",
    "Horneado",
    "Frito",
    "Hervido",
    "Al vapor",
    "Parrilla",
    "Restaurante",
    "Menú",
    "Receta",
    "Chef",
    "Cocina",
    "Hamburguesa","Taco","Empanada","Arepa","Tamales","Sushi","Ceviche","Puré","Enchilada","Guiso",
    "Tarta","Panqueque","Cereal","Mermelada","Miel","Yuca","Quinoa","Avena","Nuez","Almendra"
  ],
  Naturaleza: [
    "Árbol",
    "Río",
    "Montaña",
    "Playa",
    "Bosque",
    "Viento",
    "Lluvia",
    "Sol",
    "Nube",
    "Nieve",
    "Lago",
    "Mar",
    "Desierto",
    "Valle",
    "Colina",
    "Cueva",
    "Cascada",
    "Arena",
    "Tierra",
    "Barro",
    "Piedra",
    "Roca",
    "Flor",
    "Hoja",
    "Raíz",
    "Semilla",
    "Hierba",
    "Pasto",
    "Selva",
    "Jungla",
    "Fauna",
    "Flora",
    "Clima",
    "Tormenta",
    "Trueno",
    "Relámpago",
    "Granizo",
    "Neblina",
    "Aurora",
    "Horizonte",
    "Estrella",
    "Luna",
    "Planeta",
    "Océano",
    "Marea",
    "Ola",
    "Coral",
    "Fósil",
    "Volcán",
    "Lava",
    "Terremoto",
    "Eclipse",
    "Arcoíris",
    "Polen",
    "Estación",
    "Primavera",
    "Verano",
    "Otoño",
    "Invierno",
    "Pradera","Sabana","Humedal","Arroyo","Glaciar","Acantilado","Cañón","Isla","Península","Delta",
    "Constelación","Rocío","Musgo","Helecho","Cactus","Liana","Matorral","Laguna","Géiser","Manglar"
  ],
  Tecnología: [
    "Computadora",
    "Celular",
    "Internet",
    "Robot",
    "Servidor",
    "Base de datos",
    "Algoritmo",
    "Red",
    "Código",
    "Pantalla",
    "Teclado",
    "Ratón",
    "Trackpad",
    "Monitor",
    "CPU",
    "GPU",
    "Memoria",
    "Disco",
    "SSD",
    "Nube",
    "API",
    "Backend",
    "Frontend",
    "Framework",
    "Librería",
    "Compilador",
    "Intérprete",
    "Protocolo",
    "HTTP",
    "HTTPS",
    "TCP",
    "UDP",
    "Wi-Fi",
    "Bluetooth",
    "Router",
    "Switch",
    "Firewall",
    "Token",
    "Encriptación",
    "Hash",
    "Batería",
    "Cargador",
    "Cámara",
    "Sensor",
    "IoT",
    "Dron",
    "Impresora",
    "3D",
    "Realidad virtual",
    "Realidad aumentada",
    "Blockchain",
    "Criptomoneda",
    "Smartwatch",
    "Tablet",
    "Sistema operativo",
    "Linux",
    "Windows",
    "macOS",
    "Android",
    "iOS",
    "Git",
    "Repositorio",
    "IDE",
    "Editor",
    "Laptop","Consola","Joystick","Auriculares","Antena","Navegador","Correo electrónico","Servidor web","API REST","JSON",
    "BLE","NFC","Código QR","Código de barras","Virtualización","Contenedor","Microservicio","CI/CD","DNS","Cache"
  ],
  Animales: [
    "Perro","Gato","Pájaro","Pez","Caballo","Tortuga","Conejo","Vaca","Oveja","Pollito",
    "León","Tigre","Mono","Delfín","Elefante","Zorro","Mapache","Panda","Koala","Canguro",
    "Pingüino","Foca","Ballena","Pulpo","Loro","Águila","Búho","Camello","Rinoceronte","Jirafa"
  ],
  Escuela: [
    "Maestro","Cuaderno","Mochila","Lápiz","Borrador","Regla","Recreo","Tarea","Clase","Pizarra",
    "Libros","Examen","Uniforme","Receso","Escritorio","Profesor","Directora","Laboratorio","Biblioteca","Patio",
    "Salón","Pizarrón","Tiza","Marcadores","Sacapuntas","Pegamento","Tijeras","Mapa","Globo terráqueo","Horario"
  ],
  Deportes: [
    "Fútbol","Baloncesto","Tenis","Natación","Correr","Béisbol","Vóley","Ciclismo","Boxeo","Golf",
    "Esgrima","Rugby","Handball","Bádminton","Ping pong","Esquí","Snowboard","Patinaje","Escalada","Triatlón",
    "Maratón","Halterofilia","Remo","Clavados","Tiro con arco","Motocross","Parapente","Windsurf","Kitesurf","Parkour"
  ],
  Ropa: [
    "Camisa","Pantalón","Zapatos","Gorra","Chaqueta","Vestido","Medias","Cinturón","Bufanda","Guantes",
    "Chaleco","Corbata","Pijama","Bata","Impermeable","Overol","Poncho","Traje de baño","Zapatillas","Pantuflas",
    "Aretes","Collar","Pulsera","Reloj","Lentes","Moño","Tirantes","Botas","Sandalias","Sudadera"
  ],
  Colores: [
    "Rojo","Azul","Verde","Amarillo","Negro","Blanco","Rosa","Morado","Naranja","Café",
    "Lavanda","Beige","Esmeralda","Oliva","Mostaza","Magenta","Cian","Coral","Marino","Aguamarina",
    "Violeta","Púrpura","Fucsia","Crema","Chocolate","Pizarra","Perla","Gris claro","Gris oscuro","Azul cielo"
  ],
  Familia: [
    "Mamá","Papá","Hermano","Hermana","Abuela","Abuelo","Tío","Tía","Primo","Prima",
    "Sobrino","Sobrina","Suegra","Suegro","Yerno","Nuera","Cuñado","Cuñada","Padrino","Madrina",
    "Nieto","Nieta","Esposo","Esposa","Pareja","Hijo","Hija","Hermana mayor","Hermano menor","Gemelos"
  ],
  Juguetes: [
    "Muñeca","Pelota","Carrito","Rompecabezas","Lego","Yo-yo","Cometa","Tren","Osito","Bloques",
    "Triciclo","Patines","Balero","Pistola de agua","Dominó","Trompo","Aros","Plastilina","Muñeco de acción","Rompecabezas 3D",
    "Auto a control","Tetera de juguete","Cocina de juguete","Pista de autos","Peluche grande","Casa de muñecas","Bloques magnéticos","Títeres","Barquito","Ajedrez"
  ],
  Instrumentos: [
    "Guitarra","Piano","Batería","Flauta","Violín","Trompeta","Saxofón","Maracas","Triángulo","Arpa",
    "Clarinete","Oboe","Fagot","Viola","Cello","Contrabajo","Banjo","Ukelele","Pandero","Bongó",
    "Cajón","Tambor","Xilófono","Órgano","Armónica","Laúd","Trombón","Tuba","Gaita","Castañuelas"
  ],
  Frutas: [
    "Manzana","Banana","Naranja","Uva","Fresa","Mango","Piña","Sandía","Melón","Pera",
    "Kiwi","Papaya","Guayaba","Durazno","Ciruela","Arándano","Frambuesa","Cereza","Granada","Mandarina",
    "Tamarindo","Maracuyá","Higo","Lima","Lichi","Nectarina","Grosella","Pitaya","Carambola","Pomelo"
  ],
  Verduras: [
    "Zanahoria","Lechuga","Tomate","Papa","Cebolla","Pepino","Brócoli","Espinaca","Choclo","Ajo",
    "Calabaza","Berenjena","Remolacha","Rábano","Coliflor","Repollo","Alcachofa","Espárrago","Apio","Puerro",
    "Nabo","Camote","Batata","Pimiento","Chile","Acelga","Hongo","Champiñón","Pepinillo","Col"
  ],
  Bebidas: [
    "Agua","Leche","Jugo","Refresco","Café","Té","Chocolate","Limonada","Batido","Malteada",
    "Agua con gas","Té helado","Latte","Capuchino","Espresso","Batido de fresa","Licuado","Cóctel sin alcohol","Gaseosa","Jugo de naranja",
    "Jugo de manzana","Mate","Agua de coco","Smoothie","Leche de almendra","Chocolate caliente","Malta","Atole","Agua fresca","Horchata"
  ],
  Electrodomésticos: [
    "Refrigerador","Microondas","Horno","Licuadora","Tostadora","Lavadora","Secadora","Plancha","Ventilador","Aspiradora",
    "Lavavajillas","Freidora de aire","Horno eléctrico","Procesador","Purificador","Calentador","Deshumidificador","Humidificador","Secadora de cabello","Rizador",
    "Plancha de cabello","Dispensador de agua","Cafetera de cápsulas","Robot aspirador","Campana extractora","Parrilla eléctrica","Sandwichera","Hervidor","Cortadora de pelo","Proyector"
  ],
  Ciudad: [
    "Plaza","Parque","Museo","Banco","Escuela","Hospital","Mercado","Cine","Teatro","Restaurante",
    "Semáforo","Puente peatonal","Rotonda","Avenida","Callejón","Estacionamiento","Terminal","Kiosco","Fuente","Monumento",
    "Ayuntamiento","Correos","Farmacia","Panadería","Supermercado","Taller","Gasolinera","Metrobús","Metro","Tren urbano"
  ],
  Oficios: [
    "Doctor","Bombero","Maestro","Carpintero","Panadero","Cocinero","Policía","Ingeniero","Mecánico","Jardinero",
    "Fotógrafo","Diseñador","Programador","Enfermera","Veterinario","Electricista","Plomero","Pintor","Albañil","Soldador",
    "Barbero","Estilista","Contador","Abogado","Arquitecto","Piloto","Azafata","Conductor","Florista","Vendedor"
  ],
  Cuerpo: [
    "Cabeza","Mano","Pie","Brazo","Pierna","Ojo","Nariz","Boca","Oreja","Dedo",
    "Rodilla","Codo","Hombro","Cuello","Espalda","Cadera","Tobillo","Talón","Uña","Pestañas",
    "Ceja","Diente","Lengua","Palma","Muñeca","Nudillo","Pupila","Pulmón","Corazón","Estómago"
  ]
};

// Utilidades
function $(id) {
  return document.getElementById(id);
}

function choice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffle(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Pantallas
function showScreen(name) {
  ["setup", "reveal", "play", "vote", "results"].forEach((n) => {
    const el = $(`screen-${n}`);
    if (!el) return;
    el.classList.toggle("active", n === name);
  });
  state.phase = name;
}

// Modal simple
function showModal(message) {
  const overlay = $("modal");
  const text = $("modal-text");
  const ok = $("modal-ok");
  const cancel = $("modal-cancel");
  if (!overlay || !text || !ok) {
    // eslint-disable-next-line no-alert
    alert(typeof message === "string" ? message : (message?.message || ""));
    return;
  }
  const opts = typeof message === "object" ? message : {};
  const titleEl = $("modal-title");
  if (titleEl) titleEl.textContent = opts.title || "Aviso";
  text.textContent = typeof message === "string" ? message : (opts.message || "");
  ok.textContent = opts.confirmText || "Aceptar";
  if (opts.cancelText) {
    cancel.style.display = "inline-block";
    cancel.textContent = opts.cancelText;
  } else {
    cancel.style.display = "none";
  }
  overlay.classList.add("open");
  const close = () => {
    overlay.classList.remove("open");
    ok.removeEventListener("click", onOk);
    cancel.removeEventListener("click", onCancel);
  };
  const onOk = () => { try { opts.onConfirm && opts.onConfirm(); } finally { close(); } };
  const onCancel = () => { try { opts.onCancel && opts.onCancel(); } finally { close(); } };
  ok.addEventListener("click", onOk);
  cancel.addEventListener("click", onCancel);
}

function showConfirm(message, opts = {}) {
  showModal({ message, title: opts.title || "Confirmar", confirmText: opts.confirmText || "Aceptar", cancelText: opts.cancelText || "Cancelar", onConfirm: opts.onConfirm, onCancel: opts.onCancel });
}

// Configuración: inputs dinámicos
function createPlayerRow(index, value = "") {
  const row = document.createElement("div");
  row.className = "player-row";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = `Jugador ${index + 1}`;
  input.value = value;
  input.className = "input";
  input.dataset.index = String(index);

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "btn btn-danger";
  removeBtn.textContent = "Eliminar";
  removeBtn.addEventListener("click", () => {
    row.remove();
    renumberPlayerRows();
  });

  row.appendChild(input);
  row.appendChild(removeBtn);
  return row;
}

function renumberPlayerRows() {
  const container = $("players-container");
  const rows = Array.from(container.querySelectorAll(".player-row"));
  rows.forEach((row, idx) => {
    const input = row.querySelector("input");
    if (input) {
      input.placeholder = `Jugador ${idx + 1}`;
      input.dataset.index = String(idx);
    }
  });
}

function addPlayerInput(value = "") {
  const container = $("players-container");
  const index = container.querySelectorAll(".player-row").length;
  container.appendChild(createPlayerRow(index, value));
}

function collectPlayers() {
  const container = $("players-container");
  const inputs = Array.from(container.querySelectorAll("input"));
  const names = inputs
    .map((i) => i.value.trim())
    .filter((n) => n.length > 0);
  return names;
}

function validatePlayers(names) {
  if (names.length < 3) {
    showModal("Se requieren al menos 3 jugadores.");
    return false;
  }
  const set = new Set(names.map((n) => n.toLowerCase()));
  if (set.size !== names.length) {
    showModal("Hay nombres duplicados. Usa nombres únicos.");
    return false;
  }
  return true;
}

// Lógica de juego
function startGame() {
  const names = collectPlayers();
  if (!validatePlayers(names)) return;

  state.players = names;
  state.theme = $("select-theme").value;
  state.impostorIndex = Math.floor(Math.random() * state.players.length);
  const pool = THEME_WORDS[state.theme] || [];
  state.secretWord = choice(pool);
  state.revealIndex = 0;
  state.turnIndex = 0;
  state.round = 1;
  state.chatLog = [];
  state.activePlayerIndices = state.players.map((_, i) => i);
  state.hintsThisRound = 0;
  state.waitingNextRound = false;
  state.votes = {};
  state.voteOrderIndex = 0;
  state.voteTie = false;

  renderReveal();
  showScreen("reveal");
}

// Revelar roles
function renderReveal() {
  $("reveal-counter").textContent = `${state.revealIndex} / ${state.players.length}`;
  $("reveal-player-name").textContent = state.players[state.revealIndex] || "-";
  $("reveal-content").textContent = "Oculto";
  $("btn-hide-next").disabled = true;
}

function showCurrentRole() {
  const isImpostor = state.revealIndex === state.impostorIndex;
  $("reveal-content").textContent = isImpostor ? "IMPOSTOR" : state.secretWord;
  $("btn-hide-next").disabled = false;
}

function hideAndNextReveal() {
  state.revealIndex += 1;
  if (state.revealIndex >= state.players.length) {
    // Pasar a jugar
    renderPlay();
    showScreen("play");
    return;
  }
  $("reveal-counter").textContent = `${state.revealIndex} / ${state.players.length}`;
  $("reveal-player-name").textContent = state.players[state.revealIndex];
  $("reveal-content").textContent = "Oculto";
  $("btn-hide-next").disabled = true;
}

// Juego en curso
function renderPlay() {
  $("play-theme").textContent = state.theme;
  $("round-number").textContent = String(state.round);
  $("turn-player").textContent = getActivePlayers()[state.turnIndex]?.name || "-";
  renderChat();
  renderPlayControls();
}

function renderChat() {
  const log = $("chat-log");
  log.innerHTML = "";
  state.chatLog.forEach((item) => {
    const li = document.createElement("li");
    li.className = "chat-item";
    li.innerHTML = `<span class="author">${item.player}</span> <span class="text">${escapeHtml(item.text)}</span> <span class="muted">(Ronda ${item.round})</span>`;
    log.appendChild(li);
  });
  // Scroll al final
  log.scrollTop = log.scrollHeight;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function submitHint(e) {
  e.preventDefault();
  const input = $("hint-input");
  const text = input.value.trim();
  if (!text) return;

  const current = getActivePlayers()[state.turnIndex];
  const player = current?.name || "-";
  state.chatLog.push({ player, text, round: state.round });
  input.value = "";
  state.hintsThisRound += 1;
  const activeCount = state.activePlayerIndices.length;
  if (state.hintsThisRound >= activeCount) {
    // Ronda completa
    state.waitingNextRound = true;
    renderPlayControls();
  } else {
    nextTurn();
  }
}

function nextTurn() {
  const activeCount = state.activePlayerIndices.length;
  state.turnIndex = (state.turnIndex + 1) % activeCount;
  $("turn-player").textContent = getActivePlayers()[state.turnIndex]?.name || "-";
  renderChat();
}

function newRound() {
  if (!state.waitingNextRound) return;
  if (state.round >= state.maxRounds) return;
  state.round += 1;
  state.hintsThisRound = 0;
  state.waitingNextRound = false;
  $("round-number").textContent = String(state.round);
  enableHintForm(true);
  renderPlayControls();
}

function revealResults() {
  $("result-word").textContent = state.secretWord || "-";
  $("result-impostor").textContent = state.players[state.impostorIndex] || "-";
  showScreen("results");
}

function resetToSetup() {
  // Limpiar y volver a configuración
  state.players = [];
  state.impostorIndex = null;
  state.secretWord = null;
  state.phase = "setup";
  state.revealIndex = 0;
  state.turnIndex = 0;
  state.round = 1;
  state.chatLog = [];

  const container = $("players-container");
  container.innerHTML = "";
  addPlayerInput();
  addPlayerInput();
  showScreen("setup");
}

function playAgain() {
  // Mantener mismos jugadores/tema, cambiar impostor y palabra
  state.impostorIndex = Math.floor(Math.random() * state.players.length);
  const pool = THEME_WORDS[state.theme] || [];
  state.secretWord = choice(pool);
  state.revealIndex = 0;
  state.turnIndex = 0;
  state.round = 1;
  state.chatLog = [];
  renderReveal();
  showScreen("reveal");
}

// Helpers de jugadores activos
function getActivePlayers() {
  return state.activePlayerIndices.map((idx) => ({ index: idx, name: state.players[idx] }));
}

function renderPlayControls() {
  const btnNewRound = $("btn-new-round");
  const btnGoVote = $("btn-go-vote");
  const activeCount = state.activePlayerIndices.length;

  if (state.waitingNextRound) {
    enableHintForm(false);
    if (state.round < state.maxRounds) {
      btnNewRound.disabled = false;
      btnNewRound.textContent = `Comenzar ronda ${state.round + 1}`;
      btnGoVote.style.display = "none";
    } else {
      btnNewRound.disabled = true;
      btnGoVote.style.display = "inline-block";
    }
  } else {
    btnNewRound.disabled = true;
    btnNewRound.textContent = "Nueva ronda";
    btnGoVote.style.display = "none";
    enableHintForm(true);
  }

  // Actualizar turno por si cambió número de activos
  state.turnIndex = state.turnIndex % Math.max(1, activeCount);
}

function enableHintForm(enabled) {
  const input = $("hint-input");
  const formBtn = document.querySelector("#hint-form button[type=submit]");
  input.disabled = !enabled;
  if (formBtn) formBtn.disabled = !enabled;
}

// Votación
function startVoting() {
  state.votes = {};
  state.voteOrderIndex = 0;
  state.voteTie = false;
  renderVote();
  showScreen("vote");
}

function renderVote() {
  const active = getActivePlayers();
  const total = active.length;
  const voter = active[state.voteOrderIndex];
  $("vote-counter").textContent = `${state.voteOrderIndex} / ${total}`;
  $("vote-player-name").textContent = voter?.name || "-";
  const container = $("candidates");
  container.innerHTML = "";

  if (!voter) return;

  active.forEach((p) => {
    if (p.index === voter.index) return; // no vota por sí mismo
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn";
    btn.textContent = p.name;
    btn.addEventListener("click", () => submitVote(p.index));
    container.appendChild(btn);
  });

  const revoteBtn = $("btn-start-revote");
  revoteBtn.style.display = state.voteTie ? "inline-block" : "none";
}

function submitVote(candidateOriginalIndex) {
  const voterOriginalIndex = getActivePlayers()[state.voteOrderIndex].index;
  state.votes[voterOriginalIndex] = candidateOriginalIndex;
  state.voteOrderIndex += 1;

  if (state.voteOrderIndex >= state.activePlayerIndices.length) {
    tallyVotes();
  } else {
    renderVote();
  }
}

function tallyVotes() {
  const counts = new Map(); // candidateIndex -> count
  Object.values(state.votes).forEach((candIdx) => {
    counts.set(candIdx, (counts.get(candIdx) || 0) + 1);
  });

  // Encontrar máximo
  let max = 0;
  counts.forEach((c) => { if (c > max) max = c; });
  const top = Array.from(counts.entries()).filter(([, c]) => c === max).map(([idx]) => idx);

  if (top.length !== 1 || max === 0) {
    // Empate o nadie votó: reiniciar votación
    state.voteTie = true;
    state.votes = {};
    state.voteOrderIndex = 0;
    renderVote();
    return;
  }

  const eliminatedOriginalIndex = top[0];
  if (eliminatedOriginalIndex === state.impostorIndex) {
    // Impostor atrapado
    revealResults();
    return;
  }

  // Eliminar jugador y repetir votación con los restantes
  state.activePlayerIndices = state.activePlayerIndices.filter((i) => i !== eliminatedOriginalIndex);
  // Ajustar turnIndex por si quedó fuera de rango para futuras rondas
  state.turnIndex = 0;
  state.votes = {};
  state.voteOrderIndex = 0;
  state.voteTie = false;

  // Si solo queda un jugador o dos y no es impostor, continuar votando hasta encontrar impostor
  if (state.activePlayerIndices.length <= 1) {
    // Seguridad: si no quedara suficiente gente, terminar mostrando resultados reales
    revealResults();
    return;
  }

  renderVote();
}

// Inicialización UI y eventos
function init() {
  // Inputs iniciales
  addPlayerInput();
  addPlayerInput();

  $("btn-add-player").addEventListener("click", () => addPlayerInput());
  $("btn-start").addEventListener("click", startGame);

  $("btn-show").addEventListener("click", showCurrentRole);
  $("btn-hide-next").addEventListener("click", hideAndNextReveal);

  $("hint-form").addEventListener("submit", submitHint);
  $("btn-new-round").addEventListener("click", () => showConfirm("¿Comenzar la siguiente ronda?", { onConfirm: newRound }));
  $("btn-reveal-result").addEventListener("click", () => showConfirm("¿Revelar la palabra e impostor?", { onConfirm: revealResults }));
  $("btn-go-vote").addEventListener("click", () => showConfirm("¿Ir a votación ahora?", { onConfirm: startVoting }));

  $("btn-start-revote").addEventListener("click", () => {
    state.voteTie = false;
    state.votes = {};
    state.voteOrderIndex = 0;
    renderVote();
  });

  $("btn-play-again").addEventListener("click", playAgain);
  $("btn-back-setup").addEventListener("click", resetToSetup);
}

document.addEventListener("DOMContentLoaded", init);


