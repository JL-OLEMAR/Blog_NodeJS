'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ArticleSchema = Schema({
    title: String,
    content: String,
    image: String,
    date: { type: Date, default: Date.now }    
});

module.exports = mongoose.model('Article', ArticleSchema);
// articles --> guarda documento de este tipo y con estructura dentro de la colección

