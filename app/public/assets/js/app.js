const { createApp } = Vue;
const app = createApp({
  data() {
    return {
      username: "",
      userLogged: "",
      password: "",

      successMessage: "",
      errorMessage: "",
      message: "",

      passwordVisible: false,

      name: "",
      surname: "",

      currentView: "login",

      users: [],
      expenses: [],
      id: "",
      day: "",
      month: "",
      year: "",
      description: "",
      category: "",
      totalCost: "",
      usersList: {
        payer: {},
        splits: [],
      },

      quotePayer: "",
      quote: "",

      amountYouOwe: "", // debts
      amountYouAreOwed: "", // credits

      showAddUserForm: false,

      splitEqually: false,
      splitDifferently: false,

      personalizedQuote: "",
      sameQuote: "",

      personalBalance: "",

      detailsCredits: [],
      detailsDebits: [],
      otherUser: "",

      detailsCreditsTowardsId: [],
      detailsDebitsTowardsId: [],

      listSplitsSameQuote: [],
      listSplitsDifferentQuote: [],

      personalInformation: {},

      query: "",
      expenseQuery: "",

      errorMessageUser: "",
      errorMessageQuote: "",

      copyExpense: {},

      openedModal: false,

      newSplitsInModifiedExpense: [],
      listSplitsSameQuoteModifyExpense: [],
      listSplitsDifferentQuoteModifyExpense: [],
    };
  },
  mounted() {},
  computed: {
    showLoginView() {
      return this.currentView === "login";
    },
    showRegisterView() {
      return this.currentView === "register";
    },
    showExpensesView() {
      return this.currentView === "userExpenses";
    },
    showAddExpenseView() {
      return this.currentView === "addExpense";
    },
    showExpense() {
      return this.currentView === "getExpense";
    },
    showMyBalance() {
      return this.currentView === "myBalance";
    },
    showBalanceInRelationToId() {
      return this.currentView === "balanceInRelationToId";
    },

    showPersonalInformation() {
      return this.currentView === "personalInformation";
    },
    showAbout() {
      return this.currentView === "about";
    },
    passwordFieldType() {
      return this.passwordVisible ? "text" : "password";
    },
    showSearchExpenseView() {
      return this.currentView === "searchExpense";
    },
    showAbout() {
      return this.currentView === "about";
    },
  },

  methods: {
    switchView(view) {
      console.log("switchView method called");
      console.log("view: " + view);
      this.currentView = view;

      if (view === "login") {
        this.name = "";
        this.surname = "";
        this.username = "";
        this.password = "";
        this.successMessage = "";
        this.errorMessage = "";
      }
      if (view === "register") {
        this.getAllUser();

        this.username = "";
        this.password = "";
        this.successMessage = "";
      }

      if (view === "userExpenses") {
        this.loggedUserExpenses();

        this.day = "";
        this.month = "";
        this.year = "";
        this.description = "";
        this.category = "";
        this.totalCost = "";
        this.usersList = {
          payer: {},
          splits: [],
        };
        this.amountYouAreOwed = "";
        this.amountYouOwe = "";
        this.personalBalance = "";
        this.detailsCredits = [];
        this.detailsDebits = [];

        this.errorMessage = "";
        this.successMessage = "";
        this.detailsCreditsTowardsId = [];
        this.detailsDebitsTowardsId = [];
        this.otherUser = "";

        this.errorMessageUser = "";
        this.errorMessageQuote = "";
        this.errorMessage = "";
        this.splitDifferently = false;
        this.splitEqually = false;
        this.listSplitsSameQuote = [];
        this.listSplitsDifferentQuote = [];
        this.quotePayer = "";
        this.personalizedQuote = "";
        this.sameQuote = "";
      }

      if (view === "myBalance") {
        this.myBalance();
      }
      if (view === "personalInformation") {
        this.getPersonalInformation();
      }
      if (view === "addExpense") {
        this.successMessage = "";
        this.errorMessage = "";
      }
    },

    openModal(expense) {
      this.copyExpense = JSON.parse(JSON.stringify(expense));
    },

    closeModal() {
      this.copyExpense = {};
      this.listSplitsSameQuote = [];
      this.listSplitsDifferentQuote = [];
      this.splitEqually = false;
      this.splitDifferently = false;

      this.loggedUserExpenses();
    },

    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible;
    },

    // Register function
    async signup() {
      console.log("signup method called");
      const newUserCredentials = {
        name: this.name,
        surname: this.surname,
        username: this.username,
        password: this.password,
      };
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUserCredentials),
      });

      if (response.ok) {
        const data = await response.json();
        this.successMessage = data.message;
      } else {
        const error = await response.json();
        this.errorMessage = error.message;
        console.error("Error:", error.message);
        setTimeout(() => {
          this.errorMessage = "";
        }, 3000);
        this.switchView("register");
      }
    },
    // Login function
    async signin() {
      const userCredentials = {
        username: this.username,
        password: this.password,
      };
      if (this.username === "" || this.password === "") {
        this.errorMessage = "Fill all the fields";
        return;
      }

      const response = await fetch("api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userCredentials),
      });

      if (response.ok) {
        const data = await response.json();
        this.successMessage = data.message;
        console.log(data.message);

        this.switchView("userExpenses");
        this.loggedUserExpenses();

        this.userLogged = this.username;
        this.username = "";
        this.password = "";
        this.message = "";
      } else {
        const error = await response.json();
        console.log(error.message);
        this.errorMessage = error.message;
        console.error("Error:", error.message);
      }
    },

    // Get all the users existing in the database
    async getAllUser() {
      try {
        const response = await fetch("api/users");
        const data = await response.json();
        this.users = data;
        this.errorMessageUser = "";
        this.errorMessageQuote = "";
      } catch (error) {
        console.error("Error:", error);
      }
    },

    // Get all users except the logged one
    async getUsers() {
      console.log("getUsers method called");

      const response = await fetch("api/users");
      const data = await response.json();
      const userLog = this.userLogged;

      // Clear the current users array to avoid duplicates
      this.users = [];

      data.forEach((user) => {
        if (user.username !== userLog && !this.users.includes(user.username)) {
          this.users.push(user.username);
        }
      });
      console.log("This.users from get users function", this.users);
      // this.users = Object.values(this.users);
      this.errorMessageUser = "";
      this.errorMessageQuote = "";
    },

    // Exclude the already present users in the splits list
    async getUsersForModify() {
      console.log("getUsers method called");

      const response = await fetch("api/users");
      const data = await response.json();
      const userLog = this.userLogged;

      // Clear the current users array to avoid duplicates
      this.users = [];
      let copyExpenseUserListSplits = [];

      this.copyExpense.userList.splits.forEach((user) => {
        copyExpenseUserListSplits.push(user.user);
      });
      copyExpenseUserListSplits.push(this.copyExpense.userList.payer.user);
      console.log("CopyExpenseUserListSplits", copyExpenseUserListSplits);

      data.forEach((user) => {
        if (
          user.username !== userLog &&
          !this.users.includes(user.username) &&
          !copyExpenseUserListSplits.includes(user.username)
        ) {
          this.users.push(user.username);
        }
      });
      console.log("This.users from get users function", this.users);
      // this.users = Object.values(this.users);
      this.errorMessageUser = "";
      this.errorMessageQuote = "";
    },

    // Load the expenses of the logged user
    async loggedUserExpenses() {
      const username = this.userLogged;
      const response = await fetch("/api/budget", { method: "GET" });
      const data = await response.json();
      this.expenses = data;
      console.log(this.expenses);
    },

    // Get users expenses by year
    async getExpensesByYear() {
      const url = `/api/budget/${this.year}`;
      const response = await fetch(url, {
        method: "GET",
      });
      console.log(url);
      if (response.ok) {
        const data = await response.json();
        this.expenses = data;
        this.year = "";
      } else {
        console.error("Error:", await response.message);
      }
    },

    // Get users expenses by year and month
    async getExpensesByYearMonth() {
      const url = `/api/budget/${this.year}/${this.month}`;
      const response = await fetch(url, {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        this.expenses = data;
        this.year = "";
        this.month = "";
      } else {
        console.error("Error:", await response.text());
      }
    },

    // Get users expenses by year, month and id
    async getExpensesByYearMonthId() {
      const response = await fetch(
        `/api/budget/${this.year}/${this.month}/${this.id}`,
        {
          method: "GET",
        }
      );
      if (response.ok) {
        const expenseYearMonthId = await response.json();
        this.expenses = expenseYearMonthId;
        this.year = "";
        this.month = "";
        this.id = "";
      } else {
        console.error("Error:", await response.message);
        this.expenses = [];
        this.id = "";
      }
    },

    // Get users expenses by year and id
    async getExpensesByYearId() {
      const url = `/api/extraFunction1/${this.year}/${this.id}`;
      const response = await fetch(url, {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        this.expenses = data;
        this.year = "";
        this.id = "";
      } else {
        console.error("Error:", await response.message);
        this.expenses = [];
        this.id = "";
      }
    },

    // Get users expenses by month and id
    async getExpensesByMonthId() {
      const url = `/api/extraFunction2/${this.month}/${this.id}`;
      const response = await fetch(url, {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        this.expenses = data;
        this.month = "";
        this.id = "";
      } else {
        console.error("Error:", await response.message);
        this.expenses = [];
        this.id = "";
      }
    },

    // Get users expenses by month
    async getExpensesByMonth() {
      const url = `/api/extraFunction3/${this.month}`;
      const response = await fetch(url, {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        this.expenses = data;
        this.month = "";
      } else {
        console.error("Error:", await response.text());
      }
    },

    // Get users expenses by id
    async getExpensesById() {
      const url = `/api/extraFunction4/${this.id}`;
      const response = await fetch(url, {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        this.expenses = data;
        this.id = "";
      } else {
        const error = await response.json();
        console.log(error.message);
        this.expenses = [];
        this.id = "";
      }
    },

    // Function that filter the form to get the expenses and output the result
    getUserExpenses() {
      if (this.year && this.month && this.id) {
        this.getExpensesByYearMonthId();
      } else if (this.month && this.year) {
        this.getExpensesByYearMonth();
      } else if (this.id && this.year) {
        this.getExpensesByYearId();
      } else if (this.id && this.month) {
        this.getExpensesByMonthId();
      } else if (this.year) {
        this.getExpensesByYear();
      } else if (this.month) {
        this.getExpensesByMonth();
      } else if (this.id) {
        this.getExpensesById();
      } else {
        console.log("Insufficient parameter");
      }
    },

    // ------------------- FUNZIONI GIUSTE USATE IN ADD EXEPNSE VIEW -------------------
    // Confirm add user when split equally in add expense view
    confirmAddUserSameQuote() {
      if (this.username === "") {
        return;
      }
      if (this.username != "") {
        let sameQuote = this.totalCost / (this.usersList.splits.length + 2);
        this.usersList.splits.push({
          user: this.username,
          quote: sameQuote,
        });
        if (this.listSplitsSameQuote.includes(this.username)) {
          this.errorMessageUser = "User already added";
          return;
        }

        this.listSplitsSameQuote.push(this.username);
        // aggiornamento dinamico quota
        this.usersList.splits.forEach((user) => {
          user.quote = sameQuote;
        });
        this.usersList.payer.user = this.userLogged;
        this.usersList.payer.quote = sameQuote;

        this.username = "";
      }
    },

    // Confirm add user when split differently in add expense view
    confirmAddUserDifferentQuote() {
      showAddUserForm = true;
      if (this.listSplitsDifferentQuote.includes(this.username)) {
        this.errorMessageUser = "User already added";
        return;
      }
      if (this.personalizedQuote === "") {
        this.errorMessageQuote = "Insert a quote";
        return;
      }
      if (this.username === "") {
        return;
      }

      if (this.totalCost == 0 && this.personalizedQuote < 0) {
        console.log("refund applied");
      }
      if (
        this.username != "" ||
        this.personalizedQuote != "" ||
        this.personalizedQuote < 0
      ) {
        this.usersList.splits.push({
          user: this.username,
          quote: this.personalizedQuote,
        });

        this.listSplitsDifferentQuote.push(this.username);
        this.usersList.payer.user = this.userLogged;
        this.usersList.payer.quote = this.quotePayer;

        this.username = "";
        this.personalizedQuote = "";
      }
    },

    // ------------------- Aggiunta la possibilità di ADD user in MODIFY EXPENSE VIEW -------------------

    confirmAddUserSameQuoteModify() {
      if (this.username === "") {
        return;
      }
      if (this.username !== "") {
        let sameQuote =
          this.copyExpense.totalCost /
          (this.copyExpense.userList.splits.length + 2);
        if (this.listSplitsSameQuote.includes(this.username)) {
          this.errorMessageUser = "User already added";
          return;
        }
        this.copyExpense.userList.splits.push({
          user: this.username,
          quote: sameQuote,
        });

        this.listSplitsSameQuote.push(this.username);
        // aggiornamento dinamico quota
        this.copyExpense.userList.splits.forEach((user) => {
          user.quote = sameQuote;
        });

        this.copyExpense.userList.payer.quote = sameQuote;

        this.username = "";
      }
    },
    confirmAddUserDifferentQuoteModify() {
      if (this.listSplitsDifferentQuote.includes(this.username)) {
        this.errorMessageUser = "User already added";
        return;
      }
      if (this.personalizedQuote === "") {
        this.errorMessageQuote = "Insert a quote";
        return;
      }
      if (this.username === "") {
        return;
      }

      if (this.copyExpense.totalCost == 0 && this.personalizedQuote < 0) {
        console.log("refund applied");
      }
      if (
        this.username !== "" ||
        this.personalizedQuote !== "" ||
        this.personalizedQuote < 0
      ) {
        this.copyExpense.userList.splits.push({
          user: this.username,
          quote: this.personalizedQuote,
        });

        this.listSplitsDifferentQuote.push(this.username);

        this.username = "";
        this.personalizedQuote = "";
      }
    },

    // auxiliary function for showing add user form for split equal option
    async addUsersAndSplitEqually() {
      this.errorMessageUser = "";
      this.errorMessageQuote = "";
      this.errorMessage = "";
      this.splitEqually = true;
      this.splitDifferently = false;
    },

    // Auxiliary function for showing add user form for split different option
    async addUsersAndSplitDifferently() {
      this.errorMessageUser = "";
      this.errorMessageQuote = "";
      this.errorMessage = "";
      this.splitEqually = false;
      this.splitDifferently = true;
    },

    // Add expense function
    async addExpense() {
      try {
        const newExpense = {
          day: this.day,
          month: this.month,
          year: this.year,
          description: this.description,
          category: this.category,
          totalCost: this.totalCost,
          usersList: {
            payer: this.usersList.payer,
            splits: this.usersList.splits,
          },
        };

        let totalQuote = this.usersList.payer.quote;
        this.usersList.splits.forEach((user) => {
          totalQuote += user.quote;
        });

        if (this.splitDifferently && this.totalCost != totalQuote) {
          console.error("Error: Total cost and sum of quotes do not match.");
          this.errorMessage = "Total cost exceeds the sum of quotes.";
          this.quotePayer = "";
          this.personalizedQuote = "";
          this.usersList.splits = [];
          this.listSplitsDifferentQuote = [];
          this.listSplitsSameQuote = [];
          return;
        }
        if (
          this.day == "" ||
          this.month == "" ||
          this.year == "" ||
          this.description == "" ||
          this.category == ""
        ) {
          console.error("Error: Empty fields.");
          this.errorMessage = "Fill all the fields";
          return;
        }

        const url = `/api/budget/${this.year}/${this.month}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newExpense),
        });
        if (response.ok) {
          const data = await response.json();
          this.successMessage = data.message;
          this.expenses.push(data.result);
        } else {
          const error = await response.json();
          this.errorMessage = error.message;
          console.error("Error:", error.message);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },

    // Modify expense function
    async modifyExpense() {
      console.log("modifyExpense method called");

      const updExpense = {
        day: this.copyExpense.day,
        month: this.copyExpense.month,
        year: this.copyExpense.year,
        description: this.copyExpense.description,
        category: this.copyExpense.category,
        totalCost: this.copyExpense.totalCost,
        usersList: {
          payer: this.copyExpense.userList.payer,
          splits: this.copyExpense.userList.splits,
        },
      };

      let totalQuote = this.copyExpense.userList.payer.quote;
      this.copyExpense.userList.splits.forEach((user) => {
        totalQuote += user.quote;
      });

      if (this.copyExpense.totalCost != totalQuote) {
        this.errorMessage = "Total cost differs from sum of quotes.";
        setTimeout(() => {
          this.errorMessage = "";
        }, 5000);
        return;
      }
      if (
        this.copyExpense.day == "" ||
        this.copyExpense.description == "" ||
        this.copyExpense.category == "" ||
        this.copyExpense.totalCost == "" ||
        this.copyExpense.userList.payer.quote == "" ||
        this.copyExpense.userList.splits == []
      ) {
        console.error("Error: Empty fields.");
        this.errorMessage = "Fill all the fields";
        setTimeout(() => {
          this.errorMessage = "";
        }, 5000);
        return;
      }

      const id = this.copyExpense._id;

      const response = await fetch(
        `/api/budget/${this.copyExpense.year}/${this.copyExpense.month}/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updExpense),
        }
      );

      if (response.ok) {
        const data = await response.json();
        this.successMessage = data.message;
        this.updatedExpense = data.result;

        // rimetto la spesa nella stessa posizione
        // (anche se l'ordine non conta non voglio che la tabella cambi ordine dopo la modifica)
        const index = this.expenses.findIndex(
          (expense) => expense._id === this.id
        );
        if (index !== -1) {
          this.expenses[index] = this.updatedExpense;
        }
        setTimeout(() => {
          this.successMessage = "";
        }, 5000);
        this.day = "";
        this.month = "";
        this.year = "";
        this.description = "";
        this.category = "";
        this.totalCost = "";
        this.usersList = {
          payer: {},
          splits: [],
        };
        this.errorMessage = "";
        this.errorMessageUser = "";
        this.listSplitsSameQuote = [];
        this.listSplitsDifferentQuote = [];
        this.splitEqually = false;
        this.splitDifferently = false;
      } else {
        const error = await response.json();
        this.errorMessage = error.message;
      }
    },

    // DELETE EXPENSE FROM USERS' EXPENSES
    async deleteExpense(id) {
      const username = this.userLogged;
      console.log("deleteExpense method called");
      const url = `/api/budget/${id}`;
      const response = await fetch(url, {
        method: "DELETE",
      });
      console.log(url);
      if (response.ok) {
        const data = await response.json();
        this.expenses = this.expenses.filter((expense) => expense._id !== id);
        console.log(data);
      } else {
        const error = await response.json();
        console.error("Error:", error);
      }
    },

    // Function for getting the overall balance of the logged user
    async myBalance() {
      const username = this.userLogged;
      const response = await fetch("/api/balance", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        this.expenses = data.expenses;
        this.amountYouOwe = data.debits;
        this.amountYouAreOwed = data.credits;
        this.personalBalance = data.balance;

        this.expenses.forEach((expense) => {
          // lui ha pagato, quindi deve ricevere soldi
          if (expense.userList.payer.user === username) {
            expense.userList.splits.forEach((split) => {
              this.detailsCredits.push({
                user: split.user,
                quote: split.quote,
              });
            });
          }
          // lui è il beneficiario, quindi deve dare soldi
          else {
            expense.userList.splits.forEach((split) => {
              if (split.user === username) {
                this.detailsDebits.push({
                  user: expense.userList.payer.user,
                  quote: split.quote,
                });
              }
            });
          }
        });
      } else {
        console.error("Error:", await response.text());
      }
    },

    // Auxiliary function for getting the id given the username
    fromUserToId(username) {
      const user = this.users.find((user) => user.username === username);
      return user ? user._id : "";
    },

    // Function for getting the balance in relation to the id
    async balanceInRelationToId() {
      const username = this.userLogged;
      const otherUsername = this.otherUser;
      this.id = this.fromUserToId(otherUsername);
      const response = await fetch(`/api/balance/${this.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(username);
      console.log(otherUsername);

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        this.expenses = data.expenses;

        this.expenses.forEach((expense) => {
          if (expense.userList.payer.user === username) {
            expense.userList.splits.forEach((split) => {
              if (split.user === otherUsername) {
                this.detailsCreditsTowardsId.push({
                  user: otherUsername,
                  quote: split.quote,
                });
              }
            });
          } else if (expense.userList.payer.user === otherUsername) {
            expense.userList.splits.forEach((split) => {
              if (split.user === username) {
                this.detailsDebitsTowardsId.push({
                  user: otherUsername,
                  quote: split.quote,
                });
              }
            });
          }
        });
      } else {
        console.error("Error:", await response.text());
      }
    },

    // Function for getting the expenses by query
    async getExpensesByQuery() {
      const response = await fetch(`/api/try/search?q=${this.expenseQuery}`);
      if (response.ok) {
        const data = await response.json();
        this.expenses = data;
        this.expenseQuery = "";
      } else {
        console.error("Error:", await response.text());
      }
    },

    // Function for getting the users by query
    async getUsersByQuery() {
      const response = await fetch(`/api/users/search?q=${this.query}`, {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
      } else {
        console.error("Error:", await response.text());
      }
    },

    // Function for getting the personal information of the logged user
    async getPersonalInformation() {
      const username = this.userLogged;
      const response = await fetch("/api/info/whoami");

      if (response.ok) {
        const personalInfo = await response.json();
        this.name = personalInfo.name;
        this.surname = personalInfo.surname;
        this.username = personalInfo.username;
        this.password = personalInfo.password;
      } else {
        console.error("Error:", await response.text());
      }
    },

    // Reset function to invoke inside logout
    reset() {
      this.username = "";
      this.name = "";
      this.surname = "";
      this.password = "";
      this.successMessage = "";
      this.errorMessage = "";

      this.day = "";
      this.month = "";
      this.year = "";
      this.description = "";
      this.category = "";
      this.totalCost = "";
      this.usersList = {
        payer: {},
        splits: [],
      };

      this.quotePayer = "";
      this.quote = "";

      this.amountYouOwe = ""; // debts
      this.amountYouAreOwed = ""; // credits

      this.showAddUserForm = false;

      this.splitEqually = false;
      this.splitDifferently = false;

      this.personalizedQuote = "";
      this.sameQuote = "";

      this.personalBalance = "";

      this.detailsCredits = [];
      this.detailsDebits = [];
      this.otherUser = "";

      this.detailsCreditsTowardsId = [];
      this.detailsDebitsTowardsId = [];

      this.listSplitsSameQuote = [];
      this.listSplitsDifferentQuote = [];

      this.personalInformation = {};

      this.query = "";
      this.expenseQuery = "";

      this.errorMessageUser = "";
      this.errorMessageQuote = "";

      this.copyExpense = {};

      this.openedModal = false;
    },

    // Logout function
    async logout() {
      const response = await fetch("/logout", {
        method: "GET",
      });
      if (response.ok) {
        console.log("logout successful");
        this.reset();
        this.currentView = "login";
      } else {
        console.error("Error:", await response.text());
      }
    },
  },
}).mount("#app");
