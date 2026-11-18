const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteControlador');

// Definimos los endpoints
router.get('/', clienteController.getClientes);
router.post('/', clienteController.crearCliente);

module.exports = router;