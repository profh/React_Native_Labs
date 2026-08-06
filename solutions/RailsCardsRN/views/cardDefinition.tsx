import React from "react"
import { Text, View } from "react-native";

type Props = {
    definition: string;
}

function CardDefinition({definition}: Props) {
    return (
        <View>
            <Text>{definition}</Text>
        </View>
    )
}

export default CardDefinition;