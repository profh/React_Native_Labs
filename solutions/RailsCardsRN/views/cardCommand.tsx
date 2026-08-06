import React from "react";
import { Flashcard } from "../models/flashcard";
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, Button } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";

type CardProps = {
    flashcard: Flashcard;
}

function CardCommand({ flashcard }: CardProps): React.JSX.Element {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Definition'>>();

    return (
        <View>
            <Button>Test</Button>
        </View>
        // <TouchableOpacity onPress={() => navigation.navigate('Definition', { definition: flashcard.definition })}>
        //     <Text>{flashcard.command}</Text>
        // </TouchableOpacity>
    );
}

export default CardCommand;