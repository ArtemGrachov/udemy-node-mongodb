const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class User {
  constructor(
    name,
    email,
    cart,
    id
  ) {
    this.name = name;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }

  save() {
    const db = getDb();
    return db
      .collection('users')
      .insertOne(this)
      .catch(err => console.log(err));
  }

  addToCart(product) {
    const cartProductIndex = this
      .cart
      .items
      .findIndex(
        item => item.productId.toString() === product._id.toString()
      );
    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex !== -1) {
      updatedCartItems[cartProductIndex].quantity = this.cart.items[cartProductIndex].quantity + 1
    } else {
      updatedCartItems.push({
        productId: new mongodb.ObjectId(product._id),
        quantity: 1
      })
    }

    const updatedCart = {
      items: updatedCartItems
    };
    const db = getDb();
    return db
      .collection('users')
      .updateOne({
        _id: new mongodb.ObjectId(this._id)
      }, {
        $set: {
          cart: updatedCart
        }
      })
  }

  static findById(userId) {
    const db = getDb();
    return db
      .collection('users')
      .findOne({
        _id: new mongodb.ObjectId(userId)
      })
      .catch(err => console.log(err))
  }
}

module.exports = User;