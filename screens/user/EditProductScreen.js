// useReducer -> has not to do with redux...
// helps the state management
import React, {useState, useEffect, useCallback, useReducer } from 'react';
import  { View, ScrollView, Platform, Alert, KeyboardAvoidingView, ActivityIndicator, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import HeaderButton from '../../components/UI/HeaderButton';
import * as productActions from '../../store/actions/products';
import Input from '../../components/UI/Input';
import Colors from '../../constants/Colors';


const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';
// an out of box solution
// dont depend of props...
// state is passed automatically by our state snapshot before updating
// action contains the current update
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

const EditProductScreen = props => {

    const [isLoading, setiSLoading] = useState(false);
    const [error, setError] = useState(null);

    const prodId = props.navigation.getParam('productId');
    const editedProduct = useSelector(state => state.products.userProducts.find(prod => prod.id === prodId));

    const dispatch  = useDispatch();

    // desconstructing useReducer return
    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {
            title: editedProduct ? editedProduct.title : '',
            imageUrl: editedProduct ? editedProduct.imageUrl : '',
            description: editedProduct ? editedProduct.description : '',
            price: ''
        }, 
        inputValidities: {
            title: editedProduct ? true : false,
            imageUrl: editedProduct ? true : false,
            description: editedProduct ? true : false,
            price: editedProduct ? true : false
        }, 
        formIsValid: editedProduct ? true : false
    });


    useEffect(() => {
        if(error) {
            Alert.alert('An error ocurrer', error, [{ text: 'Ok'}])
        }
    }, [error]);

    // useCallback => ensures that this function isnt recreated everytime the component re-renders
    // so that we can avoid an infinity loop
    const submitHandler = useCallback(async () => {

        if(!formState.formIsValid) {
            Alert.alert('Wrong input!', 'Please check the errors in the form.', [
                {text: 'Ok'}
            ]);
            return;
        }

        setiSLoading(true);
        setError(null);
        try {

            if(editedProduct) {

                await dispatch(productActions.updateProduct(
                    prodId,
                    formState.inputValues.title,
                    formState.inputValues.description,
                    formState.inputValues.imageUrl,
                ));
            } else {
                await dispatch(productActions.createProduct(
                    formState.inputValues.title,
                    formState.inputValues.description,
                    formState.inputValues.imageUrl,
                    +formState.inputValues.price // convert a string into a number
                ));
            }

            props.navigation.goBack();
    
        } catch(err) {
            setError(err.message);
        }

        setiSLoading(false);
      
    }, [dispatch, prodId, formState]);

    // execute after every re-render cycle
    // only execute once
    useEffect(() => {
        props.navigation.setParams({submit: submitHandler});

    }, [submitHandler]);

  
    const inputChangeHandler = useCallback((inputIdentifier, inputValue, inputValidity) => {

        dispatchFormState({
            type: FORM_INPUT_UPDATE, 
            value: inputValue, 
            isValid: inputValidity,
            input: inputIdentifier
        })
    }, [dispatchFormState]);

    if(isLoading) {
        return <View
                    style={styles.centered}
                >
                    <ActivityIndicator
                        size='large'
                        color={Colors.primary}
                    />
               </View>
    }

    return(
        //this component avoid the keyboard overlapping the components
        <KeyboardAvoidingView
            behavior='padding'
            keyboardVerticalOffset={100}
            style={{flex: 1}}
        >
            <ScrollView>
                <View style={styles.form}>

                    <Input 
                        id='title'
                        label='Title'
                        errorText='Please enter a valid title!'
                        autoCapitalize='sentences'
                        autoCorrect
                        returnKeyType='next'
                        onInputChange={inputChangeHandler}
                        initialValue={editedProduct ? editedProduct.title : ''}
                        initiallyValid={!!editedProduct}
                    />

                    <Input 
                        id='imageUrl'
                        label='Image Url'
                        errorText='Please enter a valid imageUrl!'
                        returnKeyType='next'
                        onInputChange={inputChangeHandler}
                        initialValue={editedProduct ? editedProduct.imageUrl : ''}
                        initiallyValid={!!editedProduct}
                    />

                    { editedProduct ? null : (
                        <Input 
                            id='price'
                            label='Price'
                            errorText='Please enter a valid price!'
                            keyboardType='decimal-pad'
                            returnKeyType='next'
                            onInputChange={inputChangeHandler}
                        />)
                    }

                    <Input 
                        id='description'
                        label='Description'
                        errorText='Please enter a valid description!'
                        autoCapitalize='sentences'
                        autoCorrect
                        multiline
                        numberOfLines={3}
                        onInputChange={inputChangeHandler}
                        initialValue={editedProduct ? editedProduct.description : ''}
                        initiallyValid={!!editedProduct}
                    />

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

EditProductScreen.navigationOptions = navData => {

    const submitFunction = navData.navigation.getParam('submit');

    return {
        headerTitle: navData.navigation.getParam('productId') ? 'Edit Product' : 'Add Product',
        headerRight: () => (<HeaderButtons HeaderButtonComponent={HeaderButton}>
            <Item
                title="Save"
                iconName={Platform.OS === 'android' ? 'md-checkmark' : 'ios-checkmark'}
                onPress={submitFunction}
            />
        </HeaderButtons>)
    }
}

const styles = StyleSheet.create({
    form: {
        margin: 20
    },

    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default EditProductScreen;