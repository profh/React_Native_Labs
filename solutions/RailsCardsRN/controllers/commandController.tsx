import React, { useState } from "react";
import Deck from "../models/deck";
import CardCommand from "../views/cardCommand";
import { useFocusEffect } from "@react-navigation/native";

function CommandController() {
    const railsCardDeck = Deck;
    const [flashcard, setFlashcard] = useState(railsCardDeck.drawRandomCard());

    function nextFlashcard() {
        let nextCard = railsCardDeck.drawRandomCard();
        setFlashcard(nextCard);
    }

    useFocusEffect(
        React.useCallback(() => {
            nextFlashcard();
        }, [])
    );

    return (
        <CardCommand flashcard={flashcard}></CardCommand>
    )
}

export default CommandController;