// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCo35nFrt0EWg9-ppW9WlpjJMEu9YwQBBQ",
  authDomain: "blood-pressure-check-61c90.firebaseapp.com",
  projectId: "blood-pressure-check-61c90",
  storageBucket: "blood-pressure-check-61c90.firebasestorage.app",
  appId: "1:456929465106:android:562e9dc2247495d67ed9cb",
  clientId: "456929465106-og0ii4tmej68rkhukl4vomgkto6bajkh.apps.googleusercontent.com"
};

// Inicializar Firebase
try {
  console.log("Inicializando Firebase...");
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase inicializado correctamente");
} catch (error) {
  console.error("Error al inicializar Firebase:", error);
}

const auth = firebase.auth();
const db = firebase.firestore();

const loginContainer = document.getElementById('login-container');
const mainContainer = document.getElementById('main-container');
const medicInfo = document.getElementById('medic-info');
const patientsList = document.getElementById('patients-list');
const patientRecords = document.getElementById('patient-records');
const loginError = document.getElementById('login-error');

// Función para guardar el perfil del médico
async function saveMedicProfile(user) {
  if (!user) {
    console.error("No hay usuario para guardar el perfil");
    return;
  }

  try {
    console.log("Guardando perfil médico para:", user.uid);
    const medicoRef = db.collection('medicos').doc(user.uid);
    
    // Primero verificamos si ya existe el documento
    const medicoDoc = await medicoRef.get();
    
    if (!medicoDoc.exists) {
      console.log("Creando nuevo perfil médico");
      // Si no existe, creamos el perfil
      await medicoRef.set({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        role: 'medico',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log("Perfil médico creado exitosamente");
    } else {
      console.log("Actualizando perfil médico existente");
      // Si existe, solo actualizamos el último login
      await medicoRef.update({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        displayName: user.displayName || medicoDoc.data().displayName,
        photoURL: user.photoURL || medicoDoc.data().photoURL
      });
      console.log("Perfil médico actualizado exitosamente");
    }
  } catch (error) {
    console.error("Error al guardar perfil médico:", error);
    throw error;
  }
}

// --- Autenticación ---
document.getElementById('google-signin').onclick = async () => {
  console.log("Iniciando proceso de login con Google...");
  const provider = new firebase.auth.GoogleAuthProvider();
  
  try {
    console.log("Abriendo popup de Google...");
    loginError.textContent = "Conectando con Google...";
    
    // Intentamos el login
    const result = await auth.signInWithPopup(provider);
    console.log("Login exitoso, usuario:", result.user.uid);
    
    // Guardamos el perfil
    await saveMedicProfile(result.user);
    console.log("Proceso de login completado exitosamente");
    
  } catch (e) {
    console.error("Error en el proceso de login:", {
      code: e.code,
      message: e.message,
      email: e.email
    });
    
    if (e.code === 'auth/popup-closed-by-user') {
      loginError.textContent = "El inicio de sesión fue cancelado. Por favor, intenta de nuevo.";
    } else if (e.code === 'auth/popup-blocked') {
      loginError.textContent = "El navegador bloqueó la ventana de inicio de sesión. Por favor, permite las ventanas emergentes.";
    } else {
      loginError.textContent = `Error al iniciar sesión: ${e.message}`;
    }
  }
};

document.getElementById('email-signin').onclick = async () => {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;
  try {
    const result = await auth.signInWithEmailAndPassword(email, pass);
    await saveMedicProfile(result.user);
  } catch (e) {
    loginError.textContent = e.message;
  }
};

document.getElementById('email-signup').onclick = async () => {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;
  try {
    const result = await auth.createUserWithEmailAndPassword(email, pass);
    await saveMedicProfile(result.user);
  } catch (e) {
    loginError.textContent = e.message;
  }
};

document.getElementById('signout').onclick = () => auth.signOut();

// Manejamos el resultado de la redirección
auth.getRedirectResult().then(async (result) => {
  if (result.user) {
    try {
      console.log("Usuario autenticado:", result.user);
      await saveMedicProfile(result.user);
      // No necesitamos hacer nada más aquí, onAuthStateChanged se encargará
    } catch (e) {
      console.error("Error al guardar el perfil:", e);
      loginError.textContent = "Error al guardar el perfil del médico.";
    }
  }
}).catch((error) => {
  console.error("Error en la redirección:", error);
  if (error.code === 'auth/popup-closed-by-user') {
    loginError.textContent = "El inicio de sesión fue cancelado. Por favor, intenta de nuevo.";
  } else if (error.code === 'auth/popup-blocked') {
    loginError.textContent = "El navegador bloqueó la ventana de inicio de sesión. Por favor, permite las ventanas emergentes.";
  } else {
    loginError.textContent = "Error al iniciar sesión: " + error.message;
  }
});

// Escuchar cambios en el estado de autenticación
auth.onAuthStateChanged(async (user) => {
  console.log("Estado de autenticación cambiado:", user ? "Usuario autenticado" : "No hay usuario");
  
  if (user) {
    try {
      console.log("Usuario autenticado:", {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      });

      // Verificamos si el usuario es médico
      const medicoDoc = await db.collection('medicos').doc(user.uid).get();
      
      if (!medicoDoc.exists) {
        console.log("Usuario no es médico, guardando perfil...");
        await saveMedicProfile(user);
      }

      // Actualizamos la UI
      loginContainer.classList.add('hidden');
      mainContainer.classList.remove('hidden');
      updateMedicHeader(user);
      
      // Cargamos los pacientes
      await loadPatients();
      
    } catch (error) {
      console.error("Error al procesar usuario autenticado:", error);
      loginError.textContent = "Error al cargar los datos. Por favor, recarga la página.";
    }
  } else {
    console.log("Usuario no autenticado");
    loginContainer.classList.remove('hidden');
    mainContainer.classList.add('hidden');
    updateMedicHeader(null);
    patientsList.innerHTML = '';
    patientRecords.innerHTML = '';
    loginError.textContent = '';
  }
});

// Actualizar cabecera con nombre y foto del doctor(a)
function updateMedicHeader(user) {
  const medicInfo = document.getElementById('medic-info');
  const medicPhoto = document.getElementById('medic-photo');
  if (user) {
    const name = user.displayName || user.email || 'Médico';
    medicInfo.textContent = `Dr. ${name}`;
    if (user.photoURL) {
      medicPhoto.src = user.photoURL;
      medicPhoto.style.display = 'block';
      medicPhoto.alt = `Foto de ${name}`;
    } else {
      medicPhoto.style.display = 'none';
    }
  } else {
    medicInfo.textContent = '';
    medicPhoto.style.display = 'none';
  }
}

// --- Mostrar detalles del paciente seleccionado ---
function showPatientDetails(data) {
  const detailsDiv = document.getElementById('patient-details');
  if (!data) {
    detailsDiv.innerHTML = '';
    return;
  }
  // Si no hay nombre, mostrar 'Nombre no registrado'
  const name = (data.name && data.name !== data.userId) ? data.name : (data.displayName && data.displayName !== data.userId) ? data.displayName : 'Nombre no registrado';
  detailsDiv.innerHTML = `
    <div class="patient-detail-card">
      <h3>Datos del paciente</h3>
      <ul style="list-style:none;padding:0;">
        <li><b>Nombre:</b> ${name}</li>
        <li><b>Email:</b> ${data.email || 'No disponible'}</li>
        <li><b>Edad:</b> ${data.age || 'No disponible'}</li>
        <li><b>Género:</b> ${data.gender || 'No disponible'}</li>
        <li><b>ID:</b> ${data.userId || 'No disponible'}</li>
      </ul>
    </div>
  `;
}

// --- Carga de pacientes ---
async function loadPatients() {
  try {
    console.log("Iniciando carga de pacientes...");
    patientsList.innerHTML = 'Cargando pacientes...';
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("No hay usuario autenticado");
      patientsList.innerHTML = 'Error: No hay usuario autenticado';
      return;
    }
    console.log("Usuario autenticado:", currentUser.uid);
    const snapshot = await db.collection('registro_medico_usuarios').get();
    console.log("Datos obtenidos de Firestore:", snapshot.size, "documentos");
    if (snapshot.empty) {
      console.log("No se encontraron pacientes en la colección");
      patientsList.innerHTML = 'No hay pacientes registrados.';
      return;
    }
    patientsList.innerHTML = '';
    snapshot.forEach(doc => {
      try {
        const data = doc.data();
        console.log("Datos del paciente:", doc.id, data);
        // Si no hay nombre, mostrar 'Nombre no registrado'
        const name = (data.name && data.name !== data.userId) ? data.name : (data.displayName && data.displayName !== data.userId) ? data.displayName : 'Nombre no registrado';
        const div = document.createElement('div');
        div.className = 'patient-card';
        div.textContent = `${data.gender === 'HOMBRE' ? '👨' : '👩'} ${name} (${data.age || 'N/A'} años)`;
        div.onclick = () => loadPatientRecords(doc.id, data);
        patientsList.appendChild(div);
      } catch (error) {
        console.error("Error al procesar paciente:", doc.id, error);
      }
    });
  } catch (error) {
    console.error("Error al cargar pacientes:", error);
    patientsList.innerHTML = `Error al cargar pacientes: ${error.message}`;
  }
}

// --- Carga de registros de un paciente ---
async function loadPatientRecords(userId, userData) {
  try {
    showPatientDetails(userData);
    // Si no hay nombre, mostrar 'Nombre no registrado'
    const name = (userData.name && userData.name !== userId) ? userData.name : (userData.displayName && userData.displayName !== userId) ? userData.displayName : 'Nombre no registrado';
    patientRecords.innerHTML = `<h3>Registros de ${name}</h3>Cargando...`;
    const snapshot = await db.collection('registro_medico_usuarios')
      .doc(userId)
      .collection('registros')
      .orderBy('timestamp', 'desc')
      .get();
    if (snapshot.empty) {
      patientRecords.innerHTML = `<h3>Registros de ${name}</h3>No hay registros.`;
      document.getElementById('patient-chart').style.display = 'none';
      return;
    }
    let html = `<h3>Registros de ${name}</h3>
      <table class="record-table">
        <tr>
          <th>Fecha</th>
          <th>Hora</th>
          <th>Sistólica</th>
          <th>Diastólica</th>
          <th>Pulso</th>
          <th>Notas</th>
        </tr>`;
    // Para la gráfica
    const fechas = [], sistolica = [], diastolica = [], pulso = [];
    snapshot.forEach(doc => {
      try {
        const r = doc.data();
        const dateObj = r.timestamp && r.timestamp.toDate ? r.timestamp.toDate() : null;
        let fecha = 'Sin fecha', hora = '';
        if (dateObj) {
          fecha = `${dateObj.getDate()}/${dateObj.getMonth()+1}/${dateObj.getFullYear()}`;
          const horas = dateObj.getHours();
          const minutos = dateObj.getMinutes().toString().padStart(2, '0');
          const sufijo = horas < 12 ? 'a.m.' : 'p.m.';
          const horas12 = ((horas + 11) % 12 + 1);
          hora = `a las ${horas12}:${minutos} ${sufijo}`;
        }
        html += `<tr>
          <td>${fecha}</td>
          <td>${hora}</td>
          <td>${r.systolic || 'N/A'}</td>
          <td>${r.diastolic || 'N/A'}</td>
          <td>${r.pulse || 'N/A'}</td>
          <td>${r.notes || ''}</td>
        </tr>`;
        // Para la gráfica
        if (dateObj) {
          fechas.push(fecha + ' ' + hora);
          sistolica.push(r.systolic || null);
          diastolica.push(r.diastolic || null);
          pulso.push(r.pulse || null);
        }
      } catch (error) {
        console.error("Error al procesar registro:", doc.id, error);
      }
    });
    html += '</table>';
    patientRecords.innerHTML = html;
    // Llamar a la función para mostrar la gráfica
    showPatientChart(fechas, sistolica, diastolica, pulso);
  } catch (error) {
    console.error("Error al cargar registros:", error);
    patientRecords.innerHTML = `<h3>Registros de ${userData.name || userId}</h3>Error al cargar registros: ${error.message}`;
    document.getElementById('patient-chart').style.display = 'none';
  }
}

// Mostrar gráfica de evolución del paciente
function showPatientChart(fechas, sistolica, diastolica, pulso) {
  const ctx = document.getElementById('patient-chart').getContext('2d');
  document.getElementById('patient-chart').style.display = 'block';
  if (window.patientChartInstance) {
    window.patientChartInstance.destroy();
  }
  window.patientChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: fechas,
      datasets: [
        {
          label: 'Sistólica',
          data: sistolica,
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          fill: false,
          tension: 0.2
        },
        {
          label: 'Diastólica',
          data: diastolica,
          borderColor: '#43a047',
          backgroundColor: 'rgba(67, 160, 71, 0.1)',
          fill: false,
          tension: 0.2
        },
        {
          label: 'Pulso',
          data: pulso,
          borderColor: '#fbc02d',
          backgroundColor: 'rgba(251, 192, 45, 0.1)',
          fill: false,
          tension: 0.2
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Evolución del paciente' }
      },
      scales: {
        y: { beginAtZero: false }
      }
    }
  });
}