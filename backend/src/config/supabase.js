const { Pool } = require('pg');
require('dotenv').config();

// Creamos la conexión usando la URL de Supabase que pondremos en el archivo .env
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Requerido por Supabase para conexiones externas seguras
    }
});

// Probamos si la conexión es exitosa
pool.connect()
    .then(() => console.log('🟢 ¡Conexión exitosa a la base de datos de Supabase (PostgreSQL)!'))
    .catch((err) => console.error('🔴 Error al conectar a la base de datos:', err.message));

module.exports = pool;