// src/views/Dashboard.js
import { navigateTo } from "../router.js";
import { logout, getCurrentUser } from "../services/authService.js";

export default function setupDashboard() {
  // Verificar si el usuario está autenticado
  const user = getCurrentUser();

  if (!user) {
    // Redireccionar a login si no hay usuario
    navigateTo("login");
    return;
  }

  // Mostrar información del usuario
  document.getElementById(
    "user-name"
  ).textContent = `Nombre: ${user.firstName} ${user.lastName}`;
  document.getElementById("user-email").textContent = `Email: ${user.email}`;

  // Configurar el botón de logout
  document
    .getElementById("logout-button")
    .addEventListener("click", async () => {
      try {
        await logout();
        navigateTo("login");
      } catch (err) {
        console.error("Error al cerrar sesión:", err);
        // Si falla el logout en el servidor, limpiar localStorage de todas formas
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigateTo("login");
      }
    });
}
