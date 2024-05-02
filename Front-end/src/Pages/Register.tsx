import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../Firebase";
import './Styles/Register.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

export default function Register(){
    var [email, setEmail] = useState('');
    var [password, setPassword] = useState('');
    var [validatePassword, setValidatePassword] = useState('');
    const nav = useNavigate();
    
    /**
    * Registers in the user using email and password, will in the future make an api call to the backend server to register
    * their userid in our database. Then will navigate the user back to the login page. Also has small error handling in cases
    * where the user leaves an input blank, or passwords are not matching.
    * @constructor
    * @param {auth} - This variable authenticates the user for a limited amount of time in the web application
    * @param {email} - This variable holds the user inputted string for their email
    * @param {password} - This variable holds the user inputted string for their password.  
    * 
    */
    function Register(event: React.MouseEvent<HTMLFormElement>){
        event.preventDefault();
        if(email.trim() === "" || password.trim() === "" || validatePassword.trim() === ""){
            setEmail("");    
            setPassword("");
            setValidatePassword("");
            return toast.error("Please do not leave inputs blank !", {
                position: toast.POSITION.TOP_RIGHT,
            });
        }

        if(password !== validatePassword){
            setEmail("");    
            setPassword("");
            setValidatePassword("");
            return toast.error("Passwords do not match !", {
                position: toast.POSITION.TOP_RIGHT,
            });
        }

        createUserWithEmailAndPassword(auth, email, password).then((res) => {
            console.log(res);
            const url = "https://expensetrackserver-1ca84aedde02.herokuapp.com/register";
            const postData = {
                UID: res.user.uid
            }
            axios.post(url, postData).then((res) => {
                console.log(res);
                toast.success("Success !", {
                    position: toast.POSITION.TOP_RIGHT,
                });
            }).catch((error) => {
                return toast.error(error, {
                    position: toast.POSITION.TOP_RIGHT,
                });
            })
            nav('/Login');

            
            
        }).catch((error) => {
            return toast.error(error.message, {
                position: toast.POSITION.TOP_RIGHT,
            });
        })
    }
    return (
        <>
            <div id="RegisterBG" className="LoginAndRegisterBG">
                <ToastContainer/>
                <form id="LoginForm" onSubmit={Register} >
                    <h1 id="LoginHeader">Register</h1>
                    <label className="RegisterLabel">Email</label>
                    <input type="Email" className="RegisterInput" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} ></input>
                    <label className="RegisterLabel">Password</label>
                    <input type="password" className="RegisterInput" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}></input>
                    <label className="RegisterLabel">Re-enter Password</label>
                    <input type="password" className="RegisterInput" placeholder="Password" value={validatePassword} onChange={(e) => setValidatePassword(e.target.value)}></input>
                    <button id="LoginButton" className="LoginButtons" >Register</button>
                    <Link to="/Login" id="LoginRegisterRedirect">Back To Login</Link>
                </form>
            </div>
        </>
    )
}