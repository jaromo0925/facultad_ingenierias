const express = require('express');
const os = require('os');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;


// Habilita CORS para todos los orígenes
app.use(cors());

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});


// Configura la ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

// Función para obtener la IP local
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
        for (const net of interfaces[interfaceName]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return '127.0.0.1'; // Fallback a localhost si no encuentra otra IP
}

// Inicia el servidor
const localIP = getLocalIP();
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en:`);
    console.log(`- Local:   http://localhost:${PORT}`);
    console.log(`- Red:    http://${localIP}:${PORT}`);
});
