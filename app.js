const
  path = require('path'),
  express = require('express'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs');

const adminRoutes = require('./routes/admin'),
  shopRoutes = require('./routes/shop');

const errorController = require('./controllers/error');

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect('mongodb://localhost:27017/udemy-node')
  .then(result => app.listen(3000))
  .catch(error => console.log(error));