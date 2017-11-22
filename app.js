'use strict';
const debug = require('debug');
const express = require('express');
const path = require('path');
const logger = require('morgan');

const app = express();

const BlogsRouter = require('./routes/blog-post');

app.use(logger('dev'));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname), '/views/layout.html');
});

app.use('/blog-post', BlogsRouter);

app.listen(process.env.PORT || 8080, () => {
    console.log(`Express server listening on port ${process.env.PORT || 8080}`);
});
