import { resetPassword } from "../services/authService.js";
import { navigateTo } from "../router.js";

document.addEventListener("DOMContentLoaded", () => {
  // Get the token from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (!token) {
    // If no token is provided, redirect to recovery page
    navigateTo("recovery");
    return;
  }

  // Set the token in the hidden input
  document.getElementById("reset-token").value = token;

  const form = document.getElementById("reset-password-form");
  const goLogin = document.getElementById("go-login");

  // Handle login redirect
  if (goLogin) {
    goLogin.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo("login");
    });
  }

  // Handle form submission
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const newPassword = document.getElementById("new-password").value;
      const confirmPassword = document.getElementById("confirm-password").value;

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
});
