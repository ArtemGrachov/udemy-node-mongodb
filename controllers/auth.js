const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.getLogin = (req, res) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: req.session.isLoggedIn
  })
}

exports.postLogin = (req, res) => {
  User
    .find()
    .then(user => {
      req.session.isLoggedIn = true;
      req.session.user = req.user;
      req.session.save(() => {
        res.redirect('/');
      })
    })
}

exports.postLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
}

exports.getSignUp = (req, res) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false
  })
}

exports.postSignUp = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({
      email
    })
    .then(userDoc => {
      if (userDoc) {
        return res.redirect('/signup');
      }
      return bcrypt.hash(password, 12);
    })
    .then(hash => {
      const user = new User({
        email: email,
        password: hash,
        cart: {
          items: []
        }
      })
      return user.save();
    })
    .then(result => res.redirect('/login'))
    .catch(err => console.log(err));
}