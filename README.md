## ExpenseTrack App

##### ExpenseTrack is a simple and efficient app that is designed to help users manage their finances and track the amount of money they are spending. With this app, users will have the ability to keep track of the amount of money they are spending, see with visual representations which categories they are spending the most money on, and set monthly budgets to set a limit on the amount of money users will spend within that month. with this app, users will be able to gain valuable insights on their spending habits.

## Team Members:
##### Jefferson Charles
##### Josh Henry
##### Carlodavid Soto
##### Vladimir Veillard

## Frontend Setup (React + Typescript + Vite):
#### Vite is a frontend tool that is used for building fast and optimized web applications. It uses a modern build system and a fast development sever to provide a streamlined and efficient devlopment experience.

#### Here are the steps needed to run the server vite on the frontend:
### 1. Install Vite:

- Before setting up the frontend server, make sure you have the latest version of Vite installed. Run the following command to install the latest version of Vite or update to the latest version:

`npm create vite@latest`

### 2. Install Dependencies:

- Navigate to the frontend directory of the project and install the required dependencies using the Node Package Manager (npm):

  `cd Front-end`

  `npm install`


### 3. Run the Development Server:

- Start the server using the following command:

   `npm run dev`

- This will start the frontend of the application on: `http://localhost:3000`.

## Backend Setup (Flask + Python):
#### Flask will be the server used to run the backend of the application. Flask is a web framework for python, and here are the steps to get the backend server running:

### 1. Check to make sure the latest versions of python and pip is installed:

- For Python:

`python --version`

- For pip:

`pip --version`

### 2. Install the latest versions if they are not on your machine:

- For python/pip, download and install Python 3.12.0 from `https://www.python.org/downloads/`
 
### 3. Create the Virtual Environment:

-  Navigate to the backend directory of the project and create a virtual environment:

`cd Back-end`

#### For Windows run:
`py -3 -m venv .venv`

#### For macOS/Linux run:
`python3 -m venv .venv`

### 4. Activate the virtual Environment:

#### For Windows run:
`.venv/Scripts/activate`

#### For macOS/Linux run:
`. .venv/bin/activate`

- Then your shell prompt will change to show the name of the activated environment

### 5. Install Python Packapges:

- Make sure to install all the required Python Packages using pip:

`pip install -r requirements.txt`

### 6. Install Flask:

- Within the activated environment, use the following command to install the flask server:

`pip install Flask`

### 7. Run the Flask Server:

`python backend.py`

- This will start running the backend of the application needed for the whole application itself to function properly.

## Usuage:

### Login: 

- Access the application in your browser and register for an account with the ExpenseTrack application and once you register for an account, login to begin to keep track of your expenses. 

### Homepages:

#### There are three main pages for the web application: 

### 1. The HomePage:

- where you can keep track of your expenses and you are able to set monthly budgets and have your expenses automatically subtract from your budget each of your expenses.

### 2. The Visualization Page:

- Where you are able to see graphs that show all of your expenses. There are three different graphs, which are a line graph, a bar graph, and a pie chart. The line graph will show how much money you have spent for each month, the bar graph will show how much money users have spent for each expense type, and the pie chart will show the percentage of what each expense you have spent money on makes for the total budget that you have set.

### 3. The Account Page:

- The account page will allow you to see the information that you provided when you registered for an account with ExpenseTrack. You will also be able to update your information like first and last name.

### How We Hosted 

## Backend

- The first step to hosting the backend was to run pip freeze > requirements.txt to ensure that all dependencies for this project was available in an easy to access matter.

- Then we created a dockerfile, where we instructed it to install python version 3.10, install all dependencies in the requirements.txt file, and finally run the backend server.

- Once the dockerfile was made, we pushed the docker image to a dockerhob repository.

- We hosted the docker container by pushing it from the repository to a heroku web app. This was done through the heroku cli, and the heroku container cli, with the specific commands used being heroku container:push and heroku container:release.

- Finally, all api calls in the frontend were updated to match the new url of the server.

## Frontend
- The frontend was a simpler process, first and foremost we ran npm run build to create a production version of web pages, and compress the size of our web app as much as possible.

- Then, we copied the frontend and placed it in it's own public repository, which was because we planned on using Netlify to host our web app as it was both free and held a lot of documentation.

- Once the frontend had its own repo, we then download netlify's cli, and used ntl init to host our frontend. Once complete, we 
used ntl open to receive our site's url.









