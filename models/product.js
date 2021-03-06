const path = require('path');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

productSchema.pre('save', function () {
  if (this.isModified('imageUrl')) {
    this.imageUrl = '/' + this.imageUrl.split(path.sep).join('/')
  }
})

module.exports = mongoose.model('Product', productSchema);