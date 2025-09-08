// src/views/signup.js
import { signup } from "../services/authService.js";
import { navigateTo } from "../router.js";

export default function setupSignup() {
  // Referencias a elementos del DOM
  const form = document.getElementById("signup-form");
  const submitButton = document.getElementById("signup-button");
  const buttonText = document.getElementById("button-text");
  const spinner = document.getElementById("spinner");
  const toastNotification = document.getElementById("toast-notification");
  const toastMessage = document.getElementById("toast-message");

  // Referencias a campos de entrada
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const emailInput = document.getElementById("email");
  const ageInput = document.getElementById("age");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  // Referencias a contenedores de errores
  const firstNameError = document.getElementById("firstName-error");
  const lastNameError = document.getElementById("lastName-error");
  const emailError = document.getElementById("email-error");
  const ageError = document.getElementById("age-error");
  const passwordError = document.getElementById("password-error");
  const confirmPasswordError = document.getElementById("confirmPassword-error");

  // Objeto para almacenar el estado de validación de cada campo
  const validationState = {
    firstName: false,
    lastName: false,
    email: false,
    age: false,
    password: false,
    confirmPassword: false,
  };

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

  // Validación de nombre
  function validateName(input, errorElement) {
    const value = input.value.trim();

    if (value.length === 0) {
      showError(input, errorElement, "This field is required");
      return false;
    }

    if (value.length < 2) {
      showError(input, errorElement, "Name must be at least 2 characters");
      return false;
    }

    markValid(input);
    return true;
  }

  // Validación de email
  function validateEmail(input, errorElement) {
    const value = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  // Validación de edad
  function validateAge(input, errorElement) {
    const value = input.value.trim();
    const age = parseInt(value);

    if (value.length === 0) {
      showError(input, errorElement, "Age is required");
      return false;
    }

    if (isNaN(age) || !Number.isInteger(age)) {
      showError(input, errorElement, "Age must be a whole number");
      return false;
    }

    if (age < 13) {
      showError(input, errorElement, "You must be at least 13 years old");
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

    if (value.length < 8) {
      showError(
        input,
        errorElement,
        "Password must be at least 8 characters long"
      );
      return false;
    }

    // Debe contener al menos una mayúscula
    if (!/[A-Z]/.test(value)) {
      showError(
        input,
        errorElement,
        "Password must contain at least one uppercase letter"
      );
      return false;
    }

    // Debe contener al menos una minúscula
    if (!/[a-z]/.test(value)) {
      showError(
        input,
        errorElement,
        "Password must contain at least one lowercase letter"
      );
      return false;
    }

    // Debe contener al menos un número
    if (!/[0-9]/.test(value)) {
      showError(
        input,
        errorElement,
        "Password must contain at least one number"
      );
      return false;
    }

    // Debe contener al menos un carácter especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      showError(
        input,
        errorElement,
        "Password must contain at least one special character"
      );
      return false;
    }

    markValid(input);
    return true;
  }

  // Validación de confirmación de contraseña
  function validateConfirmPassword(input, errorElement) {
    const confirmValue = input.value;
    const passwordValue = passwordInput.value;

    if (confirmValue.length === 0) {
      showError(input, errorElement, "Please confirm your password");
      return false;
    }

    if (confirmValue !== passwordValue) {
      showError(input, errorElement, "Passwords do not match");
      return false;
    }

    markValid(input);
    return true;
  }

  // Validar todos los campos
  function validateAll() {
    const isFirstNameValid = validateName(firstNameInput, firstNameError);
    const isLastNameValid = validateName(lastNameInput, lastNameError);
    const isEmailValid = validateEmail(emailInput, emailError);
    const isAgeValid = validateAge(ageInput, ageError);
    const isPasswordValid = validatePassword(passwordInput, passwordError);
    const isConfirmPasswordValid = validateConfirmPassword(
      confirmPasswordInput,
      confirmPasswordError
    );

    return (
      isFirstNameValid &&
      isLastNameValid &&
      isEmailValid &&
      isAgeValid &&
      isPasswordValid &&
      isConfirmPasswordValid
    );
  }

  // Configurar event listeners para validación en tiempo real
  firstNameInput.addEventListener("input", () => {
    validateName(firstNameInput, firstNameError);
  });

  lastNameInput.addEventListener("input", () => {
    validateName(lastNameInput, lastNameError);
  });

  emailInput.addEventListener("input", () => {
    validateEmail(emailInput, emailError);
  });

  ageInput.addEventListener("input", () => {
    validateAge(ageInput, ageError);
  });

  passwordInput.addEventListener("input", () => {
    validatePassword(passwordInput, passwordError);
    // Si el campo de confirmación ya tiene contenido, validarlo nuevamente
    if (confirmPasswordInput.value.length > 0) {
      validateConfirmPassword(confirmPasswordInput, confirmPasswordError);
    }
  });

  confirmPasswordInput.addEventListener("input", () => {
    validateConfirmPassword(confirmPasswordInput, confirmPasswordError);
  });

  // Event listener para el envío del formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validar todos los campos antes de enviar
    if (!validateAll()) {
      return;
    }

    // Mostrar spinner y deshabilitar botón
    buttonText.textContent = "Creating Account...";
    spinner.classList.remove("hidden");
    submitButton.disabled = true;

    // Recoger datos del formulario
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim();
    const age = parseInt(ageInput.value.trim());
    const password = passwordInput.value;

    try {
      const userData = {
        firstName,
        lastName,
        email,
        age,
        password,
      };

      console.log("Sending registration data:", userData);

      // Simular un tiempo mínimo de procesamiento (mínimo 1s, máximo 3s)
      const startTime = Date.now();
      const res = await signup(userData);
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsedTime);

      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      console.log("Server response:", res);

      // Guardar token y usuario
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      // Mostrar toast de éxito
      showToast("Account created successfully");

      // Esperar un momento y redireccionar
      setTimeout(() => {
        navigateTo("login");
      }, 500);
    } catch (err) {
      console.error("Signup error:", err);

      // Restablecer botón
      buttonText.textContent = "Create Account";
      spinner.classList.add("hidden");
      submitButton.disabled = false;

      // Manejar error específico para email ya registrado
      if (err.message && err.message.includes("already registered")) {
        showError(emailInput, emailError, "This email is already registered");
        showToast("This email is already registered", true);
      } else if (err.message && err.message.includes("500")) {
        // Error del servidor
        showToast("Error creating account. Please try again later.", true);

        // En modo dev, mostrar en consola
        if (process.env.NODE_ENV !== "production") {
          console.error("Server error details:", err);
        }
      } else {
        showToast(
          "Error creating account. Please check your information and try again.",
          true
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
          showToast(`Welcome, ${user.firstName}!`);
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
          showToast(`Welcome, ${user.firstName}!`);
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
              showToast(`Welcome, ${user.firstName}!`);
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

  // Inicializar validaciones para habilitar/deshabilitar botón
  validateAll();
}
