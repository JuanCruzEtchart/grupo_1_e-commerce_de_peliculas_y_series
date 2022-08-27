const express = require("express");
const app = express();
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

app.listen(3030, () => console.log("Servidor corriendo en puerto 3030"));

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./views/home.html"));
});

app.get("/detalle", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./views/detalle.html"));
});

app.get("/carrito", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./views/carrito.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./views/login.html"));
});

app.get("/registro", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./views/registro.html"));
});

app.get("/perfil", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./views/perfil.html"));
});

app.get("/header", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./views/header.html"));
});

app.get("/footer", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./views/footer.html"));
});