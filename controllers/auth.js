const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const User = require('../models/user');
const {
  validationResult
} = require('express-validator/check');

const sendGridApiKey = process.env.SENDGRID_API_KEY;

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: sendGridApiKey
  }
}));

exports.getLogin = (req, res) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    oldInput: {
      email: ''
    },
    validationErrorMessages: []
  })
}

exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(422)
      .render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        validationErrorMessages: errors.array(),
        oldInput: {
          email
        }
      })
  }
  
  req.session.isLoggedIn = true;
  req.session.user = req.user;
  req.session.save(err => {
    return res.redirect('/');
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
    oldInput: {
      email: ''
    },
    validationErrorMessages: []
  })
}

exports.postSignUp = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      validationErrorMessages: errors.array(),
      oldInput: {
        email
      }
    });
  }

  bcrypt.hash(password, 12)
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
    .then(result => {
      transporter.sendMail({
        to: email,
        from: 'udemy-node@test.test',
        subject: 'Udemy Node.js Tutorial Shop - Sign Up',
        html: '<h1>You successfully signed up!</h1>'
      });
      res.redirect('/login')
    })
    .catch(err => console.log(err))
}

exports.getReset = (req, res, next) => {
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset password'
  })
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User
      .findOne({
        email: req.body.email
      })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account with that email found.');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        res.redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: 'udemy-node@test.test',
          subject: 'Udemy Node.js Tutorial Shop - Password Reset',
          html: `<p>You requested password reset</p><p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>`
        })
      })
      .catch(err => console.log(err))
  })
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
      resetToken: token,
      resetTokenExpiration: {
        $gt: Date.now()
      }
    })
    .then(user => {
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        userId: user.id.toString(),
        passwordToken: token
      });
    })
    .catch(err => console.log(err))
}

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;

  let resetUser;

  User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: {
        $gt: Date.now()
      },
      _id: userId
    })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = null;
      resetUser.resetTokenExpiration = null;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => console.log(err))
}