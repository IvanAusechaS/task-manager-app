// Middleware directo para CORS que se aplicará a todas las solicitudes
// Este enfoque es más simple y directo que usar la librería cors

export default function applyCorsMidleware(app) {
  app.use((req, res, next) => {
    // Configuración permisiva para desarrollo y producción
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Habilitar respuestas pre-flight OPTIONS
    if (req.method === 'OPTIONS') {
      return res.status(200).send();
    }
    
    next();
  });
  
  console.log('✅ CORS middleware directo aplicado');
}
