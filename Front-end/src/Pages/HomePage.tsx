import './Styles/HomePage.css';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from './Navbar';
import axios from 'axios';
import { getAuth } from "firebase/auth";
import { clearToken, clearUid} from "./Redux/authAction";

export default function HomePage(){
    //To do - Add function that checks if the user is currently logged in, and redirect to logged in homepage.
    const nav = useNavigate();

    const dispatch = useDispatch();

    const Token = useSelector((state : any) => state.auth.token);
    const userID = useSelector((state : any) => state.auth.uid);

    //Used to authenticate if the user is logged in before making any api request
    const auth = getAuth();
    const user = auth.currentUser;

    if(!user){
        nav("/Login")
    }

    //This represents the current displayed total budget for the total month
    var [displayedBudget, setDisplayedBudget] = useState(0);
    //This represents the inputted budget by the user, if validiated it is then set to the displayed budget.
    var [updatedBudget, setUpdatedBudget] = useState(0);
    //This variable represnts the total expenses made by the user
    var [totalExpense, setTotalExpense] = useState(0);

    var [budgetID, setBudgetID] = useState(0);

    //The following lines of code are used to extract the current year and month, to automatically load the monthly budget 
    //based on these inputs
    const currentDate = new Date();
    const currMonth = currentDate.getMonth() + 1;
    const currYear = currentDate.getFullYear();

    //This variable represents the year that the user wants to view their monthly budget and expenses
    var [year, setYear] = useState(currYear);
    //This variable represents the month that the user wants to view their monthly budget and expenses
    var [month, setMonth] = useState(currMonth);
    //This variable represents a boolean variable used to conditionally render based on when the user wants to update their
    //monthly budget displayed at the top of the page.
    var [changeBudget, setChangeBudget] = useState(false);
    //This variable represents a boolean variable used to conditionally render components based on if a user wants to add a new expense
    var [createExpense, setCreateExpense] = useState(false);

    //These variables represent the user inputs for creating a new expense
    var [expenseType, setExpenseType] = useState('');
    var [expense, setExpense] = useState(0);
    var [expenseName, setExpenseName] = useState('');

    //This variable represents the array that holds all objects containing expenses, and will be used in a map to render them.
    var [expenseArray, setExpenseArray] = useState<Object[]>([]);

    //These variables are used to conditionally render the expand page for a specific expense
    var [expandExpense, setExpandExpense] = useState(false);
    var [expandID, setExpandID] = useState<Number>();

    //This variable is used to conditionally render the edit page
    var [editExpense, setEditExpense] = useState(false);

    //This variables accept the input for the expense being edited.
    var [editID, setEditID] = useState<Number>();
    var [editExpenseCost, setEditExpenseCost] = useState(0);
    var [editName, setEditName] = useState('');
    var [editType, setEditType] = useState('');

    //Holds all year options for the year select component.
    const yearOptions = [
        { value: 2024, label: 2024},
        { value: 2023, label: 2023 },
        { value: 2022, label: 2022 },
    ]

    //Holds all month options for the month select component.
    const monthOptions = [
        { value: 1, label: "January" },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ]

    //Holds all expense type options for the expense select component.
    const expenseOptions = [
        { value: "Entertainment", label: "Entertainment" },
        { value: "Housing/Rent", label: "Housing/Rent" },
        { value: "Medical", label: "Medical" },
        { value: "Groceries", label: "Groceries" },
        { value: "Take-out", label: "Take-out" },
        { value: "Insurance", label: "Insurance" },
        { value: "Taxes", label: "Taxes" },
        { value: "Transportation", label: "Transportation" },
        { value: "Clothing", label: "Clothing" },
    ]

    //Helper array that is used with the getMonth function in a Date variable type, to display the correct month.
    //The getMonth function returns a number from 0-11 based on the current month, we use this number with this array 
    //to correctly display the current month in english.
    const monthNames = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ];

    //Styling for the year and month react-style components
    const customStyles = {
        control: (base: any) => ({
          ...base,
          height: 50,
        })
      };
      
    //Styling for the react-style components in the create new expense section
    const NewExpenseStyles = {
        control: (base: any) => ({
          ...base,
          height: 20,
        }),
      };
    
      //Get request that receives 
    function retrieveUserData(){
        const url = "https://expensetrackserver-1ca84aedde02.herokuapp.com/RetrieveHomepageData";
        const queryParams = {
            UID: userID,
            Month: month,
            Year: year
        }
        axios.get(url, {params: queryParams, headers: {Authorization: Token }}).then((response) =>{
            console.log(response);
            setDisplayedBudget(response.data.Budget.amount)
            setBudgetID(response.data.Budget.ID);
            setExpenseArray(response.data.Expenses);
           }).catch((error) =>{
            console.log(error)
        });
    }  

    //This useEffect function automatically calculates the totalExpense after any updates are made to the expnseArray.
    useEffect(() => {
        retrieveUserData();
    }, [month, year]); 

    useEffect(() => {
        setTotalExpense(CalculateTotalExpense());
    }, [expenseArray])
    /**
    * When the user clicks the top right login button, it redirects to the login page.
    * @constructor
    * @param {nav} - This variable is used to route the webpage to somewhere else in the application
    * 
    */
    function loginRedirect(event: React.MouseEvent<HTMLButtonElement>){
        event.preventDefault();
        dispatch(clearUid());
        dispatch(clearToken());
        nav("/Login")
    }

    /**
    * This function is used to calculate the total expense by iterating through each object in the expenseArray.
    * @constructor
    * @param {expenseArray} - This variable holds the all of the expense Objects in one list.
    * 
    */
    function CalculateTotalExpense(): number {
        return parseInt(expenseArray.reduce((total, expense : any) => total + expense.Expense, 0).toString());
    }

    /**
    * Used to determine if user inputted data is a valid integer.
    * @constructor
    * @param {value} - This variable represents a string that the function is called with
    * 
    */
    function isNumber(value: string) {
        return /^[0-9]+$/.test(value);
    }

    /**
    * This function is called whenever a user tries to update their budget on the top of the page, it first validates that
    * there was no errors in the user input. Once verified, it updates the displayedBudget by interchaging it with the 
    * updatedBudget variable
    * @constructor
    * @param {updatedBudget} - This variable holds the user input of the desired budget.
    * @param {setDisplayedBudget} - Boolean variable used to conditionally render the input to update the budget.* @param {updatedBudget} - This variable holds the user input of the desired budget.
    * @param {displayedBudget} - This variable holds the budget value that is displayed on screen.
    * 
    */
    function updateBudget(event: React.MouseEvent<HTMLButtonElement>){
        event.preventDefault();
        
        if (!isNumber(updatedBudget.toString())){
            return toast.error("Please enter a number", {
                position: toast.POSITION.TOP_RIGHT,
            });
        }
        
        if(updatedBudget < 0){
            return toast.error("Please enter valid input", {
                position: toast.POSITION.TOP_RIGHT,
            });
        }

        const url = "https://expensetrackserver-1ca84aedde02.herokuapp.com/UpdateMonthlyBudget"

        const budgetObject = {
            BudgetID: budgetID,
            UserID: userID,
            Amount: updatedBudget
        }

        axios.put(url, budgetObject, {headers: {Authorization: Token }}).then((response) =>{
            console.log(response);
            setDisplayedBudget(updatedBudget);
            setChangeBudget(false);
            return toast.success("Successfully updated budget", {
                position: toast.POSITION.TOP_RIGHT,
            });
        }).catch((error) =>{
            console.log(error)
            return toast.error("Error", {
                position: toast.POSITION.TOP_RIGHT,
            });
        });
    }

    /**
    * This function creates a new expense object, and adds the new object to the top of the expenseArray to be displayed
    * on screen. 
    * @constructor
    * @param {year} - Represents the year that the expense takes place
    * @param {month} - Represents the month that the expense takes place
    * @param {expenseType} - Represents the type of expense the user made
    * @param {expense} - Represents the cost of the expense.
    * @param {expenseName} - Represents the name of the expense
    * @param {createExpense} - Boolean variable used to conditionally render expense creation screen.
    * @param {expenseArray} - List that holds all expense objects, used to render objects on screen.
    * 
    */
    function CreateNewExpense(event: React.MouseEvent<HTMLButtonElement>){
        event.preventDefault();
        if(expense === 0 || expenseName.trim() === "" || expenseType === ""){
            return toast.error("Please do not leave inputs blank", {
                position: toast.POSITION.TOP_RIGHT,
            });
        }

        if(expense < 0){
            return toast.error("Please enter valid expense amount", {
                position: toast.POSITION.TOP_RIGHT,
            });
        }

        const expenseObject = {
            Expense: expense,
            ExpenseType: expenseType,
            ExpenseMonth: month,
            ExpenseYear: year,
            ExpenseName: expenseName,
            UID: userID
        }

        const url = 'https://expensetrackserver-1ca84aedde02.herokuapp.com/CreateExpense'
      
        axios.post(url, expenseObject, {headers: {Authorization: Token }}).then((response) =>{
            console.log(response.data);
            setExpenseArray(expenseArray => [response.data.Expense, ...expenseArray]);
        }).catch((error) =>{
            console.log(error)
        });

        
        setCreateExpense(false);
        return toast.success("Successfully created expense", {
            position: toast.POSITION.TOP_RIGHT,
        });
    }

    /**
    * Deletes the current expense by taking in an input of the expenseID, finding the object in the array with the same ID,
    * and filtering it out of the array. It then closes the expanded view, and returns a success message.
    * @constructor
     * @param {expandExpense} - Boolean Variable used to conditionally render an expanded view.
    * @param {expandID} - This variable takes in the input of the expenseID, and is used to only display the contents of 
    * the expense object that the user clicked on.
    * @param {expenseID} - Passed expenseID variable to the function
    * @param {expenseArray} - Array of objects that holds each of the expense objects.
    */
    function DeleteExpense(expenseID : number){
        const url = "https://expensetrackserver-1ca84aedde02.herokuapp.com/DeleteExpense";
        const queryParams = {
            UserID: userID,
            ExpenseID: expenseID
        }
        axios.delete(url, {params: queryParams, headers: {Authorization: Token }}).then((response) =>{
            console.log(response);
            const updatedExpenses = expenseArray.filter((expense: any) => expense.ExpenseID !== expenseID);
            setExpenseArray(updatedExpenses);
            setExpandExpense(false);
            setExpandID(-1);
           }).catch((error) =>{
            console.log(error)
        });
        return toast.success("Successfully deleted expense", {
            position: toast.POSITION.TOP_RIGHT,
        });
    }

    /**
    * This function allows the user to see an expanded view of the expense once they click on the expenseDiv.
    * @constructor
    * @param {expandExpense} - Boolean Variable used to conditionally render an expanded view.
    * @param {expandID} - This variable takes in the input of the expenseID, and is used to only display the contents of 
    * the expense object that the user clicked on.
    * @param {eID} - Passed expenseID variable to the function
    */
    function ExpandColumn(eID : number){
        console.log(eID);
        setExpandExpense(true);
        setExpandID(eID)
    }

    /**
    * Closes the expanded column once the user clicks the top right x button. Sets the expandExpense variable to false, and
    * resets the expandID value to -1, so it cannot represent any object ID.
    * @constructor
    * @param {expandExpense} - Boolean Variable used to conditionally render an expanded view.
    * @param {expandID} - This variable takes in the input of the expenseID, and is used to only display the contents of 
    * the expense object that the user clicked on.
    * @param {eID} - Passed expenseID variable to the function
    */
    function CloseExpandedColumn(event: React.MouseEvent<HTMLHeadElement>){
        event.preventDefault();
        setExpandExpense(false);
        setExpandID(-1);
    }

    /**
    * Function is called whenever the user wants to edit an expense object. It works by first setting the editExpense value to 
    * true, which is used to conditionally render the edit screen. Then it sets the editID to the id of the expense 
    * object being edited, so the application knows to only render one edit screen for one expense.
    * @constructor
    * @param {editExpense} - Boolean variable used to conditionally render edit screen.
    * @param {eID} - Represents the passed expenseID value to the function
    * @param {editID} - State variable that holds the expenseID to conditionally render 1 edit div.
    * 
    */
    function EditExpense(eID : number){
        setEditExpense(true);
        setEditID(eID);
    }

    /**
    * Cancels the edit by closing the edit view, reseting all edit variables, and returning to the expanded view.
    * @constructor
    * @param {editExpensecost} - Represents the user inputted editExpenseCost.
    * @param {editMonth} - Represents the user inputted edit month.
    * @param {editYear} - Represents the user inputted edit Year.
    * @param {editType} - Represents the user inputted edit expense type.
    * @param {editName} - Represents the user inputted edit expense name.
    * @param {editID} - Represents the expenseID of the expense being edited.
    * @param {editExpense} - Boolean value used to conditionally render the edit page.
    * 
    */
    function CancelEdit(event: React.MouseEvent<HTMLButtonElement>){
        event.preventDefault();

        setEditExpenseCost(0);
        setEditType("");
        setEditName("");
        setEditID(-1);
        setEditExpense(false);
    }

    /**
    * This function saves the editted expense by first validating that the user inputted values are all correct.
    * Then it creates a new editedExpenese object, creates a copy of the object array, finds the index of the object in the 
    * copy array with the same expenseID as the edited object, replaces the object at the index with the new object, and then
    * sets the expenseArray to equal the new copied array.
    * @constructor
    * @param {editExpensecost} - Represents the user inputted editExpenseCost.
    * @param {editType} - Represents the user inputted edit expense type.
    * @param {editName} - Represents the user inputted edit expense name.
    * @param {editID} - Represents the expenseID of the expense being edited.
    * @param {editExpense} - Boolean value used to conditionally render the edit page.
    * @param {expenseID} - Passed expenseID variable to the function
    * @param {expenseArray} - Array of objects that holds each of the expense objects.
    */
    function SaveEdit(eID : number){

        if(editExpenseCost === 0 || editName.trim() === "" || editType === ""){
            return toast.error("Please do not leave inputs blank", {
                position: toast.POSITION.TOP_RIGHT,
            });
        }

        if(editExpenseCost < 0){
            return toast.error("Please enter valid expense amount", {
                position: toast.POSITION.TOP_RIGHT,
            });
        }

        const editedExpense = {
            Expense: editExpenseCost,
            ExpenseType: editType,
            ExpenseMonth: month,
            ExpenseYear: year,
            ExpenseName: editName,
            ExpenseID: eID,
            UserID: userID
        }

        const url = "https://expensetrackserver-1ca84aedde02.herokuapp.com/UpdateExpense"

        axios.put(url, editedExpense, {headers: {Authorization: Token }}).then((response) =>{
            console.log(response);
            var newArray = expenseArray.map(expense => ({ ...expense }));


            const index = newArray.findIndex((expense: any) => expense.ExpenseID === editedExpense.ExpenseID);
    
            if (index !== -1) {
                newArray[index] = editedExpense;
                setExpenseArray(newArray);
            }
            setEditExpense(false);
            setEditID(-1);
            return toast.success("Successfully updated budget", {
                position: toast.POSITION.TOP_RIGHT,
            });
        }).catch((error) =>{
            console.log(error)
            return toast.error("Error", {
                position: toast.POSITION.TOP_RIGHT,
            });
        });
    }

    /**
    * Updates the month state variable, and resets all data being currently displayed as a time period will be displayed.
    * @constructor
    * @param {month} - Current month value in integer form.
    * @param {displayedBudget} - Budget displayed onscreen.
    * @param {totalExpense} - Total expenses of the current month.
    * @param {expenseArray} - Array of objects that holds each expense, and used to display all expenses..
    */
    function UpdateMonth(selectedOption : any){
        setMonth(parseInt(selectedOption.value));
        console.log(month);
    }

    
    /**
    * Updates the year state variable, and resets all data being currently displayed as a time period will be displayed.
    * @constructor
    * @param {year} - Current year value in integer form.
    * @param {displayedBudget} - Budget displayed onscreen.
    * @param {totalExpense} - Total expenses of the current month.
    * @param {expenseArray} - Array of objects that holds each expense, and used to display all expenses..
    */
    function UpdateYear(selectedOption : any){
        setYear(parseInt(selectedOption.value));
        console.log(year);
    }

    return (
      <>
      <Navbar />
        <div id="HomepageBG">
          <ToastContainer />
          <button
            id="HomepageLogin"
            className="HomepageBlueButtons"
            onClick={loginRedirect}
          >
            Log Out
          </button>
          <div id="HomepageTopLeft">
            <h1 className="HomepageLabel">Monthly Budget</h1>
            {changeBudget === true ? (
              <>
                <input
                  id="BudgetInput"
                  placeholder="$"
                  type="number"
                  maxLength={5}
                  onChange={(e) => setUpdatedBudget(parseInt(e.target.value))}
                ></input>
                <button
                  id="CancelBudget"
                  onClick={() => setChangeBudget(false)}
                >
                  Cancel
                </button>
                <button
                  id="SaveBudget"
                  className="HomepageGreenButtons"
                  onClick={updateBudget}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <h1 className="HomepageBudgets">$ {displayedBudget}</h1>
                <button
                  id="UpdateBudget"
                  className="HomepageGreenButtons"
                  onClick={() => setChangeBudget(true)}
                >
                  Update
                </button>
              </>
            )}
          </div>
          <div id="HomepageTopRight">
            <h1 className="HomepageLabel">Budget Remaining</h1>
            <h1 className="HomepageBudgets">
              ${displayedBudget - totalExpense}
            </h1>
          </div>
          <div id="TimeSlotHolder">
            <h1 id="TimeSlotHelper">Please select time slot to begin</h1>
            <Select
              className="TimeSelect"
              options={yearOptions}
              styles={customStyles}
              defaultValue={currYear}
              onChange={(selectedOption: any) => UpdateYear(selectedOption)}
              placeholder={currYear}
            />
            <Select
              className="TimeSelect"
              defaultValue={month}
              options={monthOptions}
              styles={customStyles}
              onChange={(selectedOption: any) => UpdateMonth(selectedOption)}
              placeholder={monthNames[currMonth - 1]}
            />
          </div>
          <div id="ExpenseInputHolder">
            <h1 id="ExpensesHeader">Expenses</h1>
            {!createExpense && (
              <button
                id="CreateNewExpense"
                className="HomepageGreenButtons"
                onClick={() => setCreateExpense(true)}
              >
                +
              </button>
            )}
            {createExpense && (
              <>
                <div id="NewExpenseBoard">
                  <Select
                    className="NewExpenseSelect"
                    options={expenseOptions}
                    styles={NewExpenseStyles}
                    onChange={(selectedOption: any) =>
                      setExpenseType(selectedOption.value)
                    }
                    placeholder="Expense Type"
                  />
                  <input
                    type="number"
                    placeholder="$"
                    className="NewExpenseInput"
                    maxLength={6}
                    onChange={(e) => setExpense(parseInt(e.target.value))}
                  ></input>
                  <input
                    type="name"
                    placeholder="Name"
                    className="NewExpenseInput"
                    maxLength={20}
                    onChange={(e) => setExpenseName(e.target.value)}
                  ></input>
                </div>
                <div id="NewExpenseButtonHolder">
                  <button
                    id="DeleteNewExpense"
                    onClick={() => setCreateExpense(false)}
                  >
                    Delete
                  </button>
                  <button
                    id="SaveNewExpense"
                    className="HomepageBlueButtons"
                    onClick={CreateNewExpense}
                  >
                    Save
                  </button>
                </div>
              </>
            )}
            {expenseArray.length !== 0 && 
                expenseArray.map((expenseColumn: any) => {
                    console.log(expenseArray)
                    return (
                      <>
                        <div className="ExpenseColumn" key={expenseColumn.ExpenseID} onClick={() =>ExpandColumn(expenseColumn.ExpenseID)}>
                          <h1 id="ExpenseColumnCost">${expenseColumn.Expense}</h1>
                          <h1 id="ExpenseColumnTitle">
                            {expenseColumn.ExpenseName}
                          </h1>
            
                        </div>
                        {expandExpense && expandID === expenseColumn.ExpenseID && !editExpense &&
                            <>
                            <div id="Overlay">
                                <div id="ExpenseExpanded">
                                    <h1 id="ExpandedExit" onClick={CloseExpandedColumn}>X</h1>
                                    <h1 id="ExpandedCost">Total Cost: ${expenseColumn.Expense}</h1>
                                    <h1 id="ExpandedTitle">Title: {expenseColumn.ExpenseName}</h1>
                                    <h1 className="ExpandedHeader">Type: {expenseColumn.ExpenseType}</h1>
                                    <h1 className="ExpandedHeader"> {expenseColumn.ExpenseMonth} - {expenseColumn.ExpenseYear}</h1>
                                    <button id="DeleteExpense" onClick={() => DeleteExpense(expenseColumn.ExpenseID)}>
                                     <svg
                              fill="#000000"
                              version="1.1"
                              id="Capa_1"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 482.428 482.429"
                            >
                              <g>
                                <g>
                                  <path
                                    d="M381.163,57.799h-75.094C302.323,25.316,274.686,0,241.214,0c-33.471,0-61.104,25.315-64.85,57.799h-75.098
			c-30.39,0-55.111,24.728-55.111,55.117v2.828c0,23.223,14.46,43.1,34.83,51.199v260.369c0,30.39,24.724,55.117,55.112,55.117
			h210.236c30.389,0,55.111-24.729,55.111-55.117V166.944c20.369-8.1,34.83-27.977,34.83-51.199v-2.828
			C436.274,82.527,411.551,57.799,381.163,57.799z M241.214,26.139c19.037,0,34.927,13.645,38.443,31.66h-76.879
			C206.293,39.783,222.184,26.139,241.214,26.139z M375.305,427.312c0,15.978-13,28.979-28.973,28.979H136.096
			c-15.973,0-28.973-13.002-28.973-28.979V170.861h268.182V427.312z M410.135,115.744c0,15.978-13,28.979-28.973,28.979H101.266
			c-15.973,0-28.973-13.001-28.973-28.979v-2.828c0-15.978,13-28.979,28.973-28.979h279.897c15.973,0,28.973,13.001,28.973,28.979
			V115.744z"
                                  />
                                  <path
                                    d="M171.144,422.863c7.218,0,13.069-5.853,13.069-13.068V262.641c0-7.216-5.852-13.07-13.069-13.07
			c-7.217,0-13.069,5.854-13.069,13.07v147.154C158.074,417.012,163.926,422.863,171.144,422.863z"
                                  />
                                  <path
                                    d="M241.214,422.863c7.218,0,13.07-5.853,13.07-13.068V262.641c0-7.216-5.854-13.07-13.07-13.07
			c-7.217,0-13.069,5.854-13.069,13.07v147.154C228.145,417.012,233.996,422.863,241.214,422.863z"
                                  />
                                  <path
                                    d="M311.284,422.863c7.217,0,13.068-5.853,13.068-13.068V262.641c0-7.216-5.852-13.07-13.068-13.07
			c-7.219,0-13.07,5.854-13.07,13.07v147.154C298.213,417.012,304.067,422.863,311.284,422.863z"
                                  />
                                </g>
                              </g>
                                        </svg>
                                    </button>
                                    <button
                                    className="HomepageGreenButtons"
                                    id="EditExpense"
                                    onClick={() => EditExpense(expenseColumn.ExpenseID)}
                                    >
                                        <svg
                              fill="#000000"
                              version="1.1"
                              id="Capa_1"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 348.882 348.882"
                            >
                              <g>
                                <path
                                  d="M333.988,11.758l-0.42-0.383C325.538,4.04,315.129,0,304.258,0c-12.187,0-23.888,5.159-32.104,14.153L116.803,184.231
		c-1.416,1.55-2.49,3.379-3.154,5.37l-18.267,54.762c-2.112,6.331-1.052,13.333,2.835,18.729c3.918,5.438,10.23,8.685,16.886,8.685
		c0,0,0.001,0,0.001,0c2.879,0,5.693-0.592,8.362-1.76l52.89-23.138c1.923-0.841,3.648-2.076,5.063-3.626L336.771,73.176
		C352.937,55.479,351.69,27.929,333.988,11.758z M130.381,234.247l10.719-32.134l0.904-0.99l20.316,18.556l-0.904,0.99
		L130.381,234.247z M314.621,52.943L182.553,197.53l-20.316-18.556L294.305,34.386c2.583-2.828,6.118-4.386,9.954-4.386
		c3.365,0,6.588,1.252,9.082,3.53l0.419,0.383C319.244,38.922,319.63,47.459,314.621,52.943z"
                                />
                                <path
                                  d="M303.85,138.388c-8.284,0-15,6.716-15,15v127.347c0,21.034-17.113,38.147-38.147,38.147H68.904
		c-21.035,0-38.147-17.113-38.147-38.147V100.413c0-21.034,17.113-38.147,38.147-38.147h131.587c8.284,0,15-6.716,15-15
		s-6.716-15-15-15H68.904c-37.577,0-68.147,30.571-68.147,68.147v180.321c0,37.576,30.571,68.147,68.147,68.147h181.798
		c37.576,0,68.147-30.571,68.147-68.147V153.388C318.85,145.104,312.134,138.388,303.85,138.388z"
                                />
                              </g>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            </>
                        }
                        {
                            editExpense && editID === expenseColumn.ExpenseID && 
                            <>
                                <div id="Overlay">
                                    <div id="ExpenseExpanded">
                                        <div className="EditDiv">
                                            <h1 className="EditHeader">Total Cost:</h1>
                                            <input type="number" maxLength={6} className="EditInput" onChange={(e) => setEditExpenseCost(parseInt(e.target.value))}></input>
                                        </div>
                                        <div className="EditDiv">
                                            <h1 className="EditHeader">Expense Title:</h1>
                                            <input type="text" maxLength={20} className="EditInput" onChange={(e) => setEditName(e.target.value)}></input>
                                        </div>
                                        <div className="EditDiv">
                                            <h1 className="EditHeader">Expense Type:</h1>
                                            <Select
                                                className="EditSelect"
                                                options={expenseOptions}
                                                styles={NewExpenseStyles}
                                                onChange={(selectedOption: any) =>
                                                    setEditType(selectedOption.value)
                                                }
                                                placeholder={"Expense Type"}
                                            />
                                        </div>

                                        <div className="EditButtonHolder">
                                            <button id="CancelEdit" onClick={CancelEdit}>Cancel</button>
                                            <button className="HomepageGreenButtons" id="SaveEdit" onClick={() => SaveEdit(expenseColumn.ExpenseID)}>Save</button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        }
                      </>
                    );
                })
            }
          </div>
        </div>
      </>
    );
}