const initialState = {
    token: null,
    uid: null,
  };
  
  const authReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_TOKEN':
        return { ...state, token: action.payload };
      case 'CLEAR_TOKEN':
        return { ...state, token: null };
      case 'SET_UID':
        return { ...state, uid: action.payload};
      case 'CLEAR_UID':
        return {...state, uid: null};
      default:
        return state;
    }
  };
  
  export default authReducer;