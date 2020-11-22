'use strict'

var validator = require('validator');
var fs = require('fs');
var path = require('path');
var Article = require('../models/article');

var controller = {

    datosCurso: (req, res) => {
        var hola = req.body.hola;

        return res.status(200).send({
            curso: 'Master en Framerworks JS',
            author: 'JL-OLEMAR',
            url: 'victorroblesweb.es',
            hola
        });
    }, // end datosCurso

    test: (req, res) => {
        return res.status(200).send({
            message: 'Soy la acción test de mi controlador de aticulos'
        });
    }, // end test

    save: (req, res) => {
        // Recoger parametros por post
        var params = req.body;

        // Validar datos (validaator)
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);

        } catch (err) {
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar!!!'
            });
        }

        if (validate_title && validate_content) {

            // Crear el objeto a guardar
            var article = new Article();

            // Asignar el articulo
            article.title = params.title;
            article.content = params.content;
            article.image = params.image;

            // if (params.image) {
            //     article.image = params.image;
            // } else {
            //     article.image = "";
            // }

            // Guardar el articulo
            article.save((err, articleStored) => {
                if (err || !articleStored) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'El articulo no se ha guardado'
                    });
                }

                // Devolver una respuesta
                return res.status(200).send({
                    status: 'success',
                    article: articleStored
                });
            });

        } else {
            return res.status(200).send({
                status: 'error',
                message: 'Los datos no son válidos.'
            });
        }
    }, // end save

    getArticles: (req, res) => {

        var query = Article.find({});

        var last = req.params.last;
        if (last || last != undefined) {
            query.limit(5);
        }

        // Find
        query.sort('-_id').exec((err, articles) => {

            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los articulos !!!'
                });
            }

            if (!articles) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay articulos para mostrar.'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });

        });

    }, // end getArticles

    getArticle: (req, res) => {

        // Recoger el id de la url
        var articleId = req.params.id;

        // Comprobar que existe
        if (!articleId || articleId == null) {
            return res.status(404).send({
                status: 'error',
                message: 'No existe el articulo.'
            });
        }

        // Buscar el articulo
        Article.findById(articleId, (err, article) => {

            if (err || !article) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el articulo.'
                });
            }

            // Devolver  en json
            return res.status(200).send({
                status: 'success',
                article
            });
        });

    }, // end getArticle

    update: (req, res) => {

        // Recoger el id del articulo por la url
        var articleId = req.params.id;

        // Recoger los datos que llegan por put
        var params = req.body;

        // Validar datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        } catch (err) {
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar.'
            });
        }

        if (validate_title && validate_content) {
            // Find and update
            Article.findOneAndUpdate({ _id: articleId }, params, { new: true }, (err, articleUpdated) => {

                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar.'
                    });
                }

                if (!articleUpdated) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el artículo'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    articleUpdated
                });

            });
        } else {
            // Devolver respuesta
            return res.status(200).send({
                status: 'error',
                message: 'La validación no es correcta !!!'
            });
        }
    }, // end update

    delete: (req, res) => {

        // Recoger el id de la url
        var articleId = req.params.id;

        // Find and delete
        Article.findOneAndDelete({ _id: articleId }, (err, articleRemoved) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al borra el articulo'
                });
            }
            if (!articleRemoved) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No se ha borrado el articulo, posiblemente no existe.'
                });
            }

            return res.status(200).send({
                status: 'success',
                article: articleRemoved
            });
        });
    }, // end delete

    upload: (req, res) => {

        // Configurar el modulo connect-multiparty en router/article.js        

        // Recoger el fichero de la pertición
        var file_name = 'Imagen no subida...';

        if (!req.files) {
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
        }

        // Conseguir nombre y la extensión del archivo
        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');

        // * ADVERTENCIA * EN LINUX O MAC
        // var file_split = file_path.split('/');

        // Nombre del archivo
        var file_name = file_split[2];

        // Extension del fichero
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];

        // Comprobar la extension, solo imagenes, si es valida borrr el fichero
        if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif') {

            // Borra el archivo subido
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: 'error',
                    message: 'La extensión de la imagen no es válida.'
                });
            });

        } else {
            // Si todo es válido, sacando id de la url
            var articleId = req.params.id;

            if (articleId) {
                // Buscar el articulo, asignarle el nombre de la imagen y actualizarlo
                Article.findOneAndUpdate({ _id: articleId }, { image: file_name }, { new: true }, (err, articleUpdated) => {

                    if (err || !articleUpdated) {
                        return res.status(404).send({
                            status: 'error',
                            message: 'Error al guardar la imagen del artículo.'
                        });
                    }
                    return res.status(200).send({
                        status: 'success',
                        article: articleUpdated
                    });
                });
            } else {
                return res.status(200).send({
                    status: 'success',
                    image: file_name
                });
            }

        }
    }, // end upload file

    getImage: (req, res) => {

        var file = req.params.image;
        if (file != 'null') {
            let path_file = './upload/articles/' + file;
            fs.exists(path_file, (exists) => {
                if (exists) {
                    return res.sendFile(path.resolve(path_file));
                } else {
                    return res.status(404).send({
                        status: 'error',
                        message: 'La imagen no existe.'
                    });
                }
            });
        } else {
            return res.status(200).send({
                status: 'success',
                image: file
            });
        }
    }, // end getImage file

    search: (req, res) => {

        // Sacar el string a buscar
        var searchString = req.params.search;

        // Find or
        Article.find({
            "$or": [
                { "title": { "$regex": searchString, "$options": "i" } },
                { "content": { "$regex": searchString, "$options": "i" } }
            ]
        }).sort([['date', 'descending']]).exec((err, articles) => {

            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición.'
                });
            }

            if (!articles || articles.length <= 0) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay artículos que coincidan con tu busqueda.'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });

        });

    }, // end search

}; // End controller

module.exports = controller;