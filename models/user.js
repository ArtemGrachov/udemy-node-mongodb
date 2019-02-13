const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  cart: {
    items: [{
      product: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
      },
      quantity: {
        type: Number,
        required: true
      }
    }]
  },
  resetToken: String,
  resetTokenExpiration: Date
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this
    .cart
    .items
    .findIndex(item => item.product.toString() === product._id.toString());
  const updatedCartItems = [...this.cart.items];
  if (cartProductIndex !== -1) {
    updatedCartItems[cartProductIndex].quantity = this.cart.items[cartProductIndex].quantity + 1
  } else {
    updatedCartItems.push({
      product: product._id,
      quantity: 1
    })
  }

  const updatedCart = {
    items: updatedCartItems
  };

  this.cart = updatedCart;
  return this.save();
}

userSchema.methods.removeFromCart = function (productId) {
  this.cart.items = this.cart.items.filter(item => item.product.toString() !== productId);
  return this.save();
}

userSchema.methods.clearCart = function () {
  this.cart = {
    items: []
  };
  return this.save();
}

module.exports = mongoose.model('User', userSchema);