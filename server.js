require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
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

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'handlebars');

app.use('/', routes);

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});
