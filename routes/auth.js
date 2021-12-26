const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Create a user using: POST "/api/auth/". Doesn't require Auth
router.post('/',[
    body('name',"Enter a Valid Name").isLength({min:3}),
    body('email', "Enter a Valid EmailID").isEmail(),
    body('password',"Your password is too short").isLength({min: 5}),
],(req,res)=>{
    //Validating
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    User.create({
        name: req.body.name,
        password: req.body.password,
        email: req.body.email,
      }).then(user => res.json(user))
      .catch(err=>{console.log(err)
    res.json({error: "Please Enter a Unique Value for Email", message: err.message})});
})

module.exports = router