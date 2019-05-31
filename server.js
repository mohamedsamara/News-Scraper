require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const session = require('express-session');
const flash = require('connect-flash');

const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

const routes = require('./app/routes');

// Connect to MongoDB
mongoose
  .connect(mongoURI, { useNewUrlParser: true })
  .then(() => console.log('MongoDB Connected!'))
  .catch(err => console.log(err));

// set public folder
app.use(express.static(path.join(__dirname, 'app/public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.engine(
  'handlebars',
  exphbs({
    defaultLayout: 'main',
    partialsDir: path.join(__dirname, 'app/views/layouts/partials')
  })
);
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'handlebars');

// Express Session Middleware
app.use(
  session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  })
);

// Express Flash Middleware
app.use(flash());

// Express Messages Middleware
app.use(function(req, res, next) {
  res.locals.messages = require('express-messages')(req, res)();
  next();
});

// Express Validator Middleware
app.use(expressValidator());

app.use('/', routes);

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});
