const express = require('express'),
  router = express.Router(),
  isAuth = require('../middleware/is-auth'),
  { body } = require('express-validator/check');

const adminController = require('../controllers/admin');

router.get('/add-product', isAuth, adminController.getAddProduct);

router.get('/products', isAuth, adminController.getProducts);

const productValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Product title should have more than 3 and less than 20 symbols and only letters or digits'),
  body('price')
    .isFloat()
    .withMessage('Invalid price'),
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description should have at least 10 symbols')
];

router.post(
  '/add-product',
  isAuth,
  productValidation,
  adminController.postAddProduct
);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
  '/edit-product',
  isAuth,
  productValidation,
  adminController.postEditProduct
);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;