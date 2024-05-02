from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
   UserID = db.Column(db.String, primary_key = True)
   DisplayName = db.Column(db.String)
   ProfilePicture = db.Column(db.String)

class Expense(db.Model):
    ExpenseID = db.Column(db.Integer, primary_key = True)
    Cost = db.Column(db.Integer)
    Title = db.Column(db.String)
    Type = db.Column(db.String)
    Month = db.Column(db.Integer)
    Year = db.Column(db.Integer)
    UserID = db.Column(db.String)

class Budget(db.Model):
    BudgetID = db.Column(db.Integer, primary_key=True)
    Month = db.Column(db.Integer)
    Year = db.Column(db.Integer)
    UserId = db.Column(db.String)
    Amount = db.Column(db.Integer)