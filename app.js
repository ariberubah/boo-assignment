'use strict';

const express = require('express');
const path = require('path');
const app = express();
const port =  process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use('/static', express.static(path.join(__dirname, 'public', 'static')));

app.use('/', require('./routes/profile')());

const server = app.listen(port);
console.log('Express started. Listening on %s', port);