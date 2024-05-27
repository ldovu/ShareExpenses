const express = require("express");
const fs = require("fs/promises");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const db = require("./db.js");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.static(`${__dirname}/public`));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded());


// Function for signing up
app.post("/api/auth/signup", async (req, res) => {
  const mongo = await db.connectToDatabase();
  const existingUser = await mongo
    .collection("users")
    .findOne({ username: req.body.username });
  if (existingUser) {
    res.status(409).json({ message: "Username already exists" });
  } else if (
    req.body.username !== "" &&
    req.body.name !== "" &&
    req.body.surname !== "" &&
    req.body.password !== ""
  ) {
    const newUser = {
      name: req.body.name,
      surname: req.body.surname,
      username: req.body.username,

      password: req.body.password,
    };
    await mongo.collection("users").insertOne(newUser);
    res.status(200).json({ message: "User created successfully" });
  } else {
    res.status(400).json({ message: "Invalid fields" });
  }
});

// Function for signing in 
app.post("/api/auth/signin", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Insert username and password!" });
    }

    const mongo = await db.connectToDatabase();
    const user = await mongo.collection("users").findOne({ username });
    console.log(user);
    if (user && user.username === username && user.password === password) {
      const data = { username: user.username };
      const token = jwt.sign(data, "secret signature", {
        expiresIn: 86400,
      });

      res.cookie("token", token, { httpOnly: true }); //nessuno può rubarmi il cookie, perchè ho messo httpOnly: true
      res.json({
        message: "The authentication was successful",
      });
    } else {
      res.status(401).json({ message: "Wrong username or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal error" });
  }
});

// Verify if user is authenticated
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

// Get all the expense of the logged user
app.get("/api/budget", verifyToken, async (req, res) => {
  try {
    const username = req.username;
    const mongo = await db.connectToDatabase();
    const expenses = await mongo
      .collection("expenses")
      .find({
        $or: [
          { "userList.payer.user": username },
          { "userList.splits": { $elemMatch: { user: username } } },
        ],
      })
      .toArray();
    res.json(expenses);
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ msg: error.message });
  }
});

// Get the expenses of the logged user for the specified year
app.get("/api/budget/:year", verifyToken, async (req, res) => {
  try {
    const mongo = await db.connectToDatabase();
    const username = req.username;
    const year = req.params.year;
    const expenses = await mongo
      .collection("expenses")
      .find({
        $and: [
          {
            $or: [
              { "userList.payer.user": username },
              { "userList.splits": { $elemMatch: { user: username } } },
            ],
          },
          { year: year },
        ],
      })
      .toArray();

    res.json(expenses);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal error" });
  }
});

// Get the expenses of the logged user for the specified year and month
app.get("/api/budget/:year/:month", verifyToken, async (req, res) => {
  try {
    const mongo = await db.connectToDatabase();
    const username = req.username;
    const year = req.params.year;
    const month = req.params.month;
    const expenses = await mongo
      .collection("expenses")
      .find({
        $and: [
          {
            $or: [
              { "userList.payer.user": username },
              { "userList.splits": { $elemMatch: { user: username } } },
            ],
          },
          { year: year },
          { month: month },
        ],
      })
      .toArray();

    res.json(expenses);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal error" });
  }
});


// Extra function for getting the expenses of the logged user by year, month and id
app.get("/api/budget/:year/:month/:id", async (req, res) => {
  try {
    const mongo = await db.connectToDatabase();
    const year = req.params.year;
    const month = req.params.month;
    const id = req.params.id;
    const expenses = await mongo
      .collection("expenses")
      .find({
        year: year,
        month: month,
        _id: new ObjectId(id),
      })
      .toArray();

    res.json(expenses);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal error" });
  }
});

// Extra function for getting the expenses of the logged user by year and id
app.get("/api/extraFunction1/:year/:id", verifyToken, async (req, res) => {
  try {
    const mongo = await db.connectToDatabase();
    const username = req.username;
    const year = req.params.year;
    const id = req.params.id;
    const expenses = await mongo
      .collection("expenses")
      .find({
        $and: [
          {
            $or: [
              { "userList.payer.user": username },
              { "userList.splits": { $elemMatch: { user: username } } },
            ],
          },
          { year: year },
          { _id: new ObjectId(id) },
        ],
      })
      .toArray();

    res.json(expenses);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal error" });
  }
});

// Extra function for getting the expenses of the logged user by month and id
app.get("/api/extraFunction2/:month/:id", verifyToken, async (req, res) => {
  try {
    const mongo = await db.connectToDatabase();
    const username = req.username;
    const month = req.params.month;
    const id = req.params.id;
    const expenses = await mongo
      .collection("expenses")
      .find({
        $and: [
          {
            $or: [
              { "userList.payer.user": username },
              { "userList.splits": { $elemMatch: { user: username } } },
            ],
          },
          { month: month },
          { _id: new ObjectId(id) },
        ],
      })
      .toArray();

    res.json(expenses);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal error" });
  }
});

// Extra function for getting the expenses of the logged user by month
app.get("/api/extraFunction3/:month", verifyToken, async (req, res) => {
  try {
    const mongo = await db.connectToDatabase();
    const username = req.username;
    const month = req.params.month;
    const expenses = await mongo
      .collection("expenses")
      .find({
        $and: [
          {
            $or: [
              { "userList.payer.user": username },
              { "userList.splits": { $elemMatch: { user: username } } },
            ],
          },
          { month: month },
        ],
      })
      .toArray();

    res.json(expenses);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal error" });
  }
});

// Extra function for getting the expenses of the logged user by id
app.get("/api/extraFunction4/:id", verifyToken, async (req, res) => {
  try {
    const mongo = await db.connectToDatabase();
    const username = req.username;
    const id = req.params.id;
    const expenses = await mongo
      .collection("expenses")
      .find({
        $and: [
          {
            $or: [
              { "userList.payer.user": username },
              { "userList.splits": { $elemMatch: { user: username } } },
            ],
          },
          { _id: new ObjectId(id) },
        ],
      })
      .toArray();

    res.json(expenses);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal error" });
  }
});

// Add an expense for the specified year and month
app.post("/api/budget/:year/:month/", async (req, res) => {
  try {
    const year = req.params.year;
    const month = req.params.month;
    const day = req.body.day;
    const description = req.body.description;
    const category = req.body.category;
    const totalCost = req.body.totalCost;
    const userList = req.body.usersList;

    if (
      !year ||
      year == "" ||
      !month ||
      month == "" ||
      !day ||
      !description ||
      !category ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return res.status(400).json({ message: "All fields must be filled" });
    }
    const mongo = await db.connectToDatabase();
    const expense = {
      year,
      month,
      day,
      description,
      category,
      totalCost,
      userList,
    };
    result = await mongo.collection("expenses").insertOne(expense);
    console.log(result);
    return { message: "Expense created successfully" };
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal error" });
  }
});

// Modify an expense for the specified year and month
app.put("/api/budget/:year/:month/:id", verifyToken, async (req, res) => {
  try {
    const year = req.params.year;
    const month = req.params.month;
    const id = req.params.id;

    const day = req.body.day;
    const description = req.body.description;
    const category = req.body.category;
    const totalCost = req.body.totalCost;
    const userList = req.body.usersList;

    if (
      !day ||
      !description ||
      !category ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return res.status(400).json({ message: "All fields must be filled" });
    }

    const mongo = await db.connectToDatabase();
    const result = await mongo.collection("expenses").updateOne(
      {
        _id: new ObjectId(id),
        year: year,
        month: month,
      },
      { $set: { day, description, category, totalCost, userList } } // update the expense with the new values
    );
    if (result.modifiedCount === 1) {
      res
        .status(200)
        .json({ message: "Expense updated successfully", result: result });
    } else {
      res.status(404).json({
        message: "Expense not found",
        modifiedCount: result.modifiedCount,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal error" });
  }
});

// Delete the expense for the specified year, month and id 
app.delete("/api/budget/:year/month/:id", verifyToken, async (req, res) => {
  try {
    const mongo = await db.connectToDatabase();
    const year = req.params.year;
    const month = req.params.month;
    const id = req.params.id;
    const result = await mongo
      .collection("expenses")
      .deleteOne({ _id: new ObjectId(id), year: year, month: month });
    if (result.deletedCount === 0) {
      res.status(404).json({ msg: "Expense not found" });
    } else {
      res.json({ msg: "Expense deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Internal error" });
  }
});


// Get the overall balance of the logged user
app.get("/api/balance", verifyToken, async (req, res) => {
  try {
    const user = req.username;
    const mongo = await db.connectToDatabase();
    const expenses = await mongo
      .collection("expenses")
      .find({
        $or: [
          { "userList.payer.user": user },
          { "userList.splits": { $elemMatch: { user: user } } },
        ],
      })
      .toArray();

    let credits = 0;
    let debits = 0;
    // per tutte le spese, se l'utente loggato è colui che ha pagato
    // allora sommo le quote degli utenti della spesa al credito
    // altrimenti sommo le quote dell'utente loggato al debito
    // laddove è presente nella lista degli splits
    expenses.forEach((expense) => {
      if (expense.userList.payer.user === user) {
        credits += expense.userList.splits.reduce(
          (total, split) => total + split.quote,
          0
        );
      } else {
        debits += expense.userList.splits.reduce(
          (total, split) => (split.user === user ? total + split.quote : total),
          0
        );
      }
    });
    const balance = credits - debits;
    res.json({ expenses, debits, credits, balance });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal error" });
  }
});

// Get the balance between the logged user and another user
app.get("/api/balance/:id", verifyToken, async (req, res) => {
  try {
    const user = req.username;
    const otherUserId = req.params.id;
    const mongo = await db.connectToDatabase();
    const otherUserName = await mongo.collection("users").findOne({
      _id: new ObjectId(otherUserId),
    });
    const otherUserUsername = otherUserName.username;
    const expenses = await mongo
      .collection("expenses")
      .find({
        $or: {
          $and: [
            { "userList.payer.user": user },
            { "userList.splits": { $elemMatch: { user: otherUserUsername } } },
          ],
          $and: [
            { "userList.payer.user": otherUserUsername },
            { "userList.splits": { $elemMatch: { user: user } } },
          ],
        },
      })
      .toArray();

    res.json({ expenses });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal error" });
  }
});

// Get all the users that contain the query in the username
app.get("/api/users/search", async (req, res) => {
  try {
    const user = req.query.q;
    const mongo = await db.connectToDatabase();
    const users = await mongo.collection("users").find().toArray();
    //.findOne({ username: user });

    let result = users.find((u) =>
      u.username.toLowerCase().startsWith(user.toLowerCase())
    );

    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ msg: "User not found" });
    }
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ msg: "Internal error", error: error.toString() });
  }
});

// funziona non con budget ma con try.. problemi di routing

// Get all the expenses that contain the query in the description or category
app.get("/api/try/search", verifyToken, async (req, res) => {
  try {
    const query = req.query.q;
    const user = req.username;
    const mongo = await db.connectToDatabase();
    const expenses = await mongo
      .collection("expenses")
      .find({
        $or: [
          { "userList.payer.user": user },
          { "userList.splits": { $elemMatch: { user: user } } },
        ],
      })
      .toArray();

    results = [];
    expenses.forEach((expense) => {
      if (
        expense.category.toLowerCase().includes(query.toLowerCase()) ||
        expense.description.toLowerCase().includes(query.toLowerCase())
      ) {
        results.push(expense);
      }
    });
    res.json(results);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ msg: "Internal error", error: error.toString() });
  }
});

// Get personal information of the logged user
app.get("/api/info/whoami", verifyToken, async (req, res) => {
  try {
    const username = req.username;
    const mongo = await db.connectToDatabase();
    const userFound = await mongo.collection("users").findOne({
      username: username,
    });
    const name = userFound.name;
    const surname = userFound.surname;
    const password = userFound.password;
    const infos = { username, name, surname, password };
    res.json(infos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal error" });
  }
});

// Get all the users
app.get("/api/users", async (req, res) => {
  try {
    const mongo = await db.connectToDatabase();
    const users = await mongo.collection("users").find().toArray();
    res.status(200).json(users);
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ msg: error.message });
  }
});

// Log out
app.get("/logout", verifyToken, (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ msg: "Logged out successfully" });
});

app.listen(3000, () => {
  console.log("Web server started");
});
