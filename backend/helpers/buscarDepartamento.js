const Departamentos = require('../data/departamentos');

const buscarDepartamento = (departamento = "") => {
    let posicion = -1;
    Departamentos.forEach((elemento, index) => {
        if (elemento.departamento === departamento) {
            posicion = index;
        }
    });
    return posicion;
}

module.exports = buscarDepartamento;