import { resetPassword } from "../services/authService.js";
import { navigateTo } from "../router.js";

export default function setupReset() {
  console.log("Reset page setup initialized");

  // Get the token from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  console.log("Reset token from URL:", token);

  if (!token) {
    console.log("No token found, redirecting to recovery page");
    // If no token is provided, redirect to recovery page
    navigateTo("recovery");
    return;
  }

  // Set the token in the hidden input
  const tokenInput = document.getElementById("reset-token");
  if (tokenInput) {
    tokenInput.value = token;
  } else {
    console.error("Reset token input not found");
  }

  const form = document.getElementById("reset-password-form");
  const goLogin = document.getElementById("go-login");
  const successMsg = document.getElementById("success-message");
  const errorMsg = document.getElementById("error-message");
  const backToLogin = document.getElementById("back-to-login");

  // Handle login redirect
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

  // Handle form submission
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Reset form submitted");

      const newPassword = document.getElementById("new-password").value;
      const confirmPassword = document.getElementById("confirm-password").value;

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        if (errorMsg) {
          errorMsg.textContent = "Passwords do not match";
          errorMsg.style.display = "block";
        } else {
          alert("Passwords do not match");
        }
        return;
      }

      try {
        console.log("Sending reset request with token");
        const response = await resetPassword(token, newPassword);
        console.log("Reset response:", response);

        if (response && response.success) {
          // Show success message if available
          if (successMsg) {
            form.style.display = "none";
            successMsg.style.display = "block";
          } else {
            alert(
              "Password reset successful! Please log in with your new password."
            );
            navigateTo("login");
          }
        } else {
          // Show error message
          const message =
            (response && response.message) ||
            "Error resetting password. Please try again.";

          if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.style.display = "block";
          } else {
            alert(message);
          }
        }
      } catch (error) {
        console.error("Reset error:", error);

        if (errorMsg) {
          errorMsg.textContent =
            "An error occurred. Please try again later. " +
            (error.message || "");
          errorMsg.style.display = "block";
        } else {
          alert("An error occurred. Please try again later.");
        }
      }
    });
  }
}
