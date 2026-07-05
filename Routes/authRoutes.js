const express = require("express");
const router = express.Router();
const { signup, login, getMe } = require("../Controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const passport = require("passport");
const jwt = require("jsonwebtoken")
const passportr = require("../Config/passport");   

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=failed`,
    session: false,
  }),
  (req, res) => {

     console.log("Google callback hit!"); 
    console.log("User:", req.user);  

    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",}
    );
   res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}&name=${encodeURIComponent(req.user.name)}`);


},
);


router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe); 

module.exports = router;
