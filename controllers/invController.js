const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build item detail view by inv_id
 * ************************** */
invCont.buildItemDetails = async function (req, res, next) {
  const inv_id = req.params.invId
  const itemData = await invModel.getDetailsByInventoryId(inv_id)
  let nav = await utilities.getNav()

  if (itemData && itemData.length > 0) {
    const item = itemData[0]
    res.render("./inventory/item", {
      title: `${item.inv_make} ${item.inv_model}`,
      nav,
      item
    })
  } else {
    res.render("./inventory/item", {
      title: "Item not found",
      nav,
      item: null
    })
  }
}


module.exports = invCont