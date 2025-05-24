// This throws an intentional error
const triggerError = (req, res, next) => {
    try {
      throw new Error("Intentional 500-type error!")
    } catch (err) {
      next(err) // Pass it to the error handler middleware
    }
  }
  
  module.exports = { triggerError }