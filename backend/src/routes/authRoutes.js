//This file defines the route for all related authentification APIs

const express = require("express");
const router = requires("router");

const {
    Login,
    SignUp
} = require ("../controllers/authController");


route.get("/",Login);
route.post("/", SignUp);


module.exports = router;
