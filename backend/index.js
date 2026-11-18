const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Importar rutas de clientes
const clienteRoutes = require('./src/routes/clienteRoutes');
app.use('/api/clientes', clienteRoutes);

app.get('/', (req, res) => {
    res.json({ mensaje: '¡Backend de Quishpe Constructores conectado a Supabase! 🚀' });
});

app.listen(PORT, () => {
    console.log(`🔥 Servidor corriendo en el puerto ${PORT}`);
});