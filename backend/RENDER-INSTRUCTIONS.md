# Instrucciones para solucionar CORS en Render

## Si sigues teniendo problemas CORS después de este despliegue:

1. En el dashboard de Render, ve a tu servicio backend (task-manager-backend)

2. En la sección "Environment", agrega las siguientes variables de entorno:
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://tidytasks-v1.onrender.com`

3. En la sección "Headers", agrega los siguientes encabezados personalizados:
   ```
   Access-Control-Allow-Origin: https://tidytasks-v1.onrender.com
   Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
   Access-Control-Allow-Headers: Content-Type,Authorization,X-Requested-With
   Access-Control-Allow-Credentials: true
   ```

4. En la configuración del servicio, asegúrate de que:
   - Build Command: `npm install`
   - Start Command: `node index.js`

5. Revisa la sección "Logs" en Render después de realizar el despliegue para verificar que no haya errores.

## Si el problema persiste:

Considera crear un proxy CORS:
1. Crea un pequeño servicio en Render que actúe como proxy entre tu frontend y backend
2. Configura este proxy para pasar todas las solicitudes al backend con los encabezados CORS correctos
3. Actualiza tu frontend para hacer solicitudes a este proxy en lugar de directamente al backend

## Para pruebas locales:

Puedes usar una extensión del navegador como "CORS Unblock" temporalmente para verificar si el problema es realmente CORS y no otra cosa.
