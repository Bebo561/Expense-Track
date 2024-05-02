export const setToken = (token : string) => ({
    type: 'SET_TOKEN',
    payload: token,
  });
  
  export const clearToken = () => ({
    type: 'CLEAR_TOKEN',
  });

  export const setUID = (uid: string) => ({
    type: 'SET_UID',
    payload: uid,
  })

  export const clearUid = () => ({
    type: 'CLEAR_UID',
  });

