const
  Product = require('../models/product'),
  Order = require('../models/order');

exports.getProducts = (req, res) => {
  Product
    .find()
    .then(products => {
      res.render('shop/product-list', {
        products: products,
        pageTitle: 'All products',
        path: '/products'
      })
    })
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;

  Product.findById(productId)
    .then(product => {
      res.render('shop/product-detail', {
        pageTitle: product.title,
        path: '/products',
        product: product
      })
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
}

exports.getIndex = (req, res, next) => {
  Product
    .find()
    .then(products => {
      res.render('shop/product-list', {
        products: products,
        pageTitle: 'All products',
        path: '/'
      })
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getCart = (req, res, next) => {
  req
    .user
    .populate('cart.items.product')
    .execPopulate()
    .then(user => {
      res.render('shop/cart', {
        pageTitle: 'Your cart',
        path: '/cart',
        products: user.cart.items
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product
    .findById(productId)
    .then(product => req.user.addToCart(product))
    .then(result => res.redirect('/cart'))
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  req
    .user
    .removeFromCart(productId)
    .then(result => res.redirect('/cart'))
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
}

exports.postOrder = (req, res, next) => {
  req
    .user
    .populate('cart.items.product')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(item => {
        return {
          quantity: item.quantity,
          product: {
            ...item.product._doc
          }
        }
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user._id
        },
        products: products
      })
      return order.save()
    })
    .then(result => req.user.clearCart())
    .then(result => res.redirect('/orders'))
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
}

exports.getOrders = (req, res, next) => {
  Order.find({
      'user.userId': req.user._id
    })
    .then(orders => {
      res.render('shop/orders', {
        pageTitle: 'Orders',
        path: '/orders',
        orders
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};