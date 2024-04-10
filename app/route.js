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
    req.username = decoded.username;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Unauthorized" });
  }
};

router.post("/budget", verifyToken, async (res, req) => {
  const exp = {
    user: req.username,
    date: req.body.date,
    description: req.body.description,
    category: req.body.category,
    cost: req.body.cost,
    users: req.body.users,
  };
  const mongo = await db.connectToDatabase();
  const result = await mongo.collection("expenses").insertOne(exp);

  // assegna manualmente l'id nel db di mongo:
  exp._id = result.insertedId;

  res.json(exp);
});

router.get("/budget/:year", async (req, res) => {
  const mongo = await db.connectToDatabase();
});
