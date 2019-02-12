const
  path = require('path'),
  express = require('express'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  csrf = require('csurf'),
  MongoDBStore = require('connect-mongodb-session')(session),
  flash = require('connect-flash');

const app = express();

const MONGODB_URI = 'mongodb://localhost:27017/udemy-node';

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

app.use(session({
  secret: 'secret key',
  resave: false,
  saveUninitialized: false,
  store
}));


app.set('view engine', 'ejs');

const adminRoutes = require('./routes/admin'),
shopRoutes = require('./routes/shop'),
authRoutes = require('./routes/auth');

const errorController = require('./controllers/error');

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

const csrfProtection = csrf();

app.use(csrfProtection);
app.use(flash());

const User = require('./models/user');

app.use((req, res, next) => {
  if (!req.session.user) {
    next();
  } else {
    User
      .findById(req.session.user._id)
      .then(user => {
        req.user = user;
        next();
      })
      .catch(err => console.log(err))
  }
})

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  const errMessages = req.flash('error');
  res.locals.errorMessage = errMessages.length ? errMessages : null;
  next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI)
  .then(result => app.listen(3000))
  .catch(error => console.log(error));