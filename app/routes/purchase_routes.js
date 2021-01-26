const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in error types and the logic to handle them and set status codes
const errors = require('../../lib/custom_errors')

const handle404 = errors.handle404

const Purchase = require('../models/purchase')

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `res.purchase`
const requireToken = passport.authenticate('bearer', { session: false })

const requireOwnership = errors.requireOwnership

// instantiate a router (mini app that only handles routes)
const router = express.Router()

//
// POST /purchase
router.post('/purchases', requireToken, (req, res, next) => {
  // set owner of new purchase to be the current owner
  req.body.purchase.owner = req.user.id

  Purchase.create(req.body.purchase)
    // respond to successful `create` with status code 201 and JSON of purchase
    .then(purchase => {
      res.status(201).json({ purchase: purchase.toObject() })
    })
    // catch any errors
    .catch(next)
})

// INDEX
// GET /purchases
router.get('/purchases', requireToken, (req, res, next) => {
  Purchase.find({ owner: req.user._id })
    .then(purchases => {
      // `purchases` will be an array of Mongoose documents
      // we want to convert to POJO, then .map
      return purchases.map(purchase => purchase.toObject())
    })
    .then(purchases => res.status(200).json({ purchases: purchases }))
    // catch any errors
    .catch(next)
})

// SHOW
// GET /purchases/:id
router.get('/purchases/:id', requireToken, (req, res, next) => {
  const id = req.params.id

  Purchase.find({ owner: req.user._id, _id: id })
    .then(handle404)
    // if `findById` is successful, respond with 200 and "purchase" JSON
    .then(task => res.status(200).json({ task: task }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// update purchase (comment on it)
// PATCH /puchases/:id
router.patch('/purchases/:id', requireToken, (req, res, next) => {
  const id = req.params.id
  const purchaseData = req.body.purchase
  delete purchaseData.owner
  delete purchaseData.location
  delete purchaseData.date
  delete purchaseData.price
  // `req.purchase` will be determined by decoding the token payload
  Purchase.findOne({ _id: id })
    .then(errors.handle404)
    .then(purchase => {
      purchase.updateOne(purchaseData)
    })

    // respond with no content and status 200
    .then(() => res.sendStatus(204))
    // pass any errors along to the error handler
    .catch(next)
})

router.delete('/purchase/:id', requireToken, (req, res, next) => {
  Purchase.findOne({ _id: req.params.id })
    .then(handle404)
    .then(purchase => {
      // throw an error if current user doesn't own `purchase`
      requireOwnership(req, purchase)
      // delete the purchase ONLY IF the above didn't throw
      purchase.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
