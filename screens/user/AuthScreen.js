import React, { useState, useReducer, useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, KeyboardAvoidingView, Button, View, ActivityIndicator, Alert } from 'react-native';
// useDispatch for dispatching created actions
import { useDispatch } from 'react-redux';

import Input from '../../components/UI/Input';
import Card from '../../components/UI/Card';
import Colors from '../../constants/Colors';
import * as authActions from '../../store/actions/auth';

import { LinearGradient } from 'expo-linear-gradient';

const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';

const formReducer = (state, action) => {

    if(action.type === FORM_INPUT_UPDATE) {
        // merging the old with the new one
        const updateValues = {
            ...state.inputValues,
            [action.input] : action.value
        };

        const updatedValidities = {
            ...state.inputValidities,
            [action.input]: action.isValid
        };

        let updateFormIsValid = true;

        for(const key in updatedValidities) {
            updateFormIsValid =  updateFormIsValid  && updatedValidities[key];
        }

        return {
            formIsValid: updateFormIsValid,
            inputValidities: updatedValidities,
            inputValues: updateValues
        };
    }

    return state;
};

const AuthScreen = props => {

    const [error, setError] = useState(null);
    const [isSignup, setIsSignup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch();

    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {
            email: '',
            password: '',
        }, 

        inputValidities: {
            email: false,
            password: false,
        }, 

        formIsValid: false
    });

    useEffect(() => {

        if(error) {
            Alert.alert('An error ocurred', error, [{ text: 'Ok'}])
        }

    }, [error]);

    /// added async because both signup & login returns a promise
    const authHandler = async () => {

        let action;
        let email = formState.inputValues.email;
        let password = formState.inputValues.password;

        action = isSignup ? authActions.signup(email, password) :
                            authActions.login(email, password);
        
        setError(null);
        setIsLoading(true); // <-before

        try {
            // await for the result of the dispath
            await dispatch(action);
            props.navigation.navigate('Shop');
        } catch(err) {
            setError(err.message);
            setIsLoading(false); // <-after
        }

    };

    const inputChangeHandler = useCallback((inputIdentifier, inputValue, inputValidity) => {

        dispatchFormState({
            type: FORM_INPUT_UPDATE, 
            value: inputValue, 
            isValid: inputValidity,
            input: inputIdentifier
        })
    }, [dispatchFormState]);


    return (
            <KeyboardAvoidingView
                behavior='padding'
                keyboardVerticalOffset={50}
                style={styles.screen}
            >
                <LinearGradient
                    colors={['#ffedff', '#ffe3ff']}
                    style={styles.gradient}
                >
                    <Card
                        style={styles.authContainer}
                    >
                        <ScrollView>
                            <Input 
                                id='email' 
                                label='Email'
                                keyboardType='email-address'
                                autoCapitalize='none'
                                errorText='Please enter a valid email address'
                                onInputChange={inputChangeHandler}
                                initialValue=''
                            />
                            <Input 
                                id='password' 
                                label='Password'
                                keyboardType='default'
                                minLength={5}
                                secureTextEntry
                                errorText='Please enter a valid password address'
                                onInputChange={inputChangeHandler}
                            />
                            <View style={styles.buttonContainer}>
                            {isLoading ? 
                            (<ActivityIndicator 
                                size='small'
                                color={Colors.primary}
                            />) : 
                            (<Button 
                                title={isSignup ? 'Sign Up' : 'Login'}
                                color={Colors.primary}
                                onPress={authHandler}
                            />)}
                            </View>
                            <View style={styles.buttonContainer}>
                            <Button 
                                title={`Switch to ${isSignup ? 'Login' : 'Sign Up'}`}
                                color={Colors.accent}
                                onPress={() => {
                                    setIsSignup(prevState => !prevState);
                                }}
                            />
                            </View>
                        </ScrollView>
                    </Card>
                </LinearGradient>
            </KeyboardAvoidingView>);
};

AuthScreen.navigationOptions = {
    headerTitle: 'Authenticate'
}

const styles = StyleSheet.create({

    screen: {
        flex: 1
    },

    authContainer: {
        width: '80%',
        maxWidth: 400,
        maxHeight: 400,
        padding: 20
    },

    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    buttonContainer: {
        marginTop: 10
    }
});

export default AuthScreen;