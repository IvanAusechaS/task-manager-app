import { sendPasswordResetEmail } from "../services/authService.js";
import { navigateTo } from "../router.js";

const MIN_SPINNER_DURATION = 700;
const MAX_SPINNER_DURATION = 3000;

export default function setupRecovery() {
    console.log("Recovery page setup initialized");

    const form = document.getElementById("recovery-form");
    const submitButton = document.getElementById("recovery-button");
    const buttonText = document.getElementById("button-text");
    const spinner = document.getElementById("spinner");
    const toastNotification = document.getElementById("toast-notification");
    const emailInput = document.getElementById("email");

    if (!form) {
        console.error("Recovery form not found");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        if (!email) {
            showToast("Please enter your email", "error");
            return;
        }

        // Show loading state
        setLoadingState(true);

        try {
            const response = await fetch('https://task-manager-app-aa92.onrender.com/api/auth/recover-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            // Minimum spinner duration
            await new Promise(resolve => setTimeout(resolve, MIN_SPINNER_DURATION));

            if (data.success || response.ok) {
                showToast("Recovery email sent! Check your inbox.", "success");
                form.reset();
            } else {
                showToast(data.message || "Error sending recovery email", "error");
            }
        } catch (error) {
            console.error('Recovery error:', error);
            showToast("Network error. Please try again.", "error");
        } finally {
            setLoadingState(false);
        }
    });

    function setLoadingState(loading) {
        if (loading) {
            submitButton.disabled = true;
            buttonText.textContent = "Sending...";
            spinner.classList.remove("hidden");
        } else {
            submitButton.disabled = false;
            buttonText.textContent = "Send Recovery Email";
            spinner.classList.add("hidden");
        }
    }

    function showToast(message, type = "info") {
        toastNotification.textContent = message;
        toastNotification.className = `toast ${type}`;
        toastNotification.classList.remove("hidden");

        setTimeout(() => {
            toastNotification.classList.add("hidden");
        }, 3000);
    }
}
