/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities/")
const errorRoute = require("./routes/errorRoute")
const session = require("express-session")
const pool = require('./database/')
const accountRoute = require("./routes/accountRoute")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const reviewRoute = require("./routes/reviewRoute")

/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// serve static files like favicon
app.use(express.static("public"))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

app.use(cookieParser())

app.use(utilities.checkJWTToken)


// code to try to update account firstname to the header.ejs view when the account data is updated.
app.use((req, res, next) => {
  res.locals.accountData = req.session.accountData || null;
  res.locals.user = req.session.accountData || null; // full user object for views like /account
  res.locals.loggedin = req.session.loggedin || false; // boolean for header
  next();
});

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static)

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)

// Account routes
app.use("/account", accountRoute);

// Review routes
app.use("/reviews", reviewRoute);
  
// Error route - for the one in the footer
app.use("/errors", errorRoute)

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})




/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)

  let title
  let message

  if (err.status == 404) {
    title = "404 - Page Not Found"
    message = err.message
  } else {
    title = "500-type Server Error"
    message = 'Oh no! There was a crash. Maybe try a different route?'
  }

  res.render("errors/error", {
    title,
    message,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})

app.get('/robots.txt', (req, res) => {
  res.type('text/plain')
  res.send('User-agent: *\nDisallow:')
})

app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).send() // No Content
})