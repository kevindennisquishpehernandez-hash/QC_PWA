const clienteModel = require('../models/clienteModel');

const clienteController = {
    getClientes: async (req, res) => {
        try {
            const clientes = await clienteModel.obtenerTodos();
            res.json({ estado: 'success', datos: clientes });
        } catch (error) {
            console.error('Error al obtener clientes:', error);
            res.status(500).json({ estado: 'error', mensaje: 'Error interno del servidor' });
        }
    },

    crearCliente: async (req, res) => {
        try {
            const { nombres, empresa, telefono, direccion, ruc, email } = req.body;
            const nuevoCliente = await clienteModel.crear(nombres, empresa, telefono, direccion, ruc, email);
            res.status(201).json({ estado: 'success', mensaje: 'Cliente creado con éxito', datos: nuevoCliente });
        } catch (error) {
            console.error('Error al crear cliente:', error);
            res.status(500).json({ estado: 'error', mensaje: error.message });
        }
    }
};

module.exports = clienteController;