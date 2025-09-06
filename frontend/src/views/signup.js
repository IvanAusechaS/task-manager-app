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

      const res = await signup(userData);

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
          "Error creating account. Please check your information and try again."
        );
      }
    }
  });

  // Navegar a login
  document.getElementById("go-login").addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("login");
  });

  // Botón de signup con Google (futuro)
  document.querySelector(".google-login").addEventListener("click", () => {
    alert("Google signup is not yet implemented 🚀");
  });
}
