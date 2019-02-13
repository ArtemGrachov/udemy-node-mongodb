const express = require('express');
const {
  check,
  body
} = require('express-validator/check');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignUp);

router.post(
  '/signup',
  check('email')
  .isEmail()
  .withMessage('Please enter as valid email')
  .custom((value, {
    req
  }) => {
    if (value === 'test@test.com') {
      throw new Error('This email address is forbidden.')
    }
    return true;
  }),
  body(
    'password',
    'Please enter a password with at least 5 characters'
  ).isLength({
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
  authController.postSignUp
);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;