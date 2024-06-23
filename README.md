# share-expenses


This project was done for the exam of "Programmazione Web" (Prof. Andrea De Lorenzo, 2023) at the University of Trieste.

## Description

Share expenses is a web application implemented as follows: 
- Server-side: written in Node.js
- Client-side: developed using Vue.js, HTML and CSS

Additionally, Docker was used for containerization. 


## Main Contents

- **`app` folder**: contains the main files of the project
  - `app.js`: contains the server-side functions of the application written in Node.js
  - `db.js`: contains the function for the connection to MongoDB
  - **`public` folder**:
    -  `index.html`: main HTML file
    -  **`assets` folder**:  
      -  **`css` folder**: contains the `style.css` file
      -  **`images` folder**: contains the application logo `logoAppWithTitle.png`
      -  **`js` folder**: contains `app.js`, which implements the client-side of the app in Vue.js 
- `DockerFile` and `docker-compose.yml`: files used to set up and run the application with Docker


## Features

- **Authentication**: users can sign up and log in to their account.
- **Expense**: users can visualize, modify, delete, add, filter and search the expenses in which they are involved in.
  - **Modify**: users can modify an expense previously inserted in the system
  - **Delete**: users can delete an expense 
  - **Add**: users can add an expense and choose to split it equally among the participant or customize the quote for each participant involved
  - **Filter**: users can filter their expenses by inserting all the possible combinations of parameters:
    - ID
    - Month
    - Year
  - **Search**: users can search for an expense by writing a word or part of it in the search bar
- **Balance**: users can check their overall balance or their balance in relation to another user
- **Profile**: users can view their profile information
- **Log out**: users can log out of the application


## Main Screenshots

<p align="left">
  <img src="./Images/HomePageScreen.png" alt="Login Screen" height="360" width="800"/>
</p>



#### How to use it: #### 
1. Clone this Repository 
2. Open it in Visual Studio Code 
3. Open Docker Desktop in your computer
4. Open a Terminal in Visual Studio Code
5. Type ```docker compose up``` and press enter
6. In your browser, navigate to localhost:3000
