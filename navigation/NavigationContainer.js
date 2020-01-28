import React, { useEffect, useRef } from 'react';
import ShopNavigator from './ShopNavigator';
import { useSelector } from 'react-redux';
import { NavigationActions } from 'react-navigation';


// this is a wrapper component used to validate the expiration and redirect the application flow
// to Auth screen in case of expired time
// An auto logout approach
const NavigationContainer = props => {

    // a super workaround to alow navigate into ShopNavigator externally
    const navRef = useRef();

    const isAuth = useSelector( state => !!state.auth.token);

    useEffect(() => {

        if(!isAuth) {
            navRef.current.dispatch(NavigationActions.navigate({
                routeName: 'Auth'
            }));
        }

    },[isAuth])
    
    return <ShopNavigator ref={navRef}/>
};

export default NavigationContainer;
