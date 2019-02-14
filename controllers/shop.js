const
  fs = require('fs'),
  path = require('path'),
  PDFDocument = require('pdfkit'),
  Product = require('../models/product'),
  Order = require('../models/order'),
  paginationHelper = require('../util/pagination');

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res) => {
  const currentPage = +req.query.page || 1;
  let totalProducts;

  Product
    .find()
    .countDocuments()
    .then(
      productsCount => {
        totalProducts = productsCount;
        return Product
          .find()
          .skip((currentPage - 1) * ITEMS_PER_PAGE)
          .limit(ITEMS_PER_PAGE)
      }
    )
    .then(products => {
      res.render('shop/product-list', {
        products: products,
        pageTitle: 'All products',
        path: '/products',
        pagination: paginationHelper.paginationFactory(totalProducts, ITEMS_PER_PAGE, currentPage)
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
  const currentPage = +req.query.page || 1;
  let totalProducts;

  Product
    .find()
    .countDocuments()
    .then(
      productsCount => {
        totalProducts = productsCount;
        return Product
          .find()
          .skip((currentPage - 1) * ITEMS_PER_PAGE)
          .limit(ITEMS_PER_PAGE)
      }
    )
    .then(products => {
      res.render('shop/index', {
        products,
        pageTitle: 'All products',
        path: '/',
        currentPage,
        totalProducts,
        pagination: paginationHelper.paginationFactory(totalProducts, ITEMS_PER_PAGE, currentPage)
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

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order
  .findById(orderId)
  .then(order => {
    if (!order) {
      const err = new Error('No order found.');
      err.httpStatusCode = 404;
      return next(err);
    }

    if (order.user.userId.toString() !== req.user._id.toString()) {
      const err = new Error('Unauthorized');
      err.httpStatusCode = 401;
      return next(err);
    }

    const invoiceName = `invoice-${orderId}.pdf`;
    const invoicePath = path.join('data', 'invoices', invoiceName);

    const pdfDoc = new PDFDocument();
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);
    
    pdfDoc
      .fontSize(26)
      .text('Invoice', {
        underline: true
      });

    let totalPrice = 0;

    pdfDoc
      .fontSize(14)
      .moveDown()

    order.products.forEach(orderItem => {
      pdfDoc.text(`${orderItem.product.title} - ${orderItem.quantity} x $${orderItem.product.price}`)
      totalPrice += orderItem.quantity * orderItem.product.price;
    })

    pdfDoc.moveDown();

    pdfDoc
      .text(`Total price: $${totalPrice}`, 
      {
        align: 'right'
      })

    pdfDoc.end();
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    next(error);
  });
};

exports.getCheckout = (req, res, next) => {
  req
    .user
    .populate('cart.items.product')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      let totalSum = products.reduce((acc, curr) => acc + curr.product.price, 0);

      res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout',
        products,
        totalSum
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
}