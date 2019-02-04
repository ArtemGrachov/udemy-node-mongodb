const
  path = require('path'),
  express = require('express'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs');

const adminRoutes = require('./routes/admin'),
  shopRoutes = require('./routes/shop'),
  authRoutes = require('./routes/auth');

const errorController = require('./controllers/error');

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

const User = require('./models/user');

app.use((req, res, next) => {
  User.findOne()
    .then(user => {
      if (!user) {
        return new User({
          name: 'user',
          email: 'user@email',
          cart: {
            items: []
          }
        }).save()
      }
      return user;
    })
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);


mongoose
  .connect('mongodb://localhost:27017/udemy-node')
  .then(result => app.listen(3000))
  .catch(error => console.log(error));