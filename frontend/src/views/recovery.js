import {
  sendPasswordResetEmail,
  resetPassword,
} from "../services/authService.js";
import { navigateTo } from "../router.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("recovery-form");
  const successMsg = document.getElementById("success-message");
  const errorMsg = document.getElementById("error-message");
  const goLogin = document.getElementById("go-login");
  const backToLogin = document.getElementById("back-to-login");
  const resetModal = document.getElementById("reset-password-modal");
  const resetForm = document.getElementById("reset-password-form");
  const closeModal = document.querySelector(".close-modal");

  // Check URL for reset token
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get("token");

  if (resetToken) {
    // Show reset password modal if token is present
    document.getElementById("reset-token").value = resetToken;
    resetModal.style.display = "block";
  }

  // Close modal when clicking X
  if (closeModal) {
    closeModal.addEventListener("click", () => {
      resetModal.style.display = "none";
    });
  }

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === resetModal) {
      resetModal.style.display = "none";
    }
  });

  // Handle reset form submission
  if (resetForm) {
    resetForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const newPassword = document.getElementById("new-password").value;
      const confirmPassword = document.getElementById("confirm-password").value;
      const token = document.getElementById("reset-token").value;

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      try {
        const response = await resetPassword(token, newPassword);

        if (response.success) {
          alert(
            "Password reset successful! Please log in with your new password."
          );
          navigateTo("login");
        } else {
          alert(
            response.message || "Error resetting password. Please try again."
          );
        }
      } catch (error) {
        console.error("Reset error:", error);
        alert("An error occurred. Please try again later.");
      }
    });
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

        if (response && response.success) {
          // Show success message
          form.style.display = "none";
          if (successMsg) successMsg.style.display = "block";
        } else {
          // Show error message
          if (errorMsg) {
            errorMsg.textContent =
              (response && response.message) ||
              "Error sending reset email. Please try again.";
            errorMsg.style.display = "block";
          }
        }
      } catch (error) {
        console.error("Recovery error:", error);
        if (errorMsg) {
          errorMsg.textContent =
            "An error occurred. Please try again later. " +
            (error.message || "");
          errorMsg.style.display = "block";
        }
      }
    });
  }
});
