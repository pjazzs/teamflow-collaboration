const express = require("express");

const { registerUser, loginUser } = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Temporary protected route for authentication testing
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user.toJSON(),
    },
  });
});

module.exports = router;
