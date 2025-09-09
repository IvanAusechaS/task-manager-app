// MIDDLEWARE CORS DE EMERGENCIA
// Este archivo es una solución extrema cuando ningún otro enfoque funciona

import express from 'express';

export default function emergencyCorsMiddleware() {
  const router = express.Router();

  // Middleware que se ejecuta primero que todo
  router.use((req, res, next) => {
    // Log detallado para depuración
    console.log(`🔍 [CORS DEBUG] ${req.method} ${req.url}`);
    
    // 1. Establecer encabezados CORS en TODAS las solicitudes sin excepción
    res.header('Access-Control-Allow-Origin', 'https://tidytasks-v1.onrender.com');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 horas
    
    // 2. Manejar las solicitudes OPTIONS de manera agresiva
    if (req.method === 'OPTIONS') {
      console.log('⚠️ [CORS] Interceptando solicitud OPTIONS preflight');
      return res.status(204).send();
    }
    
    next();
  });

  return router;
}
