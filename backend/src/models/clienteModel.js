const pool = require('../config/supabase');

const clienteModel = {
    // Obtener todos los clientes
    obtenerTodos: async () => {
        const resultado = await pool.query('SELECT * FROM clientes ORDER BY created_at DESC');
        return resultado.rows;
    },

    // Crear un nuevo cliente
    crear: async (nombres, empresa, telefono, direccion, ruc, email) => {
        const query = `
      INSERT INTO clientes (nombres, empresa, telefono, direccion, ruc, email) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *;
    `;
        const valores = [nombres, empresa, telefono, direccion, ruc, email];
        const resultado = await pool.query(query, valores);
        return resultado.rows[0];
    }
};

module.exports = clienteModel;