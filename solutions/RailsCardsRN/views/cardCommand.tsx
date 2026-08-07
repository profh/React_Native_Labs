import React from "react";
import { Flashcard } from "../models/flashcard";
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import {appStyles} from "../styles";

type CardProps = {
    flashcard: Flashcard;
}

function CardCommand({ flashcard }: CardProps): React.JSX.Element {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Definition'>>();

    return (
        <TouchableOpacity
            onPress={() =>
                navigation.navigate('Definition', { definition: flashcard.definition })}
        >
            <View style={[appStyles.card]}>
                <Text style={appStyles.labelCommand}>{flashcard.command}</Text>
            </View>
        </TouchableOpacity>
    );
}

export default CardCommand;