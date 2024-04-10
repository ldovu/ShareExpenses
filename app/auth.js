const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("./db.js");
const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { username, password, name, surname } = req.body;
    const mongo = await db.connectToDatabase();
    const user = await mongo.collection("users").findOne({ username });
    console.log(user);
    if (user) {
      res.status(409).json({ msg: "User already exists" });
    } else {
      // consider doing the hash of the password
      const newUser = { username, password, name, surname };
      await mongo.collection("users").insertOne(newUser);
      res.json({ msg: "User created successfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal error" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const mongo = await db.connectToDatabase();
    const user = await mongo.collection("users").findOne({ username });
    console.log(user);
    if (user && user.password === password && user.username === username) {
      const data = { id: user.id };
      const token = jwt.sign(data, "secret signature", {
        expiresIn: 86400,
      });
      res.cookie("token", token, { httpOnly: true }); //nessuno può rubarmi il cookie, perchè ho messo httpOnly: true
      res.json({
        msg: "The authentication was successful",
      });
    } else {
      res.status(401).json({ msg: "Wrong username or password" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Internal error" });
  }
});
