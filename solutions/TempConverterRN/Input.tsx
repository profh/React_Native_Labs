import React, { Dispatch, FC, JSX, SetStateAction } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import appStyles from './styles';

interface InputProps {
    setTemp: Dispatch<SetStateAction<number>>;
}

function Input({ setTemp }: InputProps): JSX.Element {
    return (
        <View>
            <Text style={appStyles.inputLabel}>Enter temp:</Text>
            <TextInput 
                keyboardType="numeric"
                onChangeText={(text) => setTemp(parseFloat(text) || 0)} 
                placeholder='0.0'
                style={appStyles.tempInput} />
            
        </View>
    );

};

export default Input;