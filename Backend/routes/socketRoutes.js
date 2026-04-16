const socketController = require("../controllers/socketController");
const socketAuthMiddleware = require("../middleware/authMiddleware");

module.exports = (io) => {

  socketController(io);

};