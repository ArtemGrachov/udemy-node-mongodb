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
        path: '/',
        isAuthenticated: req.session.isLoggedIn
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
        product: product,
        isAuthenticated: req.session.isLoggedIn
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
        path: '/',
        isAuthenticated: req.session.isLoggedIn
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
        products: user.cart.items,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.getCheckout = (req, res) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: 'shop/checkout',
    isAuthenticated: req.session.isLoggedIn
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
          name: req.user.name,
          userId: req.user._id
        },
        products: products
      })
      return order.save()
    })
    .then(result => req.user.clearCart())
    .then(result => res.redirect('/orders'))
    .catch(err => console.log(err))
}

exports.getOrders = (req, res) => {
  Order.find({
      'user.userId': req.user._id
    })
    .then(orders => {
      res.render('shop/orders', {
        pageTitle: 'Orders',
        path: 'shop/orders',
        isAuthenticated: req.session.isLoggedIn,
        orders
      });
    })
    .catch(err => console.log(err));
};