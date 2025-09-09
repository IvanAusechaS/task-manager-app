import app from './app.js';
import http from 'http';
import applyCorsHeadersToServer from './server-cors.js';

const PORT = process.env.PORT || 3001;

// Crear servidor HTTP explícito
const server = http.createServer(app);

// Aplicar configuración CORS a nivel de servidor
applyCorsHeadersToServer(server);

// Iniciar el servidor
server.listen(PORT, () => {
  console.log(`🚀 Backend server is running on port ${PORT}`);
  console.log(`🔑 CORS headers applied at server level`);
});