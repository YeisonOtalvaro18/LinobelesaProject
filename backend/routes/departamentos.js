const express = require('express');
const router = express.Router();
const buscarDepartamento = require('../helpers/buscarDepartamento');
const Departamentos = require('../data/departamentos');

// Obtener todos los departamentos con sus ciudades
router.get('/', (req, res) => {
    try {
        if (Departamentos && Departamentos.length > 0) {
            res.json({
                success: true,
                data: Departamentos
            });
        } else {
            res.status(404).json({
                success: false,
                message: "No se encontraron departamentos"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
});

// Obtener solo los nombres de los departamentos
router.get('/list', (req, res) => {
    try {
        if (Departamentos && Departamentos.length > 0) {
            const soloDepartamentos = Departamentos.map(({ id, departamento }) => {
                return { id, departamento }
            });
            res.json({
                success: true,
                data: soloDepartamentos
            });
        } else {
            res.status(404).json({
                success: false,
                message: "No se encontraron departamentos"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
});

// Obtener un departamento específico
router.get('/:departamento', (req, res) => {
    try {
        const departamento = req.params.departamento;
        const result = buscarDepartamento(departamento);
        
        if (result !== -1) {
            res.json({
                success: true,
                data: Departamentos[result]
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Departamento no encontrado"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
});

// Obtener ciudades de un departamento específico
router.get('/:departamento/ciudades', (req, res) => {
    try {
        const departamento = req.params.departamento;
        const result = buscarDepartamento(departamento);
        
        if (result !== -1) {
            res.json({
                success: true,
                data: Departamentos[result].ciudades
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Departamento no encontrado"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
});

module.exports = router;