const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add product',
    path: '/admin/add-product',
    editing: false
  })
}

exports.postAddProduct = (req, res) => {
  const title = req.body.title,
    price = +req.body.price,
    imageUrl = req.body.imageUrl,
    description = req.body.description;

  req
    .user
    .createProduct({
      title,
      price,
      imageUrl,
      description
    })
    .then(result => res.redirect('/admin/products'))
    .catch(err => console.log(err));
}

exports.getEditProduct = (req, res) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const productId = req.params.productId;
  req
    .user
    .getProducts({
      where: {
        id: productId
      }
    })
    .then(products => {
      const product = products[0];
      if (!product) res.redirect('/admin/products')
      res.render('admin/edit-product', {
        pageTitle: 'Add product',
        path: '/admin/add-product',
        editing: true,
        product: product
      })
    })
    .catch(err => console.log(err));
}

exports.postEditProduct = (req, res) => {
  const
    productId = req.body.productId,
    updatedTitle = req.body.title,
    updatedPrice = req.body.price,
    updatedImageUrl = req.body.imageUrl,
    updatedDescription = req.body.description;

  Product
    .findById(productId)
    .then(product => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.imageUrl = updatedImageUrl;
      product.description = updatedDescription;
      return product.save();
    })
    .then(() => res.redirect('/admin/products'))
    .catch(err => console.log(err));
}

exports.getProducts = (req, res) => {
  req
    .user
    .getProducts()
    .then(products => {
      res.render('admin/product-list', {
        products: products,
        pageTitle: 'Admin Products',
        path: 'admin/products'
      })
    })
    .catch(err => console.log(err));
}

exports.postDeleteProduct = (req, res) => {
  const productId = req.body.productId;
  Product
    .findById(productId)
    .then(product => {
      return product.destroy();
    })
    .then(() => res.redirect('/admin/products'))
    .catch(err => console.log(err));
}