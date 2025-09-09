import { sendPasswordResetEmail } from "../services/authService.js";
import { navigateTo } from "../router.js";

const MIN_SPINNER_DURATION = 700; // Minimum time to show spinner in ms
const MAX_SPINNER_DURATION = 3000; // Maximum time to show spinner in ms

export default function setupRecovery() {
  console.log("Recovery page setup initialized");

  const form = document.getElementById("recovery-form");
  const submitButton = document.getElementById("recovery-button");
  const buttonText = document.getElementById("button-text");
  const spinner = document.getElementById("spinner");
  const toastNotification = document.getElementById("toast-notification");
  const toastMessage = document.getElementById("toast-message");
  const successMsg = document.getElementById("success-message");
  const errorMsg = document.getElementById("error-message");
  const goLogin = document.getElementById("go-login");
  const backToLogin = document.getElementById("back-to-login");
  const emailInput = document.getElementById("email");
  const emailError = document.getElementById("email-error");

  // Hide error and success messages initially
  if (errorMsg) errorMsg.style.display = "none";
  if (successMsg) successMsg.style.display = "none";

  // Validate email input
  if (emailInput) {
    emailInput.addEventListener("input", validateEmail);
  }

  // Initial validation
  validateEmail();

  // Función para mostrar toast de notificación
  function showToast(message, type = "info") {
    if (!toastNotification || !toastMessage) return;

    toastMessage.textContent = message;

    // Remove all previous classes except base class
    toastNotification.className = "toast-notification";

    // Add specific type class
    toastNotification.classList.add(`toast-${type}`);

    // Show the toast
    toastNotification.classList.add("show");

    // Hide after 5 seconds
    setTimeout(() => {
      toastNotification.classList.remove("show");
    }, 5000);
  }

  // Handle navigation to login
  if (goLogin) {
    goLogin.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo("login");
    });
  }

  // Handle back to login from success message
  if (backToLogin) {
    backToLogin.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo("login");
    });
  }

  // Email validation function
  function validateEmail() {
    if (!emailInput || !emailError || !submitButton) return;

    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      emailError.style.display = "none";
      submitButton.disabled = true;
      return false;
    }

    if (!emailRegex.test(email)) {
      emailError.textContent = "Please enter a valid email address";
      emailError.style.display = "block";
      submitButton.disabled = true;
      return false;
    }

    emailError.style.display = "none";
    submitButton.disabled = false;
    return true;
  }

  // Handle recovery form submission
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Final validation before submit
      if (!validateEmail()) return;

      const email = emailInput.value.trim();
      console.log("Attempting to recover password for:", email);

      // Mostrar spinner y deshabilitar botón
      buttonText.classList.add("hidden");
      spinner.classList.remove("hidden");
      submitButton.disabled = true;

      // Hide error message if it was shown
      if (errorMsg) errorMsg.style.display = "none";

      try {
        console.log("Sending password reset request");

        // Guardar tiempo de inicio para asegurar un tiempo mínimo de procesamiento
        const startTime = Date.now();
        const response = await sendPasswordResetEmail(email);
        console.log("Password reset response:", response);

        // Calcular tiempo transcurrido y esperar si es necesario
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.min(
          MAX_SPINNER_DURATION,
          Math.max(MIN_SPINNER_DURATION, MIN_SPINNER_DURATION - elapsedTime)
        );

        if (remainingTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, remainingTime));
        }

        // Mostrar toast de confirmación
        showToast("Check your email to continue", "success");

        // Siempre mostrar el mensaje de éxito incluso si hay un error técnico
        // (por seguridad no revelamos si el email existe o no)
        if (form) form.style.display = "none";
        if (successMsg) successMsg.style.display = "block";
      } catch (error) {
        console.error("Recovery error:", error);

        // Ensure minimum spinner time
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < MIN_SPINNER_DURATION) {
          await new Promise((resolve) =>
            setTimeout(resolve, MIN_SPINNER_DURATION - elapsedTime)
          );
        }

        // Restablecer botón
        buttonText.classList.remove("hidden");
        spinner.classList.add("hidden");
        submitButton.disabled = false;

        // Handle different error types
        if (error.response) {
          // Response error from server
          if (error.response.status >= 500) {
            // Server error (5xx)
            showToast("Server error. Please try again later.", "error");
            if (errorMsg) {
              errorMsg.textContent = "Please try again later.";
              errorMsg.style.display = "block";
            }
          } else if (error.response.status === 404) {
            // Not found error
            showToast("Service unavailable. Please try again later.", "error");
            if (errorMsg) {
              errorMsg.textContent =
                "Service unavailable. Please try again later.";
              errorMsg.style.display = "block";
            }
          } else {
            // Other HTTP errors
            showToast("Error sending recovery email", "error");
            if (errorMsg) {
              errorMsg.textContent =
                error.response.data?.message ||
                "Error sending recovery email. Please try again.";
              errorMsg.style.display = "block";
            }
          }
        } else if (error.request) {
          // Network error (no response)
          showToast("Network error. Please check your connection.", "error");
          if (errorMsg) {
            errorMsg.textContent =
              "Connection error. Please check your internet connection and try again.";
            errorMsg.style.display = "block";
          }
        } else {
          // Other errors
          showToast("Error sending recovery email", "error");
          if (errorMsg) {
            errorMsg.textContent =
              error.message || "An unexpected error occurred.";
            errorMsg.style.display = "block";
          }
        }
      }
    });
  }
}
