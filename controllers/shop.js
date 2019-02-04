const
  Product = require('../models/product');

exports.getProducts = (req, res) => {
  Product
    .find()
    .then(products => {
      res.render('shop/product-list', {
        products: products,
        pageTitle: 'All products',
        path: '/'
      })
    })
};

exports.getProduct = (req, res) => {
  const productId = req.params.productId;

  Product.findById(productId)
    .then(product => {
      res.render('shop/product-detail', {
        pageTitle: product.title,
        path: '/products',
        product: product
      })
    })
    .catch(err => console.log(err));
}

exports.getIndex = (req, res) => {
  Product
    .find()
    .then(products => {
      res.render('shop/product-list', {
        products: products,
        pageTitle: 'All products',
        path: '/'
      })
    })
};

exports.getCart = (req, res) => {
  req
    .user
    .populate('cart.items.product')
    .execPopulate()
    .then(user => {
      res.render('shop/cart', {
        pageTitle: 'Your cart',
        path: 'shop/cart',
        products: user.cart.items
      });
    })
    .catch(err => console.log(err));
};

exports.getCheckout = (req, res) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: 'shop/checkout'
  });
};

exports.postCart = (req, res) => {
  const productId = req.body.productId;
  Product
    .findById(productId)
    .then(product => req.user.addToCart(product))
    .then(result => res.redirect('/cart'))
    .catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res) => {
  const productId = req.body.productId;
  req
    .user
    .removeFromCart(productId)
    .then(result => res.redirect('/cart'))
    .catch(err => console.log(err))
}

exports.postOrder = (req, res) => {
  req
    .user
    .addOrder()
    .then(result => res.redirect('/orders'))
    .catch(err => console.log(err))
}

exports.getOrders = (req, res) => {
  req
    .user
    .getOrders()
    .then(orders => {
      res.render('shop/orders', {
        pageTitle: 'Orders',
        path: 'shop/orders',
        orders: orders
      });
    })
    .catch(err => console.log(err));
};