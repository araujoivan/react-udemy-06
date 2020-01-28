import React, { useReducer, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const INPUT_CHANGE = 'INPUT_CHANGE';
const INPUT_BLUR = 'INPUT_BLUR';

const inputReducer = (state, action) => {

    switch(action.type) {

        case  INPUT_CHANGE:

            return {
                ...state,
                value: action.value,
                isValid: action.isValid
            }
        
        case  INPUT_BLUR:

            return {
                ...state,
                touched: true
            }

        default:
            return state;
    }

};

const Input = props => {

    const initialState = {
        value: props.initialValue ?  props.initialValue : '',
        isValid: props.initiallyValid,
        touched: false
    }

    // inputState is the snaphot
    const [inputState, dispatch] = useReducer(inputReducer, initialState);


    // slicing | disconstructuring to avoid infinit rendering loop
    const { onInputChange, id } = props;

    // kind of onEmit
    useEffect(() => {

        if(inputState.touched) {
            onInputChange(id, inputState.value, inputState.isValid);
        }

    }, [inputState, onInputChange, id])

    const textChangeHandler = text => {

        let isValid = true;

        if(text.trim().length === 0 ) {
            isValid = false;
        }

        dispatch({ type: INPUT_CHANGE, value: text, isValid: isValid });
    }

    const lostFocusHandler = () => {
        dispatch({ type: INPUT_BLUR });
    }

    return (
        <View  style={styles.formControl}>
            <Text style={styles.label}>{props.label}</Text>
            <TextInput
                {...props}
                style={styles.input}
                value={inputState.value}
                onChangeText={textChangeHandler}
                onBlur={lostFocusHandler}
            />
            {!inputState.isValid && 
              inputState.touched && 
              <View style={styles.errorContainer}>
                  <Text  style={styles.errorText}>{props.errorText}</Text>
              </View>}
        </View>
    );
}

const styles = StyleSheet.create({

    formControl: {
        width: '100%'
    },

    label: {
        fontFamily: 'open-sans-bold',
        marginVertical: 8
    },

    input: {
        paddingHorizontal: 2,
        paddingVertical: 5,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1
    },

    errorContainer: {
        marginVertical: 5
    },

    errorText: {
        fontFamily: 'open-sans',
        fontSize: 13,
        color: 'red'
    }

});

export default Input;