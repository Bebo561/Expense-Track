import "./Styles/Login.css";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, provider} from "../Firebase";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import { setToken, setUID } from "./Redux/authAction";

export default function Login() {
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var nav = useNavigate();
  var dispatch = useDispatch();
  
  //Code saved for later - const t = useSelector((state) => state.auth.token);

  /**
    * Logs in the user using email and password, saves the user id into redux storage
    * and then creates a web token that will be used to validate their calls to the API. The function also
    * checks if the user left the inputs empty, and returns an error urging them to re-enter inputs.
    * @constructor
    * @param {auth} - This variable authenticates the user for a limited amount of time in the web application
    * @param {email} - This variable holds the user inputted string for their email
    * @param {password} - This variable holds the user inputted string for their password.  
    * 
    */
  function LoginWithEmail(event: React.MouseEvent<HTMLFormElement>) {
    event.preventDefault();
    if (email.trim() === "" || password.trim() === "") {
      setEmail("");    
      setPassword("");
      return toast.error("Please do not leave inputs blank !", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        const uid = userCredentials.user.uid;
        userCredentials.user.getIdToken().then(token => {
            dispatch(setToken(token));
        }).catch((error) =>{
            alert(error.message);
        })

        dispatch(setUID(uid));

        
        toast.success("Success !", {
            position: toast.POSITION.TOP_RIGHT,
          });
        setTimeout(() => {
            // Perform the navigation after the delay
            nav('/Home');
          }, 1000);
        //Will navigate them to homepage in future
      })
      .catch((error) => {
        return toast.error(error.message, {
            position: toast.POSITION.TOP_RIGHT,
        });
      });
  }

  /**
    * Logs in the user using their google account, saves the user id into redux storage
    * and then creates a web token that will be used to validate their calls to the API. The function also
    * checks if the user left the inputs empty, and returns an error urging them to re-enter inputs.
    * @constructor
    * @param {auth} - This variable authenticates the user for a limited amount of time in the web application
    * @param {email} - This variable holds the user inputted string for their email
    * @param {password} - This variable holds the user inputted string for their password.  
    * @param {provider} - This is the email provider the user wishes to sign in with, in this case Google.  
    * 
    */
  function GoogleSignIn(event: React.MouseEvent<HTMLButtonElement>){
    event.preventDefault();
    signInWithPopup(auth, provider).then((userCredentials) =>{
        const uid = userCredentials.user.uid;
        
        userCredentials.user.getIdToken().then(token => {
            dispatch(setToken(token));
        }).catch((error) =>{
            return toast.error(error.message, {
                position: toast.POSITION.TOP_RIGHT,
            });
        })

        dispatch(setUID(uid));

        toast.success("Success !", {
            position: toast.POSITION.TOP_RIGHT,
          });
          setTimeout(() => {
            nav('/Home');
          }, 1000);
    }).catch((error) =>{
        return toast.error(error.message, {
            position: toast.POSITION.TOP_RIGHT,
        });
    })
  }

  return (
    <>
      <div className="LoginAndRegisterBG" id="LoginBG">
        <ToastContainer/>
        <form id="LoginForm" onSubmit={LoginWithEmail}>
          <h1 id="LoginHeader">Welcome</h1>

          <input
            type="Email"
            className="LoginInput"
            value={email}
            placeholder="E-Mail"
            onChange={(e) => setEmail(e.target.value)}
          ></input>

          <input
            type="password"
            className="LoginInput"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          ></input>
          <button id="LoginButton" className="LoginButtons">
            Login
          </button>
          <button id="LoginGoogle" className="LoginButtons" onClick={GoogleSignIn}>
            Login With Google{" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="20px"
              height="20px"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              />
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              />
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              />
            </svg>
          </button>
          <Link to="/Register" className="LoginRedirect">
            Register
          </Link>
          <Link to="/ForgotPassword" className="LoginRedirect">Forgot Password?</Link>
        </form>
      </div>
    </>
  );
}
