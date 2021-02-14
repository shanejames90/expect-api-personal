// require necessary NPM packages
const express = require('express')

const mongoose = require('mongoose')
const cors = require('cors')
const Stripe = require('stripe')
const stripe = Stripe('pk_test_51IGG1MDasmd3qX8mMpTrcfFUbG2xcShhNCfipryyGy67xV2rxVZqWbpDKdaeKeOcbnj6uXURGMb99uTveO42H3tz00K8CLS87d')

// require route files
const purchaseRoutes = require('./app/routes/purchase_routes')
const userRoutes = require('./app/routes/user_routes')

// require middleware
const errorHandler = require('./lib/error_handler')
const requestLogger = require('./lib/request_logger')

// require database configuration logic
// `db` will be the actual Mongo URI as a string
const db = require('./config/db')

// require configured passport authentication middleware
const auth = require('./lib/auth')

// define server and client ports
// used for cors and local port declaration
const serverDevPort = 4741
const clientDevPort = 7165

// establish database connection
// use new version of URL parser
// use createIndex instead of deprecated ensureIndex
mongoose.connect(db, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
})

// instantiate express application object
const app = express()

// set CORS headers on response from this API using the `cors` NPM package
// `CLIENT_ORIGIN` is an environment variable that will be set on Heroku
// app.use(cors({ origin: process.env.CLIENT_ORIGIN || `http://localhost:${clientDevPort}` || stripe }))
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' || stripe }))

// define port for API to run on
const port = process.env.PORT || serverDevPort

// register passport authentication middleware
app.use(auth)

// add `express.json` middleware which will parse JSON requests into
// JS objects before they reach the route files.
// The method `.use` sets up middleware for the Express application
app.use(express.json())
// this parses requests sent by `$.ajax`, which use a different content type
app.use(express.urlencoded({ extended: true }))

// log each request as it comes in for debugging
app.use(requestLogger)

// register route files
app.use(purchaseRoutes)
app.use(userRoutes)

// register error handling middleware
// note that this comes after the route middlewares, because it needs to be
// passed any error messages from them
app.use(errorHandler)

app.use(express.static('.'))

const domain = 'http://localhost:7165/checkout'

// this creates a stripe session(checkout session for client side)
app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'tour'
          },
          unit_amount: 2000
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: `${domain}?success=true`,
    cancel_url: `${domain}?canceled=true`
  })
  res.json({ id: session.id })
})

// run API on designated port (4741 in this case)
app.listen(port, () => {
  console.log('listening on port ' + port)
})

// needed for testing
module.exports = app
