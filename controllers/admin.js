const Product = require('../models/product');
const { validationResult } = require('express-validator/check');

exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add product',
    path: '/admin/add-product',
    editing: false,
    oldValue: {
      title: '',
      price: 0,
      imageUrl: '',
      description: ''
    },
    validationErrorMessages: []
  })
}

exports.postAddProduct = (req, res, next) => {
  const errors = validationResult(req);

  const title = req.body.title,
    price = +req.body.price,
    imageUrl = req.body.imageUrl,
    description = req.body.description;

    if (!errors.isEmpty()) {
    return res
      .status(422)
      .render('admin/edit-product', {
        pageTitle: 'Add product',
        path: '/admin/add-product',
        editing: false,
        oldValue: {
          title,
          price,
          imageUrl,
          description
        },
        validationErrorMessages: errors.array()
      })
  }

  new Product({
    title,
    price,
    imageUrl,
    description,
    userId: req.session.user
  })
    .save()
    .then(result => res.redirect('/admin/products'))
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
}

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const productId = req.params.productId;
  Product
    .findById(productId)
    .then(product => {
      if (!product) res.redirect('/admin/products')
      res.render('admin/edit-product', {
        pageTitle: 'Edit product',
        path: '/admin/add-product',
        editing: true,
        product: product,
        oldValue: {},
        validationErrorMessages: []
      })
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
}

exports.postEditProduct = (req, res, next) => {
  const errors = validationResult(req);

  const
    productId = req.body.productId,
    title = req.body.title,
    price = +req.body.price,
    imageUrl = req.body.imageUrl,
    description = req.body.description;

  Product
    .findById(productId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }

      if (!errors.isEmpty()) {
        return res
          .status(422)
          .render('admin/edit-product', {
            pageTitle: 'Edit product',
            path: '/admin/add-product',
            editing: true,
            product: {
              title,
              price,
              imageUrl,
              description,
              _id: product._id.toString()
            },
            validationErrorMessages: errors.array(),
          })
      }

      product.title = title;
      product.price = price;
      product.imageUrl = imageUrl;
      product.description = description;
      return product.save()
        .then(() => res.redirect('/admin/products'))
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
}

exports.getProducts = (req, res, next) => {
  Product
    .find({
      userId: req.user._id
    })
    .then(products => {
      res.render('admin/product-list', {
        products: products,
        pageTitle: 'Admin Products',
        path: 'admin/products'
      })
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
}

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product
    .deleteOne({
      _id: productId,
      userId: req.user._id
    })
    .then(() => res.redirect('/admin/products'))
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
}