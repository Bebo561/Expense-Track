import { useState } from 'react';
import './Styles/AccountPage.css';
import Navbar from './Navbar';
import { getAuth, signOut, updateProfile } from "firebase/auth"
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { clearToken, clearUid} from "./Redux/authAction";
import axios from 'axios';

export default function AccountPage() {
  var [displayName, setDisplayName] = useState('');
  const nav = useNavigate();

  //Used to authenticate if the user is logged in before making any api request
  const auth = getAuth();
  const user = auth.currentUser;
  const header = auth.currentUser?.displayName;
  const Token = useSelector((state : any) => state.auth.token);
  const userID = useSelector((state : any) => state.auth.uid);
  const dispatch = useDispatch();

  var [headerName, setHeaderName] = useState(header);

  if(!user){
    nav("/Login")
  }

  const handleUpdateProfile = () => {
    if(displayName.trim() === ""){
      return toast.error("Please enter proper inputs", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    const object = {
      UserID: userID,
      DisplayName: displayName
    }
    const url = "https://expensetrackserver-1ca84aedde02.herokuapp.com/UpdateDisplayName"
    axios.put(url, object, {headers: {Authorization: Token }}).then((response) =>{
      console.log(response);
  }).catch((error) =>{
      console.log(error)
  });
    updateProfile(user!, {
      displayName: displayName
    }).then(() => {
      setHeaderName(displayName);
      return toast.success("Success", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }).catch((error) => {
      return toast.error(error, {
        position: toast.POSITION.TOP_RIGHT,
      });
    });
  };

  const handleSignOut = () => {
    // Add bank connection logic here
    console.log('Connecting to your bank');

    signOut(auth).then(() => {
      dispatch(clearUid());
      dispatch(clearToken());
      nav('/Login');
   }).catch((error) => {
    return toast.error(error, {
      position: toast.POSITION.TOP_RIGHT,
    });
  });
  };

  return (
    <>
      <Navbar />
      <div className="user-profile-page">
      <ToastContainer />
        <h2 id="AccountHeader">{headerName}</h2>
        <form className="profile-form">
          <div className="form-group">
            <label htmlFor="firstName" id="AccountLabel">Display Name:</label>
            <input
              type="text"
              id="firstName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <button type="button" className="update-btn" onClick={handleUpdateProfile}>
            Update Profile
          </button>
          <button type="button" className="connect-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </form>
      </div>
    </>
  );
};

