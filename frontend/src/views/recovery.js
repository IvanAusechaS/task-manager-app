import { sendPasswordResetEmail } from "../services/authService.js";
import { navigateTo } from "../router.js";

export default function setupRecovery() {
  console.log("Recovery page setup initialized");

  const form = document.getElementById("recovery-form");
  const successMsg = document.getElementById("success-message");
  const errorMsg = document.getElementById("error-message");
  const goLogin = document.getElementById("go-login");
  const backToLogin = document.getElementById("back-to-login");

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

  // Handle recovery form submission
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      console.log("Attempting to recover password for:", email);

      try {
        // Hide error message if it was shown
        if (errorMsg) errorMsg.style.display = "none";

        console.log("Sending password reset request");
        const response = await sendPasswordResetEmail(email);
        console.log("Password reset response:", response);

        // Siempre mostrar el mensaje de éxito incluso si hay un error técnico
        // (por seguridad no revelamos si el email existe o no)
        form.style.display = "none";
        if (successMsg) successMsg.style.display = "block";
      } catch (error) {
        console.error("Recovery error:", error);
        // En caso de error de red o problema crítico
        if (errorMsg) {
          errorMsg.textContent =
            "Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.";
          errorMsg.style.display = "block";
        }
      }
    });
  }
}
