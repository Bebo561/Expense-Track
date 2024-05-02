
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask import render_template
import os, json
from dotenv import load_dotenv
from google.auth.transport import requests
from google.oauth2 import id_token
from flask_cors import CORS
from Models import *

# Load environment variables from .env
load_dotenv()

db_connection_string = os.environ.get("DB_CONNECTION_STRING")
FIREBASE_WEB_API_KEY = os.environ.get("API_KEY")
print(db_connection_string)
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Check if the database connection string is set
if not db_connection_string:
    raise ValueError("DB_CONNECTION_STRING environment variable is not set.")

# PostgreSQL Database App configuration
app.config[
    "SQLALCHEMY_DATABASE_URI"
] = db_connection_string
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = True

# PostgreSQL Database Connection and Configuration
db.init_app(app)

@app.route("/register", methods=["POST"])
def register():
    data = json.loads(request.data)

    userID = data["UID"]

    user = User.query.filter_by(UserID = userID).first()

    if user is not None:
        return jsonify({"Data": "User already exists"}), 200

    try:
        newUser = User(UserID = userID, DisplayName = "", ProfilePicture = "")
        db.session.add(newUser)
        db.session.commit()
        return jsonify({"Data": "Success"}), 200
    except Exception as e:
        print(e)
        return jsonify({"Data": "Error with database"}), 403

@app.route("/RetrieveHomepageData", methods=["GET"])
# Function to fetch user expenses for a specific year and month
def get_user_expenses():
    # Check if a budget exists for the user at the specified time frame
    userID = request.args.get("UID")
    year = request.args.get("Year")
    month = request.args.get("Month")
    jwt_token = request.headers['Authorization']
    returnBudget = {'amount': 0, "ID": None}

    #If token does not exist,return error
    if not jwt_token:
        return jsonify({'error': 'JWT token not provided'}), 400

    try:
        # Verify the Firebase JWT token
        decoded_token = id_token.verify_firebase_token(
            id_token=jwt_token,
            request=requests.Request(),
            audience= FIREBASE_WEB_API_KEY
        )

        if userID != decoded_token["user_id"]:
            return jsonify({"Error": "Token ID does not match UserID"}), 400
        budget = Budget.query.filter_by(UserId=userID, Year=year, Month=month).first()

        if budget is not None:
            returnBudget = {'amount': budget.Amount, "ID": budget.BudgetID}

        if budget is None:
            # If a budget doesn't exist, create a new one
            new_budget = Budget(UserId = userID, Year = year, Month = month, Amount = 0)  # Replace 0 with default budget value
            db.session.add(new_budget)
            db.session.commit()
            returnBudget = {'amount': new_budget.Amount, "ID": new_budget.BudgetID}

        # Fetch user's expense data for the specified year and month
        expenses = Expense.query.filter_by(UserID = userID, Year=year, Month=month).all()
        returnExpenses = []
        for expense in expenses:
            obj = {
                "Expense": expense.Cost,
                "ExpenseName": expense.Title,
                "ExpenseYear": expense.Year,
                "ExpenseMonth": expense.Month,
                "ExpenseType": expense.Type,
                "ExpenseID": expense.ExpenseID
            }
            returnExpenses.append(obj)

        return jsonify({
            "Data": "Success",
            "Budget": returnBudget,
            "Expenses": returnExpenses
        })
    #If jwt is not valid, return error
    except ValueError as e:
        print(e)
        return jsonify({'error': f'Error verifying token: {str(e)}'}), 401

@app.route("/CreateExpense", methods=["POST"])
def CreateExpense():
    data = json.loads(request.data)
    userID = data["UID"]
    expenseAmount = data["Expense"]
    expenseType = data["ExpenseType"]
    expenseMonth = data["ExpenseMonth"]
    expenseYear = data["ExpenseYear"]
    expenseName = data["ExpenseName"]

    jwt_token = request.headers['Authorization']

    #If token does not exist,return error
    if not jwt_token:
        return jsonify({'error': 'JWT token not provided'}), 400

    try:
        # Verify the Firebase JWT token
        decoded_token = id_token.verify_firebase_token(
            id_token=jwt_token,
            request=requests.Request(),
            audience= FIREBASE_WEB_API_KEY
        )

        if userID != decoded_token["user_id"]:
            return jsonify({"Error": "Token ID does not match UserID"}), 400
        
        newExpense = Expense(Cost = expenseAmount, Type = expenseType, Title = expenseName, Year = expenseYear, Month = expenseMonth, UserID = userID)
        db.session.add(newExpense)
        db.session.commit()

        expenseID = newExpense.ExpenseID

        expenseObj = {
            "Expense": expenseAmount,
            "ExpenseType": expenseType,
            "ExpenseMonth": expenseMonth,
            "ExpenseYear": expenseYear,
            "ExpenseName": expenseName,
            "ExpenseID": expenseID
        }
        return jsonify({"Data": "Success", "Expense": expenseObj}), 200
        
    #If jwt is not valid, return error
    except ValueError as e:
        return jsonify({'error': f'Error verifying token: {str(e)}'}), 401

"""
This is the route for updating the monthly budget by Budget Id.
Validates that the user is signed in by checking the jwt coin, then searching for the budget 
in the database, and updating it. Returns a successful 200 code.
"""
@app.route("/UpdateMonthlyBudget", methods=["PUT"])
def UpdateMonthlyBudget():
    #Retrieve the jwt token from authorization headers
    jwt_token = request.headers['Authorization']

    #If token does not exist,return error
    if not jwt_token:
        return jsonify({'error': 'JWT token not provided'}), 400

    try:
        # Verify the Firebase JWT token
        decoded_token = id_token.verify_firebase_token(
            id_token=jwt_token,
            request=requests.Request(),
            audience= FIREBASE_WEB_API_KEY
        )

        #Load data from request
        Json = request.json
        data =json.loads(request.data)

        bID = data["BudgetID"]
        uID = data["UserID"]
        updatedAmount = data["Amount"]

        if uID != decoded_token["user_id"]:
            return jsonify({"Error": "Token ID does not match UserID"}), 400

        #Query database for budget with matching id and belongs to the same user
        budget = Budget.query.filter_by(BudgetID = bID, UserId = uID).first()

        #If it exists, update budget amount, and return success
        if budget is not None:
            budget.Amount = updatedAmount
            db.session.commit()
            return jsonify({"Data": "Successfully updated Budget"}), 200

        #If it does not exist, return error
        return jsonify({"Error": "Budget was not found"}), 400

    #If jwt is not valid, return error
    except ValueError as e:
        return jsonify({'error': f'Error verifying token: {str(e)}'}), 401

"""
This function is called specfically for the bar graph in the graphs page.
It returns two separate lists to represent the x and y axis. The x-axis is a list of 
all expense types of the expenses of the current month. The y-axis is a list of the total amount
spent on each expense type, it corresponds to each index in the x-axis list.
"""
@app.route("/GetBarGraph", methods=["GET"])
def GetBarGraph():
    #Retrieve the jwt token from authorization headers
    jwt_token = request.headers['Authorization']

    #If token does not exist,return error
    if not jwt_token:
        return jsonify({'error': 'JWT token not provided'}), 400

    try:
        # Verify the Firebase JWT token
        decoded_token = id_token.verify_firebase_token(
            id_token=jwt_token,
            request=requests.Request(),
            audience= FIREBASE_WEB_API_KEY
        )
   
        userID = request.args.get('UserID')
        month = request.args.get("Month")

        if userID != decoded_token["user_id"]:
            return jsonify({"Error": "Token ID does not match UserID"}), 400

        expenses = Expense.query.filter_by(UserID = userID, Month = month)

        costPerType = dict()

        for expense in expenses:
            if expense.Type not in costPerType:
                costPerType[expense.Type] = 0
            
            costPerType[expense.Type] += expense.Cost

        typeList = ["Entertainment", "Housing/Rent", "Medical", "Groceries", "Take-out", "Insurance", "Taxes", "Transportation", "Clothing"]

        for type in typeList:
            if type not in costPerType:
                costPerType[type] = 0
        
        # Separate keys and values into lists
        xAxis, yAxis = zip(*costPerType.items())

        graphData = []
        for i in range(len(xAxis)):
            obj = {
                "label": xAxis[i],
                "value": yAxis[i]
            }
            graphData.append(obj)

        return jsonify({
            "Data": "Success",
            "GraphData": graphData
        }), 200

    #If jwt is not valid, return error
    except ValueError as e:
        return jsonify({'error': f'Error verifying token: {str(e)}'}), 401

"""
This function is called specfically for the line graph in the graphs page.
It returns two separate lists to represent the x and y axis. The x-axis is a list of 
all of the months, while the y-axis is a list of the total amount
spent on each month. Each index in the list corresponds to the other.
"""
@app.route("/GetLineGraph", methods=["GET"])
def GetLineGraph():
    #Retrieve the jwt token from authorization headers
    jwt_token = request.headers['Authorization']

    #If token does not exist,return error
    if not jwt_token:
        return jsonify({'error': 'JWT token not provided'}), 400

    try:
        # Verify the Firebase JWT token
        decoded_token = id_token.verify_firebase_token(
            id_token=jwt_token,
            request=requests.Request(),
            audience= FIREBASE_WEB_API_KEY
        )

        userID = request.args.get('UserID')
        year = request.args.get("Year")

        if userID != decoded_token["user_id"]:
            return jsonify({"Error": "Token ID does not match UserID"}), 400

        expenses = Expense.query.filter_by(UserID = userID, Year = year)

        costPerMonth = dict()

        for expense in expenses:
            if expense.Month not in costPerMonth:
                costPerMonth[expense.Month] = 0
            
            costPerMonth[expense.Month] += expense.Cost
        
        for i in range (1, 12):
            if i not in costPerMonth:
                costPerMonth[i] = 0

        # Separate keys and values into lists
        xAxis, yAxis = zip(*costPerMonth.items())

        monthsArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        graphData = []
        for i in range(len(xAxis)):
            obj = {
                "label": monthsArray[xAxis[i] - 1],
                "cost": yAxis[i]
            }
            graphData.append(obj)


        return jsonify({
            "Data": "Success",
            "GraphData": graphData
        }), 200

    #If jwt is not valid, return error
    except ValueError as e:
        return jsonify({'error': f'Error verifying token: {str(e)}'}), 401

"""
This function is called specfically for the line graph in the graphs page.
It returns two separate lists to represent the x and y axis. The x-axis is a list of 
all of the types, while the y-axis is a percet amount. Each index in the list corresponds to the other.
"""
@app.route("/GetPieChart", methods=["GET"])
def GetPieChart():
    jwt_token = request.headers['Authorization']

    #If token does not exist,return error
    if not jwt_token:
        return jsonify({'error': 'JWT token not provided'}), 400

    try:
        # Verify the Firebase JWT token
        decoded_token = id_token.verify_firebase_token(
            id_token=jwt_token,
            request=requests.Request(),
            audience= FIREBASE_WEB_API_KEY
        )

        userID = request.args.get('UserID')
        month = request.args.get("Month")

        if userID != decoded_token["user_id"]:
            return jsonify({"Error": "Token ID does not match UserID"}), 400

        expenses = Expense.query.filter_by(UserID = userID, Month = month)

        typePercent = dict()
        totalCost = 0

        for expense in expenses:
            if expense.Type not in typePercent:
                typePercent[expense.Type] = 0
            totalCost += expense.Cost
            typePercent[expense.Type] += expense.Cost
        
        for type in typePercent:
            typePercent[type] = typePercent[type] // totalCost

        typeList = ["Entertainment", "Housing/Rent", "Medical", "Groceries", "Take-out", "Insurance", "Taxes", "Transportation", "Clothing"]

        for type in typeList:
            if type not in typePercent:
                typePercent[type] = 0

        # Separate keys and values into lists
        xAxis, yAxis = zip(*typePercent.items())
        graphData = []
        for i in range(len(xAxis)):
            obj = {
                "label": xAxis[i],
                "value": yAxis[i]
            }
            graphData.append(obj)

        return jsonify({
            "Data": "Success",
            "GraphData": graphData
        }), 200

    #If jwt is not valid, return error
    except ValueError as e:
        print(e)
        return jsonify({'error': f'Error verifying token: {str(e)}'}), 401

#Delete Expense API route and functionality
@app.route("/DeleteExpense", methods=["DELETE"])
def DeleteExpense():
    expenseID = request.args.get("ExpenseID")
    userID = request.args.get("UserID")

    # Retrieve the jwt token from authorization headers
    jwt_token = request.headers["Authorization"]
    
    #If token does not exist,return error    
    if not jwt_token:
        return jsonify({'error': 'JWT token not provided'}), 400
    try:
    # Verify the Firebase JWT token
        decoded_token = id_token.verify_firebase_token(
            id_token=jwt_token,
            request=requests.Request(),
            audience= FIREBASE_WEB_API_KEY
        )   
        if userID != decoded_token["user_id"]:
            return jsonify({"Error": "Token ID does not match UserID"}), 400
    
        userExpense = Expense.query.filter_by(UserID = userID, ExpenseID = expenseID).first()
        if userExpense is None:
            return jsonify({"Data": "Does Not Exist"}), 400
        db.session.delete(userExpense)
        db.session.commit()
        return jsonify({"Data": "Successfully deleted Expense"}), 200
   
        #Load data from request
    except ValueError as e:
        print(e)
        return jsonify({'error': f'Error verifying token: {str(e)}'}), 401

 
#Update Expense API route and functionality
@app.route("/UpdateExpense", methods=["PUT"])
def UpdateExpense():
    # Retrieve the jwt token from authorization headers
    jwt_token = request.headers["Authorization"]
    #If token does not exist,return error
    if not jwt_token:
        return jsonify({'error': 'JWT token not provided'}), 400
    try:
        # Verify the Firebase JWT token
        decoded_token = id_token.verify_firebase_token(
            id_token=jwt_token,
            request=requests.Request(),
            audience= FIREBASE_WEB_API_KEY)
        
        #Load data from request
        Json = request.json
        data =json.loads(request.data)

        userID = data["UserID"]
        if userID != decoded_token["user_id"]:
            return jsonify({"Error": "Token ID does not match UserID"}), 400

        expenseAmount = data["Expense"]
        expenseType = data["ExpenseType"]
        expenseName = data["ExpenseName"]
        expenseID = data["ExpenseID"]

        expense = Expense.query.filter_by(ExpenseID = expenseID, UserID = userID).first()

        if expense is None:
            return jsonify({"Error": "Not found"}), 400
        
        expense.Title = expenseName
        expense.Cost = expenseAmount
        expense.Type = expenseType

        db.session.commit()
        return jsonify({"Data": "Success"}), 200
    except ValueError as e:
        print(e)
        return jsonify({'error': f'Error verifying token: {str(e)}'}), 401       

# #Display Name update within the Accounts page
@app.route("/UpdateDisplayName", methods=["PUT"])
def UpdateDisplayName():
    # Retrieve the jwt token from authorization headers
    jwt_token = request.headers["Authorization"]
    # If token does not exist, return error
    if not jwt_token:
        return jsonify({"error": "JWT token not provided"}), 400
    try:
        # Verify the Firebase JWT token
        decoded_token = id_token.verify_firebase_token(
            id_token=jwt_token,
            request=requests.Request(),
            audience=FIREBASE_WEB_API_KEY,
        )

        # Load data from request
        data = json.loads(request.data)

        userID = data["UserID"]
        displayName = data["DisplayName"]
        if userID != decoded_token["user_id"]:
            return jsonify({"Error": "Token ID does not match UserID"}), 400

        user = User.query.filter_by(UserID=userID).first()
        user.DisplayName = displayName
        db.session.commit()

        return jsonify({"Data": "Success"}), 200
    except ValueError as e:
        print(e)
        return jsonify({"error": f"Error verifying token: {str(e)}"}), 401      

if __name__ == "__main__":
    with app.app_context():
        # Perform database operations within the context
        db.create_all()
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, port = port, host='0.0.0.0')