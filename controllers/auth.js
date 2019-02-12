const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.getLogin = (req, res) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login'
  })
}

exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  User
    .findOne({
      email
    })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email or password');
        return res.redirect('/login');
      }
      return bcrypt.compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              return res.redirect('/');
            })
          }
          req.flash('error', 'Invalid email or password');
          return res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          req.flash('error', 'Invalid email or password');
          return res.redirect('/login')
        });
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
    pageTitle: 'Signup'
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
        req.flash('error', 'User already exists');
        return res.redirect('/signup');
      }
      return bcrypt.hash(password, 12)
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
    })
    .catch(err => console.log(err));
}