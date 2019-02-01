const
  Product = require('../models/product');

exports.getProducts = (req, res) => {
  Product
    .fetchAll()
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
    .findAll()
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
    .getCart()
    .then(products => {
      res.render('shop/cart', {
        pageTitle: 'Your cart',
        path: 'shop/cart',
        products: products
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
    .deleteItemFromCart(productId)
    .then(result => res.redirect('/cart'))
    .catch(err => console.log(err))
}

exports.postOrder = (req, res) => {
  let fetchedCart;
  req
    .user
    .getCart()
    .then(products => {
      return req
        .user
        .createOrder()
        .then(order => {
          return order.addProducts(
            products.map(
              product => {
                product.orderItem = {
                  quantity: product.cartItem.quantity
                };
                return product;
              }
            )
          );
        })
        .catch(err => console.log(err));
    })
    .then(result => fetchedCart.setProducts(null))
    .then(result => res.redirect('/orders'))
    .catch(err => console.log(err))
}

exports.getOrders = (req, res) => {
  req
    .user
    .getOrders({
      include: ['products']
    })
    .then(orders => {
      res.render('shop/orders', {
        pageTitle: 'Orders',
        path: 'shop/orders',
        orders: orders
      });
    })
    .catch(err => console.log(err));
};