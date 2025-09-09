import { resetPassword } from "../services/authService.js";
import { navigateTo } from "../router.js";

const MIN_SPINNER_DURATION = 700; // Minimum time to show spinner in ms

export default function setupReset() {
  console.log("Reset page setup initialized");

  // Get the token from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  console.log("Reset token from URL:", token);

  if (!token) {
    console.log("No token found, showing error message");
    showTokenError(
      "Invalid or missing reset token. Please request a new password reset link."
    );
    return;
  }

  // Set the token in the hidden input
  const tokenInput = document.getElementById("reset-token");
  if (tokenInput) {
    tokenInput.value = token;
  } else {
    console.error("Reset token input not found");
  }

  // Get DOM elements
  const form = document.getElementById("reset-password-form");
  const goLogin = document.getElementById("go-login");
  const successMsg = document.getElementById("success-message");
  const errorMsg = document.getElementById("error-message");
  const backToLogin = document.getElementById("back-to-login");
  const resetButton = document.getElementById("reset-button");
  const buttonText = document.getElementById("button-text");
  const spinner = document.getElementById("spinner");
  const newPasswordInput = document.getElementById("new-password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const newPasswordError = document.getElementById("new-password-error");
  const confirmPasswordError = document.getElementById(
    "confirm-password-error"
  );

  // Initially hide error and success messages
  if (errorMsg) errorMsg.style.display = "none";
  if (successMsg) successMsg.style.display = "none";

  // Setup password validation
  if (newPasswordInput) {
    newPasswordInput.addEventListener("input", validatePassword);
  }

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", validatePasswords);
  }

  // Initial validation
  validatePassword();
  validatePasswords();

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

      // Final validation before submit
      if (!validatePassword() || !validatePasswords()) {
        return;
      }

      // Start spinner and disable button
      if (buttonText && spinner && resetButton) {
        buttonText.classList.add("hidden");
        spinner.classList.remove("hidden");
        resetButton.disabled = true;
      }

      const startTime = Date.now();
      const newPassword = newPasswordInput.value;

      try {
        console.log("Sending reset request with token");
        const response = await resetPassword(token, newPassword);
        console.log("Reset response:", response);

        // Ensure spinner shows for minimum duration
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < MIN_SPINNER_DURATION) {
          await new Promise((resolve) =>
            setTimeout(resolve, MIN_SPINNER_DURATION - elapsedTime)
          );
        }

        if (response && response.success) {
          // Show toast notification
          showToast("Password updated successfully!", "success");

          // Show success message and hide form
          if (successMsg && form) {
            form.style.display = "none";
            successMsg.style.display = "block";
          }

          // Redirect to login page after brief delay
          setTimeout(() => {
            navigateTo("login");
          }, 500);
        } else {
          // Stop spinner and enable button
          if (buttonText && spinner && resetButton) {
            buttonText.classList.remove("hidden");
            spinner.classList.add("hidden");
            resetButton.disabled = false;
          }

          // Handle token expired/invalid
          if (
            response &&
            response.message &&
            (response.message.includes("expired") ||
              response.message.includes("invalid") ||
              response.message.includes("token"))
          ) {
            showTokenError(
              "Your password reset link has expired or is invalid. Please request a new one."
            );
            return;
          }

          // Show error message
          const message =
            (response && response.message) ||
            "Error resetting password. Please try again.";

          showToast(message, "error");

          if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.style.display = "block";
            errorMsg.setAttribute("aria-live", "assertive");
          }
        }
      } catch (error) {
        console.error("Reset error:", error);

        // Stop spinner and enable button
        if (buttonText && spinner && resetButton) {
          buttonText.classList.remove("hidden");
          spinner.classList.add("hidden");
          resetButton.disabled = false;
        }

        const errorMessage =
          error.message || "An error occurred. Please try again later.";

        showToast(errorMessage, "error");

        if (errorMsg) {
          errorMsg.textContent = errorMessage;
          errorMsg.style.display = "block";
          errorMsg.setAttribute("aria-live", "assertive");
        }
      }
    });
  }

  // Validate password meets requirements
  function validatePassword() {
    if (!newPasswordInput || !newPasswordError) return true;

    const password = newPasswordInput.value;

    // Skip validation if empty
    if (!password) {
      newPasswordError.style.display = "none";
      document.getElementById("password-requirements").style.display = "none";
      updateButtonState();
      return false;
    }

    const isLengthValid = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    let isValid = true;
    let errorMessage = "";

    if (!isLengthValid) {
      errorMessage = "Password must be at least 8 characters";
      isValid = false;
    } else if (!hasUpperCase) {
      errorMessage = "Password must include at least one uppercase letter";
      isValid = false;
    } else if (!hasLowerCase) {
      errorMessage = "Password must include at least one lowercase letter";
      isValid = false;
    } else if (!hasNumber) {
      errorMessage = "Password must include at least one number";
      isValid = false;
    }

    newPasswordError.textContent = errorMessage;
    newPasswordError.style.display = isValid ? "none" : "block";

    // Update requirements visibility
    const requirementsEl = document.getElementById("password-requirements");
    if (requirementsEl) {
      requirementsEl.style.display =
        password.length > 0 && !isValid ? "block" : "none";
    }

    updateButtonState();
    return isValid;
  }

  // Validate passwords match
  function validatePasswords() {
    if (!newPasswordInput || !confirmPasswordInput || !confirmPasswordError)
      return true;

    const password = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Skip validation if empty
    if (!confirmPassword) {
      confirmPasswordError.style.display = "none";
      updateButtonState();
      return false;
    }

    let isValid = true;
    let errorMessage = "";

    if (confirmPassword.length > 0 && password !== confirmPassword) {
      errorMessage = "Passwords do not match";
      isValid = false;
    }

    confirmPasswordError.textContent = errorMessage;
    confirmPasswordError.style.display = isValid ? "none" : "block";

    updateButtonState();
    return isValid;
  }

  // Update button state based on form validity
  function updateButtonState() {
    if (!resetButton || !newPasswordInput || !confirmPasswordInput) return;

    const isNewPasswordValid =
      newPasswordInput.value.length >= 8 &&
      /[A-Z]/.test(newPasswordInput.value) &&
      /[a-z]/.test(newPasswordInput.value) &&
      /\d/.test(newPasswordInput.value);

    const passwordsMatch =
      newPasswordInput.value === confirmPasswordInput.value;
    const isBothFieldsFilled =
      newPasswordInput.value && confirmPasswordInput.value;

    resetButton.disabled = !(
      isNewPasswordValid &&
      passwordsMatch &&
      isBothFieldsFilled
    );
  }

  // Show toast notification
  function showToast(message, type = "info") {
    const toast = document.getElementById("toast-notification");
    const toastMessage = document.getElementById("toast-message");

    if (!toast || !toastMessage) return;

    toast.className = "toast-notification";
    toast.classList.add(`toast-${type}`);
    toastMessage.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 5000);
  }

  // Show token error (expired or invalid)
  function showTokenError(message) {
    // Hide the form
    if (form) form.style.display = "none";

    // Hide success message if exists
    if (successMsg) successMsg.style.display = "none";

    // Show error in the error message element
    if (errorMsg) {
      errorMsg.innerHTML = `
        <p>${message}</p>
        <p>Please go to the <a href="#" id="go-recovery">password recovery page</a> to request a new link.</p>
      `;
      errorMsg.style.display = "block";
      errorMsg.setAttribute("aria-live", "assertive");

      // Add event listener to recovery link
      const goRecovery = document.getElementById("go-recovery");
      if (goRecovery) {
        goRecovery.addEventListener("click", (e) => {
          e.preventDefault();
          navigateTo("recovery");
        });
      }
    } else {
      // Create error container if error message element doesn't exist
      const formSection = document.querySelector(".form-section");
      if (formSection) {
        const errorContainer = document.createElement("div");
        errorContainer.className = "alert alert-error";
        errorContainer.setAttribute("aria-live", "assertive");
        errorContainer.innerHTML = `
          <p>${message}</p>
          <p>Please go to the <a href="#" id="go-recovery-alt">password recovery page</a> to request a new link.</p>
        `;
        formSection.appendChild(errorContainer);

        // Add event listener to recovery link
        const goRecoveryAlt = document.getElementById("go-recovery-alt");
        if (goRecoveryAlt) {
          goRecoveryAlt.addEventListener("click", (e) => {
            e.preventDefault();
            navigateTo("recovery");
          });
        }
      }
    }

    // Show toast notification
    showToast(message, "error");
  }
}
