import "./assets/styles/base.css";
import "./assets/styles/variables.css";
import "./assets/styles/components.css";
import "./assets/styles/dashboard.css";
import { navigateTo } from "./router.js";

// Para depuración
console.log("Aplicación iniciada");
console.log("Cargando vista de login...");

// Cargar Login por defecto
navigateTo("login")
  .then(() => console.log("Vista login cargada correctamente"))
  .catch((err) => console.error("Error al cargar vista login:", err));
