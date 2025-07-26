# Panel Médico - Control de Tensión Arterial

## 🚀 Características

- **Dashboard moderno** con estadísticas en tiempo real
- **Gráficos interactivos** con Apache ECharts
- **Autenticación segura** con Google Sign-In y email/password
- **Interfaz responsive** para todos los dispositivos
- **Gestión de pacientes** con búsqueda y filtros
- **Visualización de datos** médicos con gráficos de evolución

## 🔧 Configuración

### Requisitos
- Navegador web moderno
- Conexión a internet
- Cuenta de Google (para login)

### Instalación
1. Clona o descarga el proyecto
2. Abre `index.html` en tu navegador
3. O ejecuta un servidor local:
   ```bash
   python3 -m http.server 8000
   ```
4. Accede a `http://localhost:8000/project/app_pa/`

## 🔐 Autenticación

### Login con Google
La aplicación soporta autenticación con Google Sign-In. Si tienes problemas:

#### Problemas Comunes y Soluciones

1. **"Popup bloqueado"**
   - **Solución**: La aplicación automáticamente cambia a redirección en localhost
   - **Alternativa**: Permite ventanas emergentes en tu navegador

2. **"Dominio no autorizado"**
   - **Causa**: El dominio no está configurado en Firebase
   - **Solución**: Contacta al administrador para agregar el dominio

3. **"Error de red"**
   - **Solución**: Verifica tu conexión a internet
   - **Alternativa**: Intenta recargar la página

4. **"Operación no permitida"**
   - **Causa**: Google Sign-In no está habilitado en Firebase
   - **Solución**: Contacta al administrador

### Login con Email/Password
- Crea una cuenta con email y contraseña
- La contraseña debe tener al menos 6 caracteres
- Usa el mismo email para futuros logins

## 🛠️ Solución de Problemas

### Test de Firebase
Si tienes problemas con la autenticación, usa el archivo de prueba:
1. Abre `test-firebase.html` en tu navegador
2. Ejecuta los tests para verificar la configuración
3. Revisa la consola del navegador para errores detallados

### Errores Comunes

#### Error: "Firebase no inicializado"
- **Solución**: Recarga la página
- **Causa**: Problema de carga de scripts

#### Error: "Auth service failed"
- **Solución**: Verifica la conexión a internet
- **Alternativa**: Usa login con email/password

#### Error: "Firestore service failed"
- **Solución**: Verifica la configuración de Firebase
- **Causa**: Problema con las reglas de Firestore

### Debugging
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Busca mensajes de error relacionados con Firebase
4. Verifica que todos los scripts se carguen correctamente

## 📊 Funcionalidades del Dashboard

### Estadísticas
- **Total de Pacientes**: Número total de pacientes registrados
- **Total de Registros**: Número total de mediciones
- **Registros de Hoy**: Mediciones realizadas hoy
- **Lecturas Críticas**: Mediciones con valores altos (sistólica > 180 o diastólica > 110)

### Gráficos
- <!-- **Distribución por Edad**: Gráfico de barras con rangos de edad -->
- **Distribución por Género**: Gráfico de tarta por género
- **Evolución del Paciente**: Gráfico de líneas con valores de tensión arterial

### Gestión de Pacientes
- **Búsqueda**: Busca pacientes por nombre o información
- **Selección**: Haz clic en un paciente para ver sus datos
- **Registros**: Visualiza el historial completo de mediciones
- **Gráficos**: Analiza la evolución de cada paciente

## 🎨 Personalización

### Colores
Los colores principales de la aplicación son:
- **Primario**: `#667eea` (Azul)
- **Secundario**: `#764ba2` (Púrpura)
- **Éxito**: `#43e97b` (Verde)
- **Error**: `#dc3545` (Rojo)

### Fuentes
- **Principal**: Roboto (Google Fonts)
- **Fallback**: Segoe UI, Arial, sans-serif

## 🔒 Seguridad

- **Autenticación obligatoria**: El dashboard solo es accesible después del login
- **Persistencia local**: La sesión se mantiene entre recargas
- **Validación de datos**: Todos los inputs son validados
- **Manejo de errores**: Mensajes claros para el usuario

## 📱 Responsive Design

La aplicación es completamente responsive y funciona en:
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

## 🚀 Versión

**v2.0 - Panel Médico Avanzado**

## 📞 Soporte

Si tienes problemas técnicos:
1. Revisa la consola del navegador
2. Usa el archivo de prueba `test-firebase.html`
3. Verifica tu conexión a internet
4. Contacta al administrador del sistema

---

**Desarrollado con ❤️ para el control médico de tensión arterial** 