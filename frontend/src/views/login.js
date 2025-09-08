// src/views/login.js
import { login } from "../services/authService.js";
import { navigateTo } from "../router.js";

export default function setupLogin() {
  const form = document.getElementById("login-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();

    try {
      console.log("Intentando iniciar sesión con:", { email });
      const res = await login(email, password);
      console.log("Respuesta del servidor:", res);

      // Guardamos token y usuario
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      alert(`Bienvenido, ${res.user.firstName}`);
      navigateTo("dashboard"); // 👈 o la vista a la que quieras redirigir
    } catch (err) {
      console.error("Login error:", err);
      alert("Credenciales inválidas. Intenta nuevamente. " + err.message);
    }
  });

  // Navegar a signup
  document.getElementById("go-signup").addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("signup");
  });

  // Navegar a recovery
  document.getElementById("go-recovery").addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("recovery");
  });

  // Botón de login con Google
  document.querySelector(".google-login").addEventListener("click", () => {
    // URL específica para Google Auth
    const googleAuthUrl = "http://localhost:3001/api/auth/google";

    // Guardar timestamp para verificar autenticación reciente
    localStorage.setItem("google_auth_attempt", Date.now().toString());

    // Crear id único para esta sesión de auth
    const authSessionId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem("auth_session_id", authSessionId);

    // Abrir ventana de autenticación con tamaño específico
    const authWindow = window.open(
      googleAuthUrl,
      "googleAuth",
      "width=600,height=700,top=100,left=100"
    );

    // Configurar listener para mensajes de la ventana emergente
    const messageListener = function (event) {
      // Verificar que el mensaje sea de autenticación exitosa
      if (event.data && event.data.type === "AUTH_SUCCESS") {
        // Limpiar listener para evitar duplicados
        window.removeEventListener("message", messageListener);

        // Limpiar cualquier intervalo de verificación que pueda estar corriendo
        if (window.googleAuthCheckInterval) {
          clearInterval(window.googleAuthCheckInterval);
          delete window.googleAuthCheckInterval;
        }

        // Procesar el usuario autenticado
        const user = event.data.user;
        if (user) {
          console.log("Autenticación con Google exitosa a través de mensaje");

          // Esperar un momento antes de mostrar alerta y redirigir
          setTimeout(() => {
            alert(`¡Bienvenido, ${user.firstName}!`);

            // Usar setTimeout para asegurar que la alerta sea mostrada antes de la redirección
            setTimeout(() => {
              console.log(
                "Redirigiendo al dashboard después de autenticación exitosa"
              );
              // Redirigir directamente al dashboard
              navigateTo("dashboard");
            }, 300);
          }, 200);
        }
      }
    };

    // Registrar el listener de mensajes
    window.addEventListener("message", messageListener);

    // Verificador alternativo que comprueba periódicamente si hay un nuevo token
    const checkAuth = setInterval(() => {
      const authAttemptTime = parseInt(
        localStorage.getItem("google_auth_attempt") || "0"
      );
      const currentTime = Date.now();
      const token = localStorage.getItem("token");

      // Si hay un token nuevo dentro de la ventana de tiempo relevante
      if (token && currentTime - authAttemptTime < 30000) {
        clearInterval(checkAuth);

        // Guardar la referencia global para poder cancelarla desde el listener de mensajes
        window.googleAuthCheckInterval = checkAuth;

        // Limpiar el listener de mensajes
        window.removeEventListener("message", messageListener);

        try {
          const user = JSON.parse(localStorage.getItem("user"));
          console.log(
            "Autenticación con Google exitosa a través de localStorage"
          );

          // Usar setTimeout para asegurar un comportamiento más predecible
          setTimeout(() => {
            alert(`¡Bienvenido, ${user.firstName}!`);

            // Esperar a que se muestre la alerta antes de redirigir
            setTimeout(() => {
              console.log(
                "Redirigiendo al dashboard después de detectar token en localStorage"
              );
              // Usar location.href para asegurar una carga completa
              window.location.href = "/";

              // Una vez cargada la página principal, navegar al dashboard
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent("navigate-to-dashboard"));
              }, 500);
            }, 300);
          }, 200);
        } catch (e) {
          console.error("Error al procesar datos de usuario:", e);
        }
      }

      // Verificar si la ventana se cerró sin errores COOP
      try {
        if (authWindow && authWindow.closed) {
          // Intentar una última verificación del token
          const newToken = localStorage.getItem("token");
          if (newToken && newToken !== token) {
            try {
              const user = JSON.parse(localStorage.getItem("user"));
              console.log("Autenticación detectada después de cerrar ventana");
              alert(`Bienvenido, ${user.firstName}!`);
              navigateTo("dashboard");
            } catch (e) {
              console.error("Error al procesar datos de usuario:", e);
            }
          }
          clearInterval(checkAuth);
        }
      } catch (e) {
        // Ignorar errores COOP, seguir con el intervalo
        console.log("No se puede acceder a la ventana (política COOP)");
      }
    }, 1000);

    // Limitar el tiempo de verificación a 30 segundos
    setTimeout(() => {
      clearInterval(checkAuth);
      window.removeEventListener("message", messageListener);
    }, 30000);
  });
}
