// Crear usuario para pruebas
const registerUser = async () => {
  const userData = {
    firstName: "Usuario",
    lastName: "Prueba",
    email: "test@example.com",
    password: "123456",
    age: 30, // Agregamos el campo age ya que es requerido
  };

  try {
    const response = await fetch("http://localhost:3001/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log("Resultado:", data);

    if (response.ok) {
      console.log("Usuario creado exitosamente");
    } else {
      console.log("Error al crear usuario:", data.message);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

registerUser();
