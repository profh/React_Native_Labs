import React from "react";
import CardDefinition from "../views/cardDefinition";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../types";

type Props = {
    route: RouteProp<RootStackParamList, 'Definition'>;
}

function DefinitionController({route}: Props) {
    const definition = route.params.definition;

    return (
        <CardDefinition definition={definition}></CardDefinition>
    )
}

export default DefinitionController;