const express = require('express');
//const os = require('os');
const path = require('path');
const cors = require('cors');

const app = express();
//const PORT = 3000;
const PORT = process.env.PORT || 3000;  // Ajustado para Vercel

// Habilita CORS para todos los orígenes
app.use(cors());

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Ruta para servir el JSON
app.get("/data/Concertación_Propositos.json", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "data", "Concertación_Propositos.json"));
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
