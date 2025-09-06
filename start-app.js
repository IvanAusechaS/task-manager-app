// Script para iniciar frontend y backend
const { exec } = require("child_process");
const path = require("path");

console.log("Iniciando backend y frontend...");

// Rutas de los directorios
const backendDir = path.join(__dirname, "backend");
const frontendDir = path.join(__dirname, "frontend");

// Iniciar backend
const backendProcess = exec("npm start", { cwd: backendDir });
console.log("Iniciando backend...");

backendProcess.stdout.on("data", (data) => {
  console.log(`Backend: ${data}`);
});

backendProcess.stderr.on("data", (data) => {
  console.error(`Error en backend: ${data}`);
});

// Esperar 3 segundos antes de iniciar el frontend
setTimeout(() => {
  // Iniciar frontend
  const frontendProcess = exec("npm run dev", { cwd: frontendDir });
  console.log("Iniciando frontend...");

  frontendProcess.stdout.on("data", (data) => {
    console.log(`Frontend: ${data}`);
  });

  frontendProcess.stderr.on("data", (data) => {
    console.error(`Error en frontend: ${data}`);
  });
}, 3000);

// Manejar señales de terminación
process.on("SIGINT", () => {
  console.log("Cerrando procesos...");
  backendProcess.kill();
  frontendProcess.kill();
  process.exit();
});
