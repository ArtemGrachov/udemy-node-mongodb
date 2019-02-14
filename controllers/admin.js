const Product = require('../models/product');
const fileHelper = require('../util/file');
const paginationHelper = require('../util/pagination');
const { validationResult } = require('express-validator/check');

const ITEMS_PER_PAGE = 2;

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
    image = req.file,
    description = req.body.description;

  const errorsArr = [];

  if (!image) {
    errorsArr.push({ msg: 'Attached file is not and image' });
  }

  if (!errors.isEmpty()) {
    errorsArr = errorsArr.concat(errors.array)
  }

  if (errorsArr.length) {
    return res
      .status(422)
      .render('admin/edit-product', {
        pageTitle: 'Add product',
        path: '/admin/add-product',
        editing: false,
        oldValue: {
          title,
          price,
          description
        },
        validationErrorMessages: errorsArr
      })
  }

  const imageUrl = image.path;

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
    image = req.file,
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
              description,
              _id: product._id.toString()
            },
            validationErrorMessages: errors.array(),
          })
      }

      product.title = title;
      product.price = price;
      if (image) {
        fileHelper.deleteFile(image.path);
        product.imageUrl = image.path;
      }
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
  const currentPage = +req.query.page || 1;
  let totalProducts;
  Product
    .find({
      userId: req.user._id
    })
    .countDocuments()
    .then(
      productsCount => {
        totalProducts = productsCount;
        return Product
          .find({
            userId: req.user._id
          })
          .skip((currentPage - 1) * ITEMS_PER_PAGE)
          .limit(ITEMS_PER_PAGE)
      }
    )
    .then(products => {
      res.render('admin/product-list', {
        products: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        pagination: paginationHelper.paginationFactory(totalProducts, ITEMS_PER_PAGE, currentPage)
      })
    })
    .catch(err => {
      const error = new Error(err);
      console.log(err)
      error.httpStatusCode = 500;
      next(error);
    });
}

exports.deleteProduct = (req, res, next) => {
  const productId = req.params.productId;

  Product
    .findById(productId)
    .then(product => {
      if (!product) return next(new Error('Product not found'));
      fileHelper.deleteFile(product.imageUrl);
      return product.remove();
    })
    .then(() => {
      res.status(200).json({
        message: 'Success!'
      });
    })
    .catch(err => {
      res.status(500).json({
        message: 'Deleting product failed.'
      });
    });
}