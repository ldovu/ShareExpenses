// Function to get a random element from an array
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const users = [
  "Alice",
  "Bob",
  "Charlie",
  "David",
  
];

// Function to get a random number between min and max (inclusive)
function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

// Test getRandomElement function
const testArray = [
  "Spesa",
  "Festa compleanno",
  "Campeggio Croazia",
  "Regalo",
  "Cena ristorante",
  "Aperitivo Milano",
];
console.log("Testing getRandomElement function:");
for (let i = 0; i < 10; i++) {
  console.log(getRandomElement(testArray));
}

// Test getRandomNumber function
console.log("\nTesting getRandomNumber function:");
for (let i = 0; i < 10; i++) {
  const randomNum = getRandomNumber(10, 100).toFixed(1);
  // Print with 2 decimal places for readability
}

console.log("\n", testArray.length);

const payer = getRandomElement(users);
console.log("\nPayer", payer);
const splitsNum =Math.floor(getRandomNumber(1, 8));
console.log("\nSplitsNum", splitsNum);

const otherUsers = users.filter((user) => user.username !== payer);
const splits = otherUsers.slice(0, splitsNum).map((user) => ({
  user: user,
}));
console.log("\nSplits", splits);
