const mongoose = require('mongoose')

const purchaseSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  comment: {
    type: String,
    required: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toObject: {
    // remove `hashedPassword` field when we call `.toObject`
    transform: (_doc, purchase) => {
      return {
        id: purchase._id,
        location: purchase.location,
        date: purchase.date.toDateString(),
        price: purchase.price,
        comment: purchase.comment
      }
    }
  }
})

module.exports = mongoose.model('Purchase', purchaseSchema)
