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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const loginContainer = document.getElementById('login-container');
const mainContainer = document.getElementById('main-container');
const medicInfo = document.getElementById('medic-info');
const patientsList = document.getElementById('patients-list');
const patientRecords = document.getElementById('patient-records');
const loginError = document.getElementById('login-error');

// --- Autenticación ---
document.getElementById('google-signin').onclick = async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  // Configuramos el proveedor para que solicite el perfil y el email
  provider.addScope('profile');
  provider.addScope('email');
  try {
    loginError.textContent = "Iniciando sesión...";
    await auth.signInWithRedirect(provider);
  } catch (e) {
    console.error("Error al iniciar sesión:", e);
    loginError.textContent = "Error al iniciar sesión. Por favor, intenta de nuevo.";
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

// Mejoramos el manejo del estado de autenticación
auth.onAuthStateChanged(async (user) => {
  console.log("Estado de autenticación cambiado:", user ? "Usuario autenticado" : "Usuario no autenticado");
  if (user) {
    try {
      // Aseguramos que el perfil esté guardado
      await saveMedicProfile(user);
      // Actualizamos la UI
      loginContainer.classList.add('hidden');
      mainContainer.classList.remove('hidden');
      medicInfo.textContent = `Dr. ${user.displayName || user.email}`;
      // Cargamos los pacientes
      await loadPatients();
    } catch (error) {
      console.error("Error al actualizar la UI después del login:", error);
      loginError.textContent = "Error al cargar los datos. Por favor, recarga la página.";
    }
  } else {
    // Usuario no autenticado
    loginContainer.classList.remove('hidden');
    mainContainer.classList.add('hidden');
    medicInfo.textContent = '';
    patientsList.innerHTML = '';
    patientRecords.innerHTML = '';
    loginError.textContent = '';
  }
});

// Guarda el perfil del médico en Firestore
async function saveMedicProfile(user) {
  if (!user) return;
  await db.collection('medicos').doc(user.uid).set({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

// --- Carga de pacientes ---
async function loadPatients() {
  try {
    console.log("Iniciando carga de pacientes...");
    patientsList.innerHTML = 'Cargando pacientes...';
    
    // Verificamos si el usuario está autenticado
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("No hay usuario autenticado");
      patientsList.innerHTML = 'Error: No hay usuario autenticado';
      return;
    }
    console.log("Usuario autenticado:", currentUser.uid);

    // Intentamos obtener los datos
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
        
        const div = document.createElement('div');
        div.className = 'patient-card';
        div.textContent = `${data.gender === 'HOMBRE' ? '👨' : '👩'} ${data.userId || 'Sin ID'} (${data.age || 'N/A'} años)`;
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
    console.log("Cargando registros para paciente:", userId);
    patientRecords.innerHTML = `<h3>Registros de ${userId}</h3>Cargando...`;
    
    const snapshot = await db.collection('registro_medico_usuarios')
      .doc(userId)
      .collection('registros')
      .orderBy('timestamp', 'desc')
      .get();
    
    console.log("Registros obtenidos:", snapshot.size, "documentos");

    if (snapshot.empty) {
      patientRecords.innerHTML = `<h3>Registros de ${userId}</h3>No hay registros.`;
      return;
    }

    let html = `<h3>Registros de ${userId}</h3>
      <table class="record-table">
        <tr>
          <th>Fecha</th>
          <th>Sistólica</th>
          <th>Diastólica</th>
          <th>Pulso</th>
          <th>Notas</th>
        </tr>`;

    snapshot.forEach(doc => {
      try {
        const r = doc.data();
        console.log("Datos del registro:", doc.id, r);
        const date = r.timestamp && r.timestamp.toDate ? r.timestamp.toDate().toLocaleString() : 'Sin fecha';
        html += `<tr>
          <td>${date}</td>
          <td>${r.systolic || 'N/A'}</td>
          <td>${r.diastolic || 'N/A'}</td>
          <td>${r.pulse || 'N/A'}</td>
          <td>${r.notes || ''}</td>
        </tr>`;
      } catch (error) {
        console.error("Error al procesar registro:", doc.id, error);
      }
    });

    html += '</table>';
    patientRecords.innerHTML = html;
  } catch (error) {
    console.error("Error al cargar registros:", error);
    patientRecords.innerHTML = `<h3>Registros de ${userId}</h3>Error al cargar registros: ${error.message}`;
  }
}