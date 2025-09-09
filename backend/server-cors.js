// Middleware para configurar los encabezados CORS directamente en el nivel del servidor
// Este archivo debe importarse en index.js para garantizar que los encabezados se apliquen
// antes de que el servidor procese cualquier solicitud

export default function applyCorsHeadersToServer(server) {
  // Aplicar middleware para establecer encabezados CORS en cada respuesta
  server.on('request', (req, res) => {
    // Interceptar y modificar el método writeHead original
    const originalWriteHead = res.writeHead;
    res.writeHead = function() {
      // Agregar encabezados CORS a cada respuesta
      this.setHeader('Access-Control-Allow-Origin', '*');
      this.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      this.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
      this.setHeader('Access-Control-Allow-Credentials', 'true');
      
      // Llamar al método original con los argumentos proporcionados
      return originalWriteHead.apply(this, arguments);
    };
  });
  
  console.log('✅ Encabezados CORS aplicados a nivel de servidor HTTP');
}
