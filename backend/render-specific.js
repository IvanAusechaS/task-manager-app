// Configuración específica para Render
// Este archivo debe ser requerido en index.js antes de cualquier otro middleware

export default function configureRenderDeployment(app) {
  console.log('🔧 Configurando middleware específico para Render');
  
  // Middleware específico para Render que se ejecuta antes que cualquier otro
  app.use((req, res, next) => {
    // Forzar los encabezados CORS en cada respuesta
    res.setHeader('Access-Control-Allow-Origin', 'https://tidytasks-v1.onrender.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Manejar específicamente las solicitudes OPTIONS para el preflight
    if (req.method === 'OPTIONS') {
      console.log('📝 Respondiendo a solicitud OPTIONS preflight');
      return res.status(204).end();
    }
    
    next();
  });
  
  // Interceptar errores para añadir encabezados CORS incluso en respuestas de error
  app.use((err, req, res, next) => {
    if (!res.headersSent) {
      res.setHeader('Access-Control-Allow-Origin', 'https://tidytasks-v1.onrender.com');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    console.error('❌ Error en solicitud:', err);
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  });
}
