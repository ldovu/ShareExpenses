const express = require("express");
const fs = require("fs/promises");
const { ObjectId } = require("mongodb");
const { query } = require("express-validator");
const db = require("./db.js");
const session = require("express-session");
const app = express();

app.use(express.static(`${__dirname}/public`));
app.use(express.json());
app.use(
  session({
    secret: "secret signature",
    resave: false,
  })
);
app.use(express.urlencoded());



////////////////////// INITIALIZE DATABASE SCRIPT //////////////////////

// Function to get a random element from an array
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Function to get a random number between min and max (inclusive)
function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

async function initializeDatabase() {
  const mongo = await db.connectToDatabase();
  await mongo.collection("users").insertOne({
    name: "Ludo",
    surname: "Caiola",
    username: "ludo",
    password: "ciao",
  });
  await mongo.collection("users").insertOne({
    name: "Aurelia",
    surname: "Caiola",
    username: "aure",
    password: "ciao",
  });
  await mongo.collection("users").insertOne({
    name: "Matteo",
    surname: "Caiola",
    username: "matte",
    password: "ciao",
  });

  await mongo.collection("users").insertOne({
    name: "Giulia",
    surname: "Ribolli",
    username: "giulia",
    password: "ciao",
  });
  await mongo.collection("users").insertOne({
    name: "Luca",
    surname: "Biancotto",
    username: "luca",
    password: "ciao",
  });
  await mongo.collection("users").insertOne({
    name: "Roberta",
    surname: "Giannelli",
    username: "robi",
    password: "ciao",
  });
  await mongo.collection("users").insertOne({
    name: "Federico",
    surname: "Rossi",
    username: "fede",
    password: "ciao",
  });

  const years = ["2022", "2023", "2024"];
  const months = [];
  for (let i = 1; i <= 12; i++) {
    months.push(i.toString());
  }
  const days = [];
  for (let i = 1; i <= 31; i++) {
    days.push(i);
  }
  const descriptions = [
    "Spesa",
    "Festa compleanno",
    "Campeggio Croazia",
    "Regalo Mamma",
    "Cena ristorante",
    "Aperitivo Milano",
  ];
  const categories = [
    "Spesa",
    "Svago",
    "Vacanza",
    "Regalo",
    "Cena",
    "Aperitivo",
  ];

  const minimumDigit = 10;
  const maximumDigit = 100;

  const users = await mongo.collection("users").find().toArray();

  for (let i = 0; i < descriptions.length; i++) {
    let payer = getRandomElement(users).username;
    let splitsNum = Math.floor(getRandomNumber(1, 8));
    let amount = getRandomNumber(minimumDigit, maximumDigit).toFixed(1);
    let quote = (amount / splitsNum).toFixed(2);

    const otherUsers = users.filter((user) => user.username !== payer);
    const splits = otherUsers.slice(0, splitsNum).map((user) => ({
      user: user.username,
      quote: quote,
    }));

    await mongo.collection("expenses").insertOne({
      day: getRandomElement(days),
      month: getRandomElement(months),
      year: getRandomElement(years),
      description: descriptions[i],
      category: categories[i],
      totalCost: amount,
      userList: {
        payer: {
          user: payer,
          quote: quote,
        },
        splits: splits,
      },
    });
  }
}
////////////////////// END INITIALIZE DATABASE //////////////////////


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
  const mongo = await db.connectToDatabase();
  const user = await mongo
    .collection("users")
    .findOne({ username: req.body.username });
  if (user && user.password === req.body.password) {
    req.session.username = user.username;
    res.status(200).json({ message: "The authentication was successful" });
  } else {
    res.status(401).json({ message: "Wrong username or password" });
  }
});

// Verify if user is authenticated
const verifyAuthentication = (req, res, next) => {
  if (req.session.username) {
    return next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Get all the expense of the logged user
app.get("/api/budget", verifyAuthentication, async (req, res) => {
  const mongo = await db.connectToDatabase();
  const username = req.session.username;
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
});

// Get the expenses of the logged user for the specified year
app.get("/api/budget/:year", verifyAuthentication, async (req, res) => {
  const mongo = await db.connectToDatabase();
  const username = req.session.username;
  const year = req.params.year;
  const expenses = await mongo
    .collection("expenses")
    .find({
      $and: [
        {
          $or: [
            { "userList.payer.user": username },
            {
              "userList.splits": {
                $elemMatch: { user: username },
              },
            },
          ],
        },
        { year: year },
      ],
    })
    .toArray();

  res.json(expenses);
});

// Get the expenses of the logged user for the specified year and month
app.get("/api/budget/:year/:month", verifyAuthentication, async (req, res) => {
  const mongo = await db.connectToDatabase();
  const username = req.session.username;
  const year = req.params.year;
  const month = req.params.month;
  const expenses = await mongo
    .collection("expenses")
    .find({
      $and: [
        {
          $or: [
            { "userList.payer.user": username },
            {
              "userList.splits": {
                $elemMatch: { user: username },
              },
            },
          ],
        },
        { year: year },
        { month: month },
      ],
    })
    .toArray();

  res.json(expenses);
});

// Extra function for getting the expenses of the logged user by year, month and id
app.get("/api/budget/:year/:month/:id", async (req, res) => {
  const mongo = await db.connectToDatabase();
  const username = req.session.username;
  const year = req.params.year;
  const month = req.params.month;
  const id = req.params.id;
  // Check if the id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  const expenses = await mongo
    .collection("expenses")
    .find({
      $and: [
        {
          $or: [
            { "userList.payer.user": username },
            {
              "userList.splits": {
                $elemMatch: { user: username },
              },
            },
          ],
        },
        { year: year },
        { month: month },
        { _id: new ObjectId(id) },
      ],
    })
    .toArray();

  res.json(expenses);
});

// Extra function for getting the expenses of the logged user by year and id
app.get(
  "/api/extraFunction1/:year/:id",
  verifyAuthentication,
  async (req, res) => {
    const mongo = await db.connectToDatabase();
    const username = req.session.username;
    const year = req.params.year;
    const id = req.params.id;
    // Check if the id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const expenses = await mongo
      .collection("expenses")
      .find({
        $and: [
          {
            $or: [
              { "userList.payer.user": username },
              {
                "userList.splits": {
                  $elemMatch: { user: username },
                },
              },
            ],
          },
          { year: year },
          { _id: new ObjectId(id) },
        ],
      })
      .toArray();

    res.json(expenses);
  }
);

// Extra function for getting the expenses of the logged user by month and id
app.get(
  "/api/extraFunction2/:month/:id",
  verifyAuthentication,
  async (req, res) => {
    const mongo = await db.connectToDatabase();
    const username = req.session.username;
    const month = req.params.month;
    const id = req.params.id;
    // Check if the id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const expenses = await mongo
      .collection("expenses")
      .find({
        $and: [
          {
            $or: [
              { "userList.payer.user": username },
              {
                "userList.splits": {
                  $elemMatch: { user: username },
                },
              },
            ],
          },
          { month: month },
          { _id: new ObjectId(id) },
        ],
      })
      .toArray();

    res.json(expenses);
  }
);

// Extra function for getting the expenses of the logged user by month
app.get(
  "/api/extraFunction3/:month",
  verifyAuthentication,
  async (req, res) => {
    const mongo = await db.connectToDatabase();
    const username = req.session.username;
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
  }
);

// Extra function for getting the expenses of the logged user by id
app.get("/api/extraFunction4/:id", verifyAuthentication, async (req, res) => {
  const mongo = await db.connectToDatabase();
  const username = req.session.username;
  const id = req.params.id;

  // Check if the id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }
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
});

// Add an expense for the specified year and month
app.post(
  "/api/budget/:year/:month/",
  verifyAuthentication,
  async (req, res) => {
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
    } else if (year != "" && month != "") {
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
      res
        .status(200)
        .json({ message: "Expense added successfully", result: result });
    } else {
      res.status(400).json({ message: "Invalid fields" });
    }
  }
);

// Modify an expense for the specified year and month
app.put(
  "/api/budget/:year/:month/:id",
  verifyAuthentication,
  async (req, res) => {
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
  }
);

// Delete the expense for the specified  id
app.delete("/api/budget/:id", verifyAuthentication, async (req, res) => {
  const mongo = await db.connectToDatabase();
  const username = req.session.username;

  const id = req.params.id;
  const result = await mongo.collection("expenses").deleteOne({
    $and: [
      {
        $or: [
          { "userList.payer.user": username },
          { "userList.splits": { $elemMatch: { user: username } } },
        ],
      },
      { _id: new ObjectId(id) },
    ],
  });

  if (result.deletedCount === 0) {
    res.status(404).json({ msg: "Expense not found" });
  } else {
    res.json({ msg: "Expense deleted successfully" });
  }
});

// Get the overall balance of the logged user
app.get("/api/balance", verifyAuthentication, async (req, res) => {
  const username = req.session.username;
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

  let credits = 0;
  let debits = 0;
  // per tutte le spese, se l'utente loggato è colui che ha pagato
  // allora sommo le quote degli utenti della spesa al credito
  // altrimenti sommo le quote dell'utente loggato al debito
  // laddove è presente nella lista degli splits
  expenses.forEach((expense) => {
    if (expense.userList.payer.user === username) {
      credits += expense.userList.splits.reduce(
        (total, split) => total + split.quote,
        0
      );
    } else {
      debits += expense.userList.splits.reduce(
        (total, split) =>
          split.user === username ? total + split.quote : total,
        0
      );
    }
  });
  const balance = credits - debits;
  res.json({ expenses, debits, credits, balance });
});

// Get the balance between the logged user and another user
app.get("/api/balance/:id", verifyAuthentication, async (req, res) => {
  const username = req.session.username;
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
          { "userList.payer.user": username },
          { "userList.splits": { $elemMatch: { user: otherUserUsername } } },
        ],
        $and: [
          { "userList.payer.user": otherUserUsername },
          { "userList.splits": { $elemMatch: { user: username } } },
        ],
      },
    })
    .toArray();

  res.json({ expenses });
});

// Get all the users that contain the query in the username
app.get("/api/users/search", query("q").escape(), async (req, res) => {
  const user = req.query.q;
  const mongo = await db.connectToDatabase();
  const users = await mongo.collection("users").find().toArray();

  let result = users.find((u) =>
    u.username.toLowerCase().startsWith(user.toLowerCase())
  );

  if (result) {
    res.json(result);
  } else {
    res.status(404).json({ msg: "User not found" });
  }
});

// funziona non con budget ma con try.. problemi di routing
// Get all the expenses that contain the query in the description or category
app.get(
  "/api/try/search",
  query("q").escape(),
  verifyAuthentication,
  async (req, res) => {
    const query = req.query.q;
    const username = req.session.username;
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
  }
);

// Get personal information of the logged user
app.get("/api/info/whoami", verifyAuthentication, async (req, res) => {
  const username = req.session.username;
  const mongo = await db.connectToDatabase();
  const userFound = await mongo.collection("users").findOne({
    username: username,
  });
  const name = userFound.name;
  const surname = userFound.surname;
  const password = userFound.password;
  const infos = { username, name, surname, password };
  res.json(infos);
});

// Get all the users
app.get("/api/users", async (req, res) => {
  const mongo = await db.connectToDatabase();
  const users = await mongo.collection("users").find().toArray();
  res.status(200).json(users);
});

// Log out
app.get("/logout", verifyAuthentication, (req, res) => {
  req.session.username = null;
  res.status(200).json({ message: "Logged out" });
});

app.listen(3000, () => {
  console.log("Web server started");
});
