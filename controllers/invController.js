const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const nav = await utilities.getNav();

  // If there are no vehicles, show a message instead of crashing
  if (!data || data.length === 0) {
    return res.render("./inventory/classification", {
      title: "No Vehicles Found",
      nav,
      grid: "<p class='notice'>Sorry, there are no vehicles in this classification yet.</p>",
    });
  }

  // Now it's safe to access data[0]
  const className = data[0].classification_name;
  const grid = await utilities.buildClassificationGrid(data);

  return res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build item detail view by inv_id
 * ************************** */
invCont.buildItemDetails = async function (req, res, next) {
  const inv_id = req.params.invId;
  const itemData = await invModel.getDetailsByInventoryId(inv_id);
  let nav = await utilities.getNav();

  if (itemData && itemData.length > 0) {
    const item = itemData[0];
    res.render("./inventory/item", {
      title: `${item.inv_make} ${item.inv_model}`,
      nav,
      item,
    });
  } else {
    res.render("./inventory/item", {
      title: "Item not found",
      nav,
      item: null,
    });
  }
};

/* ***************************
 *  Build Management View
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();
  try {
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
    });
  } catch (error) {
    console.error("Error loading management view:", error);
    res.status(500).send("Server Error");
  }
};

/* ***************************
 *  Build Add New Classification View
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  try {
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      notice: req.flash("notice"),
    });
  } catch (error) {
    console.error("Error loading add classification view:", error);
    res.status(500).send("Server Error");
  }
};

/* ***************************
 *  Add New Classification (POST handler)
 * ************************** */
invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body;

  try {
    const result = await invModel.addClassification(classification_name);
    if (result) {
      const nav = await utilities.getNav();
      req.app.locals.nav = nav;
      req.flash("success", "Classification added successfully!");
      res.redirect("/inv/");
    } else {
      res.render("inventory/add-classification", {
        message: "Error: Could not add classification.",
        errors: [],
      });
    }
  } catch (err) {
    res.render("inventory/add-classification", {
      message: "Server error. Try again later.",
      errors: [],
    });
  }
};

/* ***************************
 *  Build Add New Inventory View
 * ************************** */
invCont.buildAddInventory = async function (req, res) {
  let nav = await utilities.getNav();
  const classification_id = req.body?.classification_id || "";  // get previously selected or blank
  let classificationSelect = await utilities.buildClassificationList();
  try {
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationSelect,
      notice: req.flash("notice"),
    });
  } catch (error) {
    console.error("Error loading add inventory view:", error);
    res.status(500).send("Server Error");
  }
};

/* ***************************
 *  Add New Inventory Item
 * ************************** */
invCont.addInventory = async function (req, res) {
  const nav = await utilities.getNav()

  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color
  } = req.body

  // Build image paths
  const inv_image = `/images/vehicles/no-image.png`
  const inv_thumbnail = `/images/vehicles/no-image-tn.png`

  try {
    const addResult = await invModel.addInventoryItem(
      parseInt(classification_id),
      inv_make,
      inv_model,
      parseInt(inv_year),
      inv_description,
      inv_image,
      inv_thumbnail,
      parseFloat(inv_price),
      parseFloat(inv_miles),
      inv_color
    )

    if (addResult) {
      req.flash("notice", `${inv_make} ${inv_model} was added successfully.`)
      res.redirect("/inv/management")
    } else {
      let classificationSelect = await utilities.buildClassificationList();
      req.flash("notice", "Sorry, the item could not be added.")
      res.status(500).render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationSelect,
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_price,
        inv_miles,
        inv_color
      })
    }
  } catch (error) {
    console.error("Controller error:", error)
    req.flash("notice", "An unexpected error occurred.")
    res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryItemById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  console.log("🔧 Received update request with body:", req.body);
  
  let nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

    // Optional: log individual values if you suspect any are undefined
    console.log("📦 Parsed data:", {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    });

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  );

  console.log("🧪 updateResult from invModel:", updateResult);

  if (updateResult) {
    const itemName = inv_make + " " + inv_model;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    console.log("⚠️ Update failed. Rendering edit view again.");
    const classificationSelect = await utilities.buildClassificationList(classification_id);
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
  }
};

/* ***************************
 *  Build delete inventory confirmation view
 * ************************** */
invCont.buildDeleteInventoryConfirmationView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryItemById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
    
  })
}

/* ***************************
 *  Process Delete Inventory Item
 * ************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
  const nav = await utilities.getNav();
  
  // Safely parse the ID from the form
  const inv_id = parseInt(req.body.inv_id);

  // Optional: Check for NaN just in case
  if (isNaN(inv_id)) {
    req.flash("notice", "Invalid inventory ID.");
    return res.status(400).redirect("/inv/");
  }

  try {
    // Call model to delete item
    const deleteResult = await invModel.deleteInventory(inv_id);

    if (deleteResult) {
      req.flash("notice", "The vehicle was successfully deleted.");
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Sorry, the delete failed.");
      // Redirect back to the confirmation view with same ID
      res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (error) {
    console.error("❌ Error while deleting inventory item:", error);
    req.flash("notice", "An unexpected error occurred.");
    res.redirect("/inv/");
  }
};


module.exports = invCont;
