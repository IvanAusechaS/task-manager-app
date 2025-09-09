import "./assets/styles/base.css";
import "./assets/styles/variables.css";
import "./assets/styles/components.css";
import "./assets/styles/dashboard.css";
import "./assets/styles/auth-callback.css";
import { navigateTo } from "./router.js";
import "./utils/google-auth-handler.js"; // Importar el manejador de autenticación de Google

// Para depuración
console.log("Aplicación iniciada");
console.log("Cargando vista de login...");

// Escuchar evento personalizado para navegación al dashboard
window.addEventListener("navigate-to-dashboard", () => {
  console.log("Evento de navegación al dashboard recibido");
  navigateTo("dashboard")
    .then(() => console.log("Vista dashboard cargada correctamente por evento"))
    .catch((err) =>
      console.error("Error al cargar vista dashboard por evento:", err)
    );
});

// Verificar si hay una redirección pendiente desde autenticación
document.addEventListener("DOMContentLoaded", () => {
  const needsDashboardRedirect = localStorage.getItem(
    "needs_dashboard_redirect"
  );
  if (needsDashboardRedirect === "true") {
    console.log("Detectada redirección pendiente al dashboard");
    localStorage.removeItem("needs_dashboard_redirect");

    // Esperar un momento para asegurar que todo esté cargado
    setTimeout(() => {
      navigateTo("dashboard")
        .then(() =>
          console.log("Vista dashboard cargada por redirección pendiente")
        )
        .catch((err) =>
          console.error(
            "Error al cargar dashboard por redirección pendiente:",
            err
          )
        );
    }, 500);
  } else {
    // Cargar Login por defecto si no hay redirección pendiente
    navigateTo("login")
      .then(() => console.log("Vista login cargada correctamente"))
      .catch((err) => console.error("Error al cargar vista login:", err));
  }
});
