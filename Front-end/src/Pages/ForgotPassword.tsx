import { ToastContainer, toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../Firebase";
import './Styles/ForgotPassword.css'
import 'react-toastify/dist/ReactToastify.css';

export default function ForgotPassoword(){
    var [email, setEmail] = useState('');
    var [emailSent, setEmailSent] = useState(false);

    /**
    * This function sends a reset password email to users if the email they inputted exists within our user database.
    * Users can then follow the link in the email sent to reset their passwords. This function will return an error if the 
    * email entered is incorrect, or if an empty string is entered as an email.
    * @constructor
    * @param {auth} - This variable authenticates the user for a limited amount of time in the web application
    * @param {email} - This variable holds the user inputted string for their email
    * 
    */
    function SendEmail(event: React.MouseEvent<HTMLFormElement>){
        event.preventDefault();
        if (email.trim() === "") {
            setEmail("");    
            return toast.error("Please do not leave inputs blank !", {
              position: toast.POSITION.TOP_RIGHT,
            });
        }

        sendPasswordResetEmail(auth, email)
          .then(() => {
            setEmailSent(true);
            return toast.success("Email sent !", {
                position: toast.POSITION.TOP_RIGHT,
            });
          })
          .catch((error) => {
            const errorMessage = error.message;
            return toast.error(errorMessage, {
                position: toast.POSITION.TOP_RIGHT,
              });
        });
    }
    
    return(
        <>
        {
            emailSent ?
            <div className="LoginAndRegisterBG" id="ForgotPasswordBG">
                <ToastContainer/>
                <form id="ForgotPasswordFormEmail">
                    <h2 id="ForgotPasswordEmailSent"> Email Sent !</h2>
                </form>
            </div>
            :
            <div className="LoginAndRegisterBG" id="ForgotPasswordBG">
            <ToastContainer/>
                <form id="ForgotPasswordForm" onSubmit={SendEmail}>
                    <h1 id="ForgotPasswordHeader">Forgot Password</h1>
                    <label id="ForgotPasswordLabel">Email</label>
                    <input type="Email" className="ForgotPasswordInput" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} ></input>
                    <button id="ForgotPasswordButton">Submit</button>
                    <Link to="/Login" className="ForgotPasswordRedirect" >Back To Login</Link>
                </form>
            </div>
            }
        </>
    )
}