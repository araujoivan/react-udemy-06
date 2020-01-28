import React, { useEffect } from 'react';
import { View, ActivityIndicator, AsyncStorage, StyleSheet } from 'react-native';
import Colors  from '../../constants/Colors';
import ApiConstant from '../../constants/ApiConstant';
import * as authActions from '../../store/actions/auth';
import { useDispatch } from 'react-redux';

const StartupScreen = props => {

    const dispatch = useDispatch();

    // enables it to run some logic when the component is rendered
    useEffect(() => {

        const tryLogin = async () => {

            // AsyncStorage.getItem returns a promise, for this reason it need a await
            const userData = await AsyncStorage.getItem(ApiConstant.userData);

            if(!userData) {
                props.navigation.navigate('Auth');
                return;
            }

            const userDataJson = JSON.parse(userData);

            // destructuring sintax...
            const {token, userId, expireAt} = userDataJson;
         
            const expirationDate = new Date(expireAt);

            if(expirationDate <= new Date() || !token || !userId) {
                props.navigation.navigate('Auth');
                return;
            }

            const expirationTime = expirationDate.getTime() - new Date().getTime();

            props.navigation.navigate('Shop');
            dispatch(authActions.authenticate(userId, token, expirationTime));
        };

        tryLogin();

    }, [dispatch]);



    return (<View style={ styles.screen}>
            <ActivityIndicator 
                color={Colors.primary}
                size='large'
            />
            </View>);
}

const styles = StyleSheet.create({

    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default StartupScreen;