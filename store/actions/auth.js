import { AsyncStorage } from 'react-native';

import ApiConstant from '../../constants/ApiConstant';

// actions identifiers
export const AUTHENTICATE  = 'AUTHENTICATE';
export const LOGOUT  = 'LOGOUT';

let timer

export const authenticate = (userId, token, expireTime) => {

    return dispatch => {

        dispatch(setLogoutTimer(expireTime));

        dispatch({
            type: AUTHENTICATE,
            userId: userId,
            token: token
        });
    };
};

export const login = (email, password) => {

    return async dispatch => {
        
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${ApiConstant.apiKey}`,
        {
            method: 'POST',

            headers: {
                'Content-type' : 'application/json'
            },

            body: JSON.stringify({
                email: email,
                password: password,
                returnSecureToken: true
            })

        });

        if(!response.ok) {

            let errorMessage = 'Something went wrong with login!';

            const errRespData = await response.json();

            const errorId = errRespData.error.message;

            if(errorId === 'EMAIL_NOT_FOUND') {
                errorMessage  = 'This email could not be found';
            } else   if(errorId === 'INVALID_PASSWORD') {
                errorMessage  = 'This password is not valid';
            }

            throw new Error(errorMessage);
        }

        const respData = await response.json();

        const expiredTimeInMilliSecs = parseInt(respData.expiresIn) * 1000;

        dispatch(authenticate(respData.localId, respData.idToken, expiredTimeInMilliSecs));

        const expirationDate = new Date(new Date().getTime() + expiredTimeInMilliSecs);
        // saving data to local storage!
        saveDataToStorage(respData.idToken, respData.localId, expirationDate);
    };
};

export const signup = (email, password) => {

    return async dispatch => {
        
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${ApiConstant.apiKey}`,
        {
            method: 'POST',

            headers: {
                'Content-type' : 'application/json'
            },

            body: JSON.stringify({
                email: email,
                password: password,
                returnSecureToken: true
            })

        });

        if(!response.ok) {

            let errorMessage = 'Something went wrong with regiter!';

            const errRespData = await response.json();

            const errorId = errRespData.error.message;

            if(errorId === 'EMAIL_EXISTS') {
                errorMessage  = 'This email already exists!';
            } 

            throw new Error(errorMessage);
        }

        const respData = await response.json();

        const expiredTimeInMilliSecs = parseInt(respData.expiresIn) * 1000;

        dispatch(authenticate(respData.localId, respData.idToken, expiredTimeInMilliSecs));

        const expirationDate = new Date(new Date().getTime() + expiredTimeInMilliSecs);
        // saving data to local storage!
        saveDataToStorage(respData.idToken, respData.localId, expirationDate);

    };
};

export const logout = () => {

    clearLogoutTimer();
    AsyncStorage.removeItem(ApiConstant.userData);
    
    return { type: LOGOUT };
}


const clearLogoutTimer = () => {

    if(timer) {
        // clearTimeout is a built in js function
        clearTimeout(timer);
    }
};

const setLogoutTimer = expirationTime => {

    return dispatch => {
        // setTimeout is a async function
        timer = setTimeout(() => {
            dispatch(logout());
        }, expirationTime);
    }
};

// used to save date that persists across app re-launchings
const saveDataToStorage = (token, userId, expirationDate) => {
    AsyncStorage.setItem(ApiConstant.userData, 
    JSON.stringify({
        token: token,
        userId: userId,
        expireAt: expirationDate.toISOString()
    }));
}