const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

//Save it as a Environment Variable or in a config file
const JWT_SECRET = "skyrunner@360";

// ROUTE 1: Create a user using: POST "/api/auth/createuser". Doesn't require Auth
router.post(
  "/createuser",
  [
    body("name", "Enter a Valid Name").isLength({ min: 3 }),
    body("email", "Enter a Valid EmailID").isEmail(),
    body("password", "Your password is too short").isLength({ min: 5 }),
  ],
  async (req, res) => {
    //If their are errors, return Bad request and the error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      // Check whether the user with this email exists already
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry a user with this email already exists" });
      }
      //Using bcryptjs to create and use salt.
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });
      
      const data = {
        user:{
          id: user.id
        }
      }
      const authtoken = jwt.sign(data, JWT_SECRET);

      //   .then(user => res.json(user))
      //   .catch(err=>{console.log(err)
      // res.json({error: "Please Enter a Unique Value for Email", message: err.message})});
      res.json({authtoken});
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server error");
    }
  }
);

// ROUTE 2: Authenticate a User using POST "/api/auth/login", No Login Required
router.post(
  "/login",
  [
    body("email", "Enter a Valid EmailID").isEmail(),
    body("password", "Password Cannot be Blank").exists(),
  ],
  async (req, res) => {

    //If their are errors, return Bad request and the error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {email, password} = req.body;
    try {
      let user = await User.findOne({email});
      if(!user){
        return res.status(400).json({error: "Please try to login with correct credentials!"});
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if(!passwordCompare){
        return res.status(400).json({error: "Please try to login with correct credentials!"});
      }
      const data = {
        user:{
          id: user.id
        }
      }
      const authtoken = jwt.sign(data, JWT_SECRET);
      res.json({authtoken});
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server error");
    }
  }
  );
  //ROUTE 3: Get loggedIn User Details using: POST "/api/auth/getuser". Login Required
  router.post(
    "/getuser", fetchuser,    async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server error");
  }
}
  );

module.exports = router;