const express = require("express")
const router = new express.Router()
const errorController = require("../controllers/errorController")

router.get("/error", errorController.triggerError)

module.exports = router