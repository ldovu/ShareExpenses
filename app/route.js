/* 
    file per recuperare le credenziali dal database:
    nelle funzioni che creerò scriverò
    const mongo = await db.connectToDatabase(); 
    e mongo sarà il mio database che ho creato su
    db.js
*/

const express = require("express");
const jwt = require("jsonwebtoken");
const ObjectId = require("mongodb").ObjectId;
const router = express.Router();
const db = require("./db.js");

const verifyToken = (req, res, next) => {
  const token = req.cookies["token"];
  if (!token) {
    res.status(403).json({ msg: "Failed authentication" });
    return;
  }
  try {
    const decoded = jwt.verify(token, "secret signature");
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Unauthorized" });
  }
};
