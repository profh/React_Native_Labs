import { Flashcard } from "./models/flashcard";

// documentation is https://reactnavigation.org/docs/typescript/
export type RootStackParamList = {
    Home: {flashcard: Flashcard};
    Definition: {definition: string};
};