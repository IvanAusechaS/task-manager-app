// Función para cargar vistas dinámicamente
export async function navigateTo(viewName) {
  try {
    console.log(`Intentando cargar vista: ${viewName}`);

    // Convertir a formato de archivo (primera letra minúscula)
    const fileViewName = viewName.charAt(0).toLowerCase() + viewName.slice(1);

    // Caso especial para auth-callback
    if (viewName === "auth-callback") {
      // Redireccionar a la página completa, no como una SPA
      window.location.href = "/src/views/auth-callback.html";
      return;
    }

    // Busca primero con la ruta relativa correcta para desarrollo
    let res;
    try {
      res = await fetch(`/src/views/${fileViewName}.html`);
      if (!res.ok) throw new Error("Vista no encontrada con ruta relativa");
    } catch (e) {
      // Si falla, intenta con ruta absoluta
      console.log("Intentando con ruta absoluta...");
      res = await fetch(`/views/${fileViewName}.html`);
    }

    if (!res.ok) {
      throw new Error(`Error al cargar vista: ${res.status} ${res.statusText}`);
    }

    const html = await res.text();
    document.querySelector("#app").innerHTML = html;
    console.log(`Vista ${viewName} cargada correctamente`);

    // Importa el script asociado a la vista (ej: login.js, signup.js, recovery.js)
    try {
      // Intentar cargar el script con el nombre normalizado (primera letra minúscula)
      console.log(`Intentando cargar script: ./views/${fileViewName}.js`);
      const module = await import(`./views/${fileViewName}.js`);
      if (module.default) {
        console.log(`Ejecutando setup de ${viewName}`);
        module.default(); // Ejecuta setup si existe
      }
    } catch (error) {
      console.error(`Error al cargar script de ${viewName}:`, error);
    }
  } catch (error) {
    console.error(`No se pudo cargar la vista: ${viewName}`, error);
    document.querySelector(
      "#app"
    ).innerHTML = `<h2>Error al cargar ${viewName}</h2><p>${error.message}</p>`;
  }
}
