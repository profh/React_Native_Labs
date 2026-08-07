import React from "react"
import { Text, View } from "react-native";
import { appStyles } from "../styles";

type Props = {
    definition: string;
}

function CardDefinition({definition}: Props) {
    return (
        <View style={appStyles.card}>
            <Text style={appStyles.labelDefinition}>{definition}</Text>
        </View>
    )
}

export default CardDefinition;