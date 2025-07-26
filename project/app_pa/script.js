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

// Elementos del DOM
const loginContainer = document.getElementById('login-container');
const mainContainer = document.getElementById('main-container');
const medicInfo = document.getElementById('medic-info');
const patientsList = document.getElementById('patients-list');
const patientRecords = document.getElementById('patient-records');
const loginError = document.getElementById('login-error');
const patientSearch = document.getElementById('patient-search');

// Variables globales
let allPatients = [];
let selectedPatientId = null;
let ageChart = null;
let genderChart = null;

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
      
      // Cargamos los pacientes y el dashboard
      await loadPatients();
      await loadDashboardStats();
      initializeCharts();
      
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
    
    // Limpiar datos del dashboard
    allPatients = [];
    selectedPatientId = null;
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
      medicPhoto.style.display = 'block';
      medicPhoto.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjUiIGZpbGw9IiM2NjdlZWEiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz4KPC9zdmc+Cjwvc3ZnPgo=';
    }
  } else {
    medicInfo.textContent = '';
    medicPhoto.style.display = 'none';
  }
}

// Cargar estadísticas del dashboard
async function loadDashboardStats() {
  try {
    const snapshot = await db.collection('registro_medico_usuarios').get();
    const patients = [];
    let totalRecords = 0;
    let todayRecords = 0;
    let criticalReadings = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const doc of snapshot.docs) {
      const patientData = doc.data();
      patients.push({ id: doc.id, ...patientData });
      
      // Contar registros del paciente
      const recordsSnapshot = await db.collection('registro_medico_usuarios')
        .doc(doc.id)
        .collection('registros')
        .get();
      
      totalRecords += recordsSnapshot.size;
      
      // Contar registros de hoy y críticos
      recordsSnapshot.forEach(recordDoc => {
        const record = recordDoc.data();
        const recordDate = record.timestamp?.toDate();
        
        if (recordDate && recordDate >= today) {
          todayRecords++;
        }
        
        // Verificar lecturas críticas (sistólica > 180 o diastólica > 110)
        if ((record.systolic && record.systolic > 180) || 
            (record.diastolic && record.diastolic > 110)) {
          criticalReadings++;
        }
      });
    }

    // Actualizar estadísticas en el DOM
    document.getElementById('total-patients').textContent = patients.length;
    document.getElementById('total-records').textContent = totalRecords;
    document.getElementById('today-records').textContent = todayRecords;
    document.getElementById('critical-readings').textContent = criticalReadings;

    // Guardar pacientes para uso posterior
    allPatients = patients;
    
    // Actualizar gráficos
    updateCharts(patients);
    
  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
  }
}

// Inicializar gráficos de ECharts
function initializeCharts() {
  // Gráfico de distribución por edad
  const ageChartElement = document.getElementById('age-chart');
  if (ageChartElement) {
    ageChart = echarts.init(ageChartElement);
  }
  
  // Gráfico de distribución por género
  const genderChartElement = document.getElementById('gender-chart');
  if (genderChartElement) {
    genderChart = echarts.init(genderChartElement);
  }
  
  // Responsive charts
  window.addEventListener('resize', () => {
    if (ageChart) ageChart.resize();
    if (genderChart) genderChart.resize();
  });
}

// Actualizar gráficos con datos
function updateCharts(patients) {
  // Preparar datos para gráfico de edad
  const ageGroups = {
    '18-30': 0,
    '31-40': 0,
    '41-50': 0,
    '51-60': 0,
    '61-70': 0,
    '70+': 0
  };
  
  // Preparar datos para gráfico de género
  const genderData = {
    'HOMBRE': 0,
    'MUJER': 0,
    'Otro': 0
  };
  
  patients.forEach(patient => {
    // Clasificar por edad
    const age = patient.age || 0;
    if (age >= 18 && age <= 30) ageGroups['18-30']++;
    else if (age >= 31 && age <= 40) ageGroups['31-40']++;
    else if (age >= 41 && age <= 50) ageGroups['41-50']++;
    else if (age >= 51 && age <= 60) ageGroups['51-60']++;
    else if (age >= 61 && age <= 70) ageGroups['61-70']++;
    else if (age > 70) ageGroups['70+']++;
    
    // Clasificar por género
    const gender = patient.gender || 'Otro';
    if (genderData.hasOwnProperty(gender)) {
      genderData[gender]++;
    } else {
      genderData['Otro']++;
    }
  });
  
  // Configurar gráfico de edad (barras)
  if (ageChart) {
    const ageOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: Object.keys(ageGroups),
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        name: 'Pacientes',
        type: 'bar',
        barWidth: '60%',
        data: Object.values(ageGroups),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' }
          ])
        }
      }]
    };
    ageChart.setOption(ageOption);
  }
  
  // Configurar gráfico de género (tarta)
  if (genderChart) {
    const genderOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [{
        name: 'Distribución',
        type: 'pie',
        radius: '50%',
        data: Object.entries(genderData).map(([key, value]) => ({
          name: key,
          value: value
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
    genderChart.setOption(genderOption);
  }
}

// --- Mostrar detalles del paciente seleccionado ---
function showPatientDetails(data) {
  const detailsDiv = document.getElementById('patient-details');
  if (!data) {
    detailsDiv.innerHTML = '';
    return;
  }
  
  const name = (data.name && data.name !== data.userId) ? data.name : 
               (data.displayName && data.displayName !== data.userId) ? data.displayName : 
               'Nombre no registrado';
               
  detailsDiv.innerHTML = `
    <div class="patient-detail-card">
      <h3><i class="fas fa-user"></i> Datos del Paciente</h3>
      <ul>
        <li><b>Nombre:</b> ${name}</li>
        <li><b>Email:</b> ${data.email || 'No disponible'}</li>
        <li><b>Edad:</b> ${data.age || 'No disponible'} años</li>
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
    patientsList.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">Cargando pacientes...</div>';
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("No hay usuario autenticado");
      patientsList.innerHTML = '<div style="text-align: center; padding: 20px; color: #dc3545;">Error: No hay usuario autenticado</div>';
      return;
    }
    
    console.log("Usuario autenticado:", currentUser.uid);
    const snapshot = await db.collection('registro_medico_usuarios').get();
    console.log("Datos obtenidos de Firestore:", snapshot.size, "documentos");
    
    if (snapshot.empty) {
      console.log("No se encontraron pacientes en la colección");
      patientsList.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">No hay pacientes registrados.</div>';
      return;
    }
    
    patientsList.innerHTML = '';
    snapshot.forEach(doc => {
      try {
        const data = doc.data();
        console.log("Datos del paciente:", doc.id, data);
        
        const name = (data.name && data.name !== data.userId) ? data.name : 
                     (data.displayName && data.displayName !== data.userId) ? data.displayName : 
                     'Nombre no registrado';
        
        const gender = data.gender || 'Otro';
        const age = data.age || 'N/A';
        const avatarText = name.charAt(0).toUpperCase();
        const genderIcon = gender === 'HOMBRE' ? '👨' : gender === 'MUJER' ? '👩' : '👤';
        
        const div = document.createElement('div');
        div.className = 'patient-card';
        div.dataset.patientId = doc.id;
        div.innerHTML = `
          <div class="patient-avatar">${avatarText}</div>
          <div class="patient-info">
            <h4>${genderIcon} ${name}</h4>
            <p>${age} años • ${gender}</p>
          </div>
        `;
        
        div.onclick = () => {
          // Remover selección anterior
          document.querySelectorAll('.patient-card').forEach(card => {
            card.classList.remove('selected');
          });
          
          // Seleccionar paciente actual
          div.classList.add('selected');
          selectedPatientId = doc.id;
          
          loadPatientRecords(doc.id, data);
        };
        
        patientsList.appendChild(div);
      } catch (error) {
        console.error("Error al procesar paciente:", doc.id, error);
      }
    });
    
    // Configurar búsqueda de pacientes
    setupPatientSearch();
    
  } catch (error) {
    console.error("Error al cargar pacientes:", error);
    patientsList.innerHTML = `<div style="text-align: center; padding: 20px; color: #dc3545;">Error al cargar pacientes: ${error.message}</div>`;
  }
}

// Configurar búsqueda de pacientes
function setupPatientSearch() {
  if (patientSearch) {
    patientSearch.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const patientCards = document.querySelectorAll('.patient-card');
      
      patientCards.forEach(card => {
        const patientName = card.querySelector('h4').textContent.toLowerCase();
        const patientInfo = card.querySelector('p').textContent.toLowerCase();
        
        if (patientName.includes(searchTerm) || patientInfo.includes(searchTerm)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }
}

// --- Carga de registros de un paciente ---
async function loadPatientRecords(userId, userData) {
  try {
    // Obtener datos actualizados del paciente desde Firestore
    const userDoc = await db.collection('registro_medico_usuarios').doc(userId).get();
    let patientData = userData;
    if (userDoc.exists) {
      patientData = userDoc.data();
      patientData.userId = userId;
    }
    
    showPatientDetails(patientData);
    
    const name = (patientData.name && patientData.name !== userId) ? patientData.name : 
                 (patientData.displayName && patientData.displayName !== userId) ? patientData.displayName : 
                 'Nombre no registrado';
    
    // Mostrar la gráfica solo si hay registros
    const snapshot = await db.collection('registro_medico_usuarios')
      .doc(userId)
      .collection('registros')
      .orderBy('timestamp', 'desc')
      .get();
    
    const chartContainer = document.getElementById('patient-chart-container');
    if (snapshot.empty) {
      if (chartContainer) chartContainer.classList.add('hidden');
      patientRecords.innerHTML = `
        <h3><i class="fas fa-chart-line"></i> Registros de ${name}</h3>
        <div style="text-align: center; padding: 20px; color: #666;">No hay registros disponibles.</div>
      `;
      return;
    } else {
      if (chartContainer) chartContainer.classList.remove('hidden');
    }
    
    let html = `
      <h3><i class="fas fa-chart-line"></i> Registros de ${name}</h3>
      <table class="record-table">
        <tr>
          <th>Fecha</th>
          <th>Hora</th>
          <th>Sistólica</th>
          <th>Diastólica</th>
          <th>Pulso</th>
          <th>Notas</th>
        </tr>
    `;
    
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
          hora = `${horas12}:${minutos} ${sufijo}`;
        }
        
        // Determinar si la lectura es crítica
        const isCritical = (r.systolic && r.systolic > 180) || (r.diastolic && r.diastolic > 110);
        const criticalClass = isCritical ? 'style="color: #dc3545; font-weight: bold;"' : '';
        
        html += `
          <tr>
            <td>${fecha}</td>
            <td>${hora}</td>
            <td ${criticalClass}>${r.systolic || 'N/A'}</td>
            <td ${criticalClass}>${r.diastolic || 'N/A'}</td>
            <td>${r.pulse || 'N/A'}</td>
            <td>${r.notes || ''}</td>
          </tr>
        `;
        
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
    
    // Mostrar gráfica del paciente
    showPatientChart(fechas, sistolica, diastolica, pulso);
    
  } catch (error) {
    console.error("Error al cargar registros:", error);
    patientRecords.innerHTML = `
      <h3>Registros de ${userData.name || userId}</h3>
      <div style="text-align: center; padding: 20px; color: #dc3545;">Error al cargar registros: ${error.message}</div>
    `;
    const chartContainer = document.getElementById('patient-chart-container');
    if (chartContainer) chartContainer.classList.add('hidden');
  }
}

// --- Mostrar gráfica de evolución del paciente ---
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
          borderColor: '#667eea', 
          backgroundColor: 'rgba(102, 126, 234, 0.1)', 
          fill: false, 
          tension: 0.2,
          borderWidth: 3
        },
        { 
          label: 'Diastólica', 
          data: diastolica, 
          borderColor: '#764ba2', 
          backgroundColor: 'rgba(118, 75, 162, 0.1)', 
          fill: false, 
          tension: 0.2,
          borderWidth: 3
        },
        { 
          label: 'Pulso', 
          data: pulso, 
          borderColor: '#f093fb', 
          backgroundColor: 'rgba(240, 147, 251, 0.1)', 
          fill: false, 
          tension: 0.2,
          borderWidth: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        title: { 
          display: true, 
          text: 'Evolución del Paciente',
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      },
      scales: { 
        y: { 
          beginAtZero: false,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      elements: {
        point: {
          radius: 6,
          hoverRadius: 8
        }
      }
    }
  });
}