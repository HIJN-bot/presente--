// Funcion para iniciar sesion de estudiantes
async function loginEstudiante(nombre="", apellido="", email, password) {

  try {

    // Hacemos la peticion al endpoint de login
    const response = await fetch('http://127.0.0.1:8000/api/estudiantes/login', {

      // Metodo HTTP para enviar informacion
      method: 'POST',

      // Cabeceras de la peticion
      headers: {
        'Content-Type': 'application/json'
      },

      // Convertimos los datos a formato JSON
      body: JSON.stringify({
        // Nombre del estudiante
        nombre, 

        //Apellido del estudiante
        apellido, 

        // Correo del estudiante
        email,

        // Contraseña del estudiante
        password
      })
    });

    // Convertimos la respuesta del servidor a JSON
    const data = await response.json();

    // Verificamos si ocurrio un error en el servidor
    if (!response.ok) {

      // Retornamos el mensaje de error
      return {
        ok: false,
        message: data.detail || 'Credenciales incorrectas'
      };
    }

    // Guardamos el token de sesion
    localStorage.setItem('presente_token', data.token);

    // Guardamos el rol del usuario
    localStorage.setItem('presente_role', 'student');

    // Guardamos la informacion del estudiante
    localStorage.setItem(
      'presente_user',
      JSON.stringify(data.user)
    );

    // Retornamos respuesta exitosa
    return {
      ok: true,
      data
    };

  } catch (error) {

    // Mostramos el error en consola
    console.error('[LOGIN ESTUDIANTE]', error);

    // Retornamos mensaje de error de conexion
    return {
      ok: false,
      message: 'Error de conexión con el servidor'
    };

  }

}