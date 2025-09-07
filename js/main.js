document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const email = document.getElementById("email");
  const password = document.getElementById("password");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Evita que se envíe el formulario por defecto

    if (email.value.trim() === "" || password.value.trim() === "") {
      alert("⚠️ Debe completar todos los campos para poder ingresar.");
    } else {
      // Aquí puedes poner la lógica de autenticación real
      alert("✅ Bienvenido, ingresaste correctamente.");
      form.reset();
    }
  });
});