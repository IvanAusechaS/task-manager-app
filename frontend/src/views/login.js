// src/views/login.js
import { login } from "../services/authService.js";
import { navigateTo } from "../router.js";

export default function setupLogin() {
  const form = document.getElementById("login-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();

    try {
      const res = await login(email, password);

      // Guardamos token y usuario
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      alert(`Bienvenido, ${res.user.firstName}`);
      navigateTo("dashboard"); // 👈 o la vista a la que quieras redirigir
    } catch (err) {
      console.error("Login error:", err);
      alert("Credenciales inválidas. Intenta nuevamente.");
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

  // Botón de login con Google (futuro)
  document.querySelector(".google-login").addEventListener("click", () => {
    alert("Google login aún no implementado 🚀");
  });
}
