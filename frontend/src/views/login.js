// src/views/login.js
import { login } from "../services/authService.js";
import { navigateTo } from "../router.js";
import { getCurrentUser } from "../services/authService.js";
import { initiateGoogleAuth } from "../utils/safe-google-auth.js";

export default function setupLogin() {
  // Referencias a elementos del DOM
  const form = document.getElementById("login-form");
  const submitButton = document.getElementById("login-button");
  const buttonText = document.getElementById("button-text");
  const spinner = document.getElementById("spinner");
  const toastNotification = document.getElementById("toast-notification");
  const toastMessage = document.getElementById("toast-message");

  // Referencias a campos de entrada
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  // Referencias a contenedores de errores
  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");

  // Objeto para almacenar el estado de validación de cada campo
  const validationState = {
    email: false,
    password: false,
  };

  // Verificar mensaje de logout
  const logoutMessage = localStorage.getItem("logout_message");
  if (logoutMessage) {
    showToast(logoutMessage);
    localStorage.removeItem("logout_message");
  }

  // Verificar si ya hay una sesión activa y redirigir si es necesario
  const checkExistingSession = () => {
    const token = localStorage.getItem("token");
    if (token) {
      // Verificar si el token es válido
      try {
        const tokenData = JSON.parse(atob(token.split(".")[1]));
        const expirationTime = tokenData.exp * 1000; // Convertir a milisegundos

        if (Date.now() < expirationTime) {
          // El token es válido, redirigir al dashboard
          navigateTo("dashboard");
          return true;
        } else {
          // El token ha expirado, limpiarlo
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          showToast(
            "Tu sesión ha expirado. Por favor, inicia sesión de nuevo.",
            true
          );
        }
      } catch (e) {
        console.error("Error al verificar el token:", e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    return false;
  };

  // Verificar sesión al cargar
  if (checkExistingSession()) {
    return;
  }

  // Función para mostrar toast de notificación
  function showToast(message, isError = false) {
    toastMessage.textContent = message;
    toastNotification.classList.remove("error");

    if (isError) {
      toastNotification.classList.add("error");
    }

    toastNotification.classList.add("show");

    setTimeout(() => {
      toastNotification.classList.remove("show");
    }, 3000);
  }

  // Función para mostrar error en un campo
  function showError(input, errorElement, message) {
    input.classList.remove("valid");
    input.classList.add("error");
    errorElement.textContent = message;
    errorElement.classList.add("visible");
    validationState[input.id] = false;
    updateSubmitButton();
  }

  // Función para limpiar error en un campo
  function clearError(input, errorElement) {
    input.classList.remove("error");
    errorElement.textContent = "";
    errorElement.classList.remove("visible");
  }

  // Función para marcar un campo como válido
  function markValid(input) {
    clearError(input, document.getElementById(`${input.id}-error`));
    input.classList.add("valid");
    validationState[input.id] = true;
    updateSubmitButton();
  }

  // Función para actualizar el estado del botón de envío
  function updateSubmitButton() {
    const allValid = Object.values(validationState).every((valid) => valid);
    submitButton.disabled = !allValid;
  }

  // Validación de email
  function validateEmail(input, errorElement) {
    const value = input.value.trim();

    // RFC 5322 regex para validar email
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (value.length === 0) {
      showError(input, errorElement, "Email is required");
      return false;
    }

    if (!emailRegex.test(value)) {
      showError(input, errorElement, "Please enter a valid email address");
      return false;
    }

    markValid(input);
    return true;
  }

  // Validación de contraseña
  function validatePassword(input, errorElement) {
    const value = input.value;

    if (value.length === 0) {
      showError(input, errorElement, "Password is required");
      return false;
    }

    markValid(input);
    return true;
  }

  // Función para validar todos los campos
  function validateAll() {
    const isEmailValid = validateEmail(emailInput, emailError);
    const isPasswordValid = validatePassword(passwordInput, passwordError);

    return isEmailValid && isPasswordValid;
  }

  // Configurar event listeners para validación en tiempo real
  emailInput.addEventListener("input", () => {
    validateEmail(emailInput, emailError);
  });

  passwordInput.addEventListener("input", () => {
    validatePassword(passwordInput, passwordError);
  });

  // Validar campos al cargar para activar/desactivar botón
  validateAll();

  // Event listener para el envío del formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validar todos los campos antes de enviar
    if (!validateAll()) {
      return;
    }

    // Mostrar spinner y cambiar texto del botón
    buttonText.textContent = "Logging in...";
    spinner.classList.remove("hidden");
    submitButton.disabled = true;

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
      console.log("Intentando iniciar sesión con:", { email });

      // Guardar tiempo de inicio para asegurar un tiempo mínimo de procesamiento
      const startTime = Date.now();
      const res = await login(email, password);
      const elapsedTime = Date.now() - startTime;

      // Asegurar que la pantalla de carga se muestre al menos por 1 segundo
      // pero no más de 3 segundos como indica el requisito
      const remainingTime = Math.min(3000, Math.max(0, 1000 - elapsedTime));
      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      console.log("Respuesta del servidor:", res);

      // Guardamos token y usuario en localStorage (de forma "segura")
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      // Mostrar toast de éxito
      showToast(`¡Bienvenido, ${res.user.firstName}!`);

      // Esperar un momento y redirigir (menos de 500ms según requisito)
      setTimeout(() => {
        navigateTo("dashboard");
      }, 300);
    } catch (err) {
      console.error("Login error:", err);

      // Restablecer botón
      buttonText.textContent = "Login";
      spinner.classList.add("hidden");
      submitButton.disabled = false;

      // Manejar errores específicos según el código HTTP
      if (err.message && err.message.includes("401")) {
        showError(emailInput, emailError, "Invalid email or password");
        showError(passwordInput, passwordError, "Invalid email or password");
        showToast("Invalid email or password", true);
      } else if (err.message && err.message.includes("423")) {
        showToast("Account temporarily locked", true);
      } else if (err.message && err.message.includes("429")) {
        showToast("Too many login attempts. Please try again later.", true);
      } else if (err.message && /5\d\d/.test(err.message)) {
        // Error 5xx - Error del servidor
        showToast("Please try again later", true);

        // En modo dev, mostrar en consola
        if (process.env.NODE_ENV !== "production") {
          console.error("Server error details:", err);
        }
      } else {
        showToast("An error occurred. Please try again.", true);
      }
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
    // URL específica para Google Auth (usar la URL correcta según el entorno)
    const isProduction = window.location.hostname !== "localhost";
    const baseUrl = isProduction 
      ? "https://task-manager-backend-5y00.onrender.com" 
      : "http://localhost:3001";
    const googleAuthUrl = `${baseUrl}/api/auth/google`;

    // Mostrar spinner durante la autenticación
    buttonText.textContent = "Authenticating...";
    spinner.classList.remove("hidden");
    submitButton.disabled = true;

    // Usar el nuevo método seguro para iniciar la autenticación
    const auth = initiateGoogleAuth(googleAuthUrl);
    
    // Configurar el verificador de estado
    auth.checkAuthStatus((error, user) => {
      // Restablecer botón en cualquier caso
      buttonText.textContent = "Login";
      spinner.classList.add("hidden");
      submitButton.disabled = false;
      
      if (error) {
        console.error("Error de autenticación con Google:", error);
        showToast("La autenticación con Google no pudo completarse", true);
        return;
      }
      
      if (user) {
        console.log("Autenticación con Google exitosa");
        
        // Mostrar toast y redirigir al dashboard
        showToast(`¡Bienvenido, ${user.firstName}!`);
        
        // Redirigir al dashboard después de un breve momento
        setTimeout(() => {
          navigateTo("dashboard");
        }, 300);
      }
    });
  });
}
