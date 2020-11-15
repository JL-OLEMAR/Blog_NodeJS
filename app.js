'use strict'

// Cargar modulos de node para crear servidor
var express = require('express');
var bodyParser = require('body-parser');

// Ejecutar express (http)
var app = express();

// Cargar ficheros rutas

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS

// Añadir prefijos a rutas

// Ruta o metodo d prueba para el API REST
app.post('/datos-curso', (req, res) => {
    var hola = req.body.hola;

    return res.status(200).send({
        curso: 'Master en Framerworks JS',
        author: 'JL-OLEMAR',
        url: 'victorroblesweb.es',
        hola
    });
});

// Exportar modulo (fichero actual)
module.exports = app;