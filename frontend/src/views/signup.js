// src/views/signup.js
import { signup } from "../services/authService.js";
import { navigateTo } from "../router.js";

export default function setupSignup() {
  const form = document.getElementById("signup-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = e.target.firstName.value.trim();
    const lastName = e.target.lastName.value.trim();
    const email = e.target.email.value.trim();
    const age = e.target.age.value ? parseInt(e.target.age.value.trim()) : null;
    const password = e.target.password.value.trim();
    const confirmPassword = e.target.confirmPassword.value.trim();

    // Validación local antes de enviar al servidor
    if (password !== confirmPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    try {
      const userData = {
        firstName,
        lastName,
        email,
        password,
      };

      // Solo añadir age si fue proporcionado
      if (age !== null) {
        userData.age = age;
      }

      console.log("Enviando datos de registro:", userData);
      const res = await signup(userData);
      console.log("Respuesta del servidor:", res);

      // Guardamos token y usuario
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      alert(
        `Welcome, ${res.user.firstName}! Your account has been created successfully.`
      );
      navigateTo("dashboard"); // Redirigir al dashboard después del registro exitoso
    } catch (err) {
      console.error("Signup error:", err);

      // Manejar error específico para email ya registrado
      if (err.message && err.message.includes("already registered")) {
        alert(
          "This email is already registered. Please use a different email or login to your existing account."
        );
      } else {
        alert(
          "Error creating account. Please check your information and try again. " +
            err.message
        );
      }
    }
  });

  // Navegar a login
  document.getElementById("go-login").addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("login");
  });

  // Botón de signup con Google
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

        // Procesar el usuario autenticado
        const user = event.data.user;
        if (user) {
          console.log("Autenticación con Google exitosa a través de mensaje");
          alert(`Bienvenido, ${user.firstName}!`);
          navigateTo("dashboard");
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

        // Limpiar el listener de mensajes
        window.removeEventListener("message", messageListener);

        try {
          const user = JSON.parse(localStorage.getItem("user"));
          console.log(
            "Autenticación con Google exitosa a través de localStorage"
          );
          alert(`Bienvenido, ${user.firstName}!`);
          navigateTo("dashboard");
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
