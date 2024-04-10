const express = require("express");
const cookieParser = require("cookie-parser");
const router = require("./route.js");
const auth = require("./auth.js");
const app = express("");

app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
app.use("/api/expenses", router);
app.use("/api/auth", auth);

app.listen(3000, () => {
  console.log("Web server started");
});
