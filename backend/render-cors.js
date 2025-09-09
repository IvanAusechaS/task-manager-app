// Este archivo se utiliza para configurar CORS específicamente para Render
import cors from 'cors';

// Configuración CORS para Render
export default function setupRenderCors(app) {
  // Configuración permisiva de CORS para entorno de producción
  app.use(cors({
    origin: '*', // Permitir cualquier origen
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
  }));

  // Middleware adicional para asegurar que los encabezados CORS estén presentes
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept');
    
    // Manejar preflight OPTIONS
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  });

  // Log para debugging
  console.log('CORS configurado para Render');
}
