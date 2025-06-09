const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  // console.log(data)
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the item details view HTML
* ************************************ */
Util.buildItemDetailsView = async function(item) {
  let details = ""

  if (item) {
    details += '<div class="item-details">'
    // Mobile thumbnail image
    details += `<img src="${item.inv_thumbnail}" alt="Thumbnail of ${item.inv_make} ${item.inv_model}" class="thumbnail-img">`

    // Desktop full-size image
    details += `<img src="${item.inv_image}" alt="Image of ${item.inv_make} ${item.inv_model}" class="full-img">`

    details += `<ul>`
    details += `<li><strong>Make:</strong> ${item.inv_make}</li>`
    details += `<li><strong>Model:</strong> ${item.inv_model}</li>`
    details += `<li><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(item.inv_price)}</li>`
    details += `<li><strong>Description:</strong> ${item.inv_description}</li>`
    details += `<li><strong>Color:</strong> ${item.inv_color}</li>`
    details += `<li><strong>Mileage:</strong> ${new Intl.NumberFormat('en-US').format(item.inv_miles)} miles</li>`
    details += `</ul>`
    details += `</div>`
  } else {
    details += '<p class="notice">Sorry, no matching vehicle data could be found.</p>'
  }

  return details
}

/* **************************************
* Build Classification List
* ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classification_id" required>';
  classificationList += "<option value=''>Choose a Classification</option>";

  data.rows.forEach((row) => {
    let selected = "";
    if (classification_id != null && row.classification_id == classification_id) {
      selected = " selected";
    }
    classificationList += `<option value="${row.classification_id}"${selected}>${row.classification_name}</option>`;
  });

  classificationList += "</select>";
  return classificationList;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("error", "Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        res.locals.user = accountData
        next()
      }
    )
  } else {
    res.locals.user = null // Prevents undefined error in EJS
    next()
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin || req.session.loggedin) {
    res.locals.loggedin = true;
    res.locals.account_id = req.session.account_id; // ✅ Add this line
    res.locals.accountData = req.session.accountData; // Optional: if you store full account data
    next();
  } else {
    const message = "Please log in.";
    req.flash("notice", message);
    return res.redirect("/account/login");
  }
};


/* ****************************************
 *  Check if Employee or Admin is logged in
 * ************************************ */
Util.checkEmployeeOrAdmin = (req, res, next) => {
  const accountData = res.locals.accountData

  if (res.locals.loggedin && accountData) {
    if (["Admin", "Employee"].includes(accountData.account_type)) {
      return next()
    } else {
      req.flash("notice", "Access denied. Employee or Admin account required.")
      return res.redirect("/account/")
    }
  } else {
    req.flash("notice", "Please log in with an Employee or Admin account.")
    return res.redirect("/account/login")
  }
}


module.exports = Util