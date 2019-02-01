const
  path = require('path'),
  express = require('express'),
  bodyParser = require('body-parser');

const app = express();
const mongoConnect = require('./util/database').mongoConnect;

app.set('view engine', 'ejs');

const adminRoutes = require('./routes/admin'),
  shopRoutes = require('./routes/shop');

const errorController = require('./controllers/error');

const User = require('./models/user');

app.use((req, res, next) => {
  User.findById('5c54613eec3a5094441afd06')
    .then(user => {
      req.user = Object.assign(new User(), user);
      next();
    })
    .catch(err => console.log(err))
})

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(client => {

  app.listen(3000);
})