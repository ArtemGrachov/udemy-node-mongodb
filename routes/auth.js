const express = require('express');
const bcrypt = require('bcryptjs');
const {
  check,
  body
} = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter an valid email')
      .normalizeEmail(),
    body('email')
      .custom((value, { req }) => {
        return User.findOne({ email: value})
          .then(userDoc => {
            if (userDoc) return userDoc;
            return Promise.reject('Invalid email or password');
          })
          .then(userDoc => {
            return bcrypt.compare(req.body.password, userDoc.password)
            .then(match => {
              if (match) req.user = userDoc;
              return match;
            });
          })
          .then(match => {
            if (match) return true;
            return Promise.reject('Invalid email or password');
          })
      })
  ],
  authController.postLogin
);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignUp);

router.post(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter an valid email')
      .normalizeEmail()
      .custom((value) => {
        return User.findOne({ email: value })
          .then(userDoc => {
            if (userDoc) {
              return Promise.reject('User already exists')
            }
            return true;
          })
        
      }),
    body(
      'password',
      'Please enter a password with at least 5 characters'
    )
      .isLength({
        min: 5
      }),
    body(
      'confirmPassword'
    )
      .custom((value, {
        req
      }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match');
        }
        return true;
      }),
  ],
  authController.postSignUp
);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;