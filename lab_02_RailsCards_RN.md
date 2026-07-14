Lab 2: RailsCards (React Native)
---

There is a [Flashcard App](https://en.wikipedia.org/wiki/Flashcard) for Ruby on Rails developers that we will replicate in a similar fashion for this lab.

Ours is very similar, but there is plenty of room for creative freedom. Here is a look at what the final app might look like:

<p float="left" align="center">
  <img src="PLACEHOLDER_SCREENSHOT_1.png" width="45%"/>
</p>

There are two screens: one to show the command, and the other to show the definition.

This lab will be done using Expo and TypeScript, the same setup we used for the TempConverter lab.

1. Create a new Expo project called `RailsCardsRN`:

   ```
   npx create-expo-app RailsCardsRN --template blank-typescript
   cd RailsCardsRN
   ```

1. If you want an app icon for this app, you can get one [here](https://icon.kitchen/) or create one at the same link, then drop it into your `assets` folder and reference it in `app.json`.

1. Create three folders inside your project -- `models`, `controllers`, `views` -- like we did last week to organize our work. React Native doesn't enforce this structure the way Xcode groups do, but keeping the same separation of concerns will make the app easier to reason about (and will look very familiar coming from the Swift version).

Models
---

4. Within the `models` folder, create a new file called `flashcard.tsx` and create a simple model named `Flashcard` within this file to represent the essence of a flashcard. In this case, that means the model has the following:

   * A variable called `command` of type `string` (this is the front of the flashcard with the rails command).
   * A variable called `definition` also of type `string` (this is the back of the flashcard with what the rails command does).
   * A constructor method that takes a `command` string and a `definition` string as arguments and sets the appropriate fields.

   ```typescript
   export class Flashcard {
       command: string;
       definition: string;

       constructor(command: string, definition: string) {
           this.command = command;
           this.definition = definition;
       }
   }
   ```

   TypeScript doesn't have the same struct/class distinction Swift does -- everything here is a `class` -- but conceptually this is still just a plain data container with no real behavior of its own, the same role the `struct` played in the Swift version.

1. Create another new file in `models` called `deck.tsx` that will help represent a series of flashcards. Within this file, define a new class called `Deck`.

1. Create a field called `cards` in `Deck`, which will be an array of `Flashcard` objects (using the class we created earlier): `cards: Array<Flashcard> = [];`

1. In the constructor, set the body of the method to the following code:

   ```typescript
   cardData = {
       "rails generate model ModelName": "Creates a model with the specified model_name",
       "rails generate migration MigrationName": "Creates a migration with the specified migration_name",
       "rails generate controller ControllerName": "Creates a controller with the specified controller_name",
       "rails generate scaffold ModelName": "Provides shortcut for creating your controller, model and view files in one step",
       "rails destroy scaffold ModelName": "Destroys the created controller, model and view files that were generated for the given Model",
       "rails server": "Starts ruby server at http://localhost:3000",
       "rails console": "Opens the rails console for the current RAILS_ENV",
       "rake test:units": "Runs all unit tests for the application",
       "rake -T": "Lists all available rake tasks",
       "rake db:create": "Creates the database defined in config/database.yml for the current RAILS_ENV",
       "rake db:migrate": "Migrates the database through scripts in the db/migrate directory",
       "rake db:drop": "Drops the database for the current RAILS_ENV",
       "rake db:reset": "Drops and recreates the database from db/schema.rb for the current environment",
       "rake db:rollback": "Runs the down method from the latest migration",
       "rake doc:app": "Builds the RDoc HTML files",
       "gem list": "lists the gems that this rails application depends on",
       "gem server": "Presents a web page at http://localhost:8808/ with info about installed gems",
       "bundle install": "Installs all required gems for this application",
       "rake log:clear": "Truncates all *.log files in log/ to zero bytes",
       "rake routes": "Prints out all the defined routes in match order with names",
       "rake tmp:clear": "Clears session, cache and socket files from tmp/",
       "rake test:benchmark": "Benchmarks your application"
   }

   constructor() {
       // Write a simple way to loop through the dictionary of cards, create a Flashcard
       // for each card, and add that object to the `cards` array we created earlier
   }
   ```

1. Replace the comment above with the appropriate code (`Object.entries()` is a handy way to loop over both the key and value of an object at once). After that, add a method that draws a random card:

   ```typescript
   drawRandomCard(): Flashcard {
       return this.cards[Math.floor(Math.random() * this.cards.length)]
   }
   ```

1. At the bottom of the file, export a single shared instance of the deck rather than the class itself: `export default new Deck();` This gives us one deck that the whole app can share, similar in spirit to how we'll access a single `ViewController` instance across our views in the Swift app -- except here, since there's no `ObservableObject`/`@Published` mechanism tied to this object, we'll rely on React state in our controllers to notify the UI when the current flashcard changes.

Controllers
---

1. Now create a new file inside `controllers` called `commandController.tsx`. Unlike the Swift version, React Native doesn't have a built-in `ObservableObject` protocol -- instead, a "controller" here is really just a component that owns some state (via the `useState` hook) and renders a view, passing that state down as props. Create a function component called `CommandController`:

   ```typescript
   import React, { useState } from "react";
   import deck from "../models/deck";
   import CardCommand from "../views/cardCommand";

   function CommandController() {
       const railsCardDeck = deck;
       const [flashcard, setFlashcard] = useState(railsCardDeck.drawRandomCard());

       function nextFlashcard() {
           let nextCard = railsCardDeck.drawRandomCard();
           setFlashcard(nextCard);
       }

       return (
           <CardCommand flashcard={flashcard}></CardCommand>
       )
   }

   export default CommandController;
   ```

   Notice that `flashcard` is initialized with a random card from the deck (this plays the same role as the Swift `init()` method that set `self.flashcard`), and `nextFlashcard()` is the method we'll call to swap in a different random card, the same role the Swift `update` method played.

1. Create a second file in `controllers` called `definitionController.tsx`. This one is a little different from the Swift version's `DefinitionView`, since we're not passing a whole `ViewController` instance around -- instead, when we navigate from the command screen to the definition screen, we'll pass along just the definition string as a navigation parameter. We'll set that up fully once we get to the Views section, but the controller itself looks like this:

   ```typescript
   import React from "react";
   import CardDefinition from "../views/cardDefinition";

   function DefinitionController({route}: Props) {
       const definition = route.params.definition

       return (
           <CardDefinition definition={definition}></CardDefinition>
       )
   }

   export default DefinitionController;
   ```

   Don't worry about the `Props` type or `route.params` yet -- we'll wire that up once we've set up navigation between screens.

Views
---

1. Let's start creating the view for the command screen. Create a new file in `views` called `cardCommand.tsx`. This will take a `flashcard` prop and render its command:

   ```typescript
   import React from "react";
   import { Flashcard } from "../models/flashcard";
   import { View, Text, TouchableOpacity } from 'react-native';

   type CardProps = {
       flashcard: Flashcard
   }

   function CardCommand({flashcard}: CardProps): React.JSX.Element {
       return (
           <TouchableOpacity>
               <View>
                   <Text>{flashcard.command}</Text>
               </View>
           </TouchableOpacity>
       );
   }

   export default CardCommand;
   ```

   We're using a `TouchableOpacity` here rather than a plain `View`, since (as in the Swift version's `NavigationLink`) tapping the card is what will take us to the definition screen.

   This is roughly what your simulator should look like at this point:

   <img src="PLACEHOLDER_SCREENSHOT_2.png" width="45%"/>

1. Now let's create the definition view. Create a new file in `views` called `cardDefinition.tsx`:

   ```typescript
   import React from "react"
   import { Text, View } from "react-native";

   type Props = {
       definition: string;
   };

   function CardDefinition({definition}: Props) {
       return (
           <View>
               <Text>{definition}</Text>
           </View>
       )
   }

   export default CardDefinition
   ```

1. Now let's link the two screens together. React Native doesn't have `NavigationView`/`NavigationLink` built in the way SwiftUI does -- instead we use a third-party library called [React Navigation](https://reactnavigation.org/), which is the standard way of moving between screens in a React Native app. Install it:

   ```
   npx expo install @react-navigation/native @react-navigation/stack
   ```

1. Before wiring up navigation, it helps to tell TypeScript what data each screen expects to receive. Create a new file called `types.tsx` at the root of your project:

   ```typescript
   import { Flashcard } from "./models/flashcard";

   // documentation is https://reactnavigation.org/docs/typescript/
   export type RootStackParamList = {
       Home: {flashcard: Flashcard};
       Definition: {definition: string}
   };
   ```

   This says our app has two screens, `Home` and `Definition`, and describes what parameters get passed to each -- this is the closest React Navigation equivalent to passing an instance of `ViewController` into `DefinitionView` the way we did in Swift, except here we're only passing along the specific piece of data (`definition`) that the destination screen actually needs.

1. Now open `App.tsx` and set up the navigator, replacing whatever boilerplate is currently there:

   ```typescript
   import React from 'react';
   import { NavigationContainer } from '@react-navigation/native';
   import { createStackNavigator } from '@react-navigation/stack';
   import { RootStackParamList } from './types';
   import CommandController from './controllers/commandController';
   import DefinitionController from './controllers/definitionController';

   const Stack = createStackNavigator<RootStackParamList>()

   function App(): React.JSX.Element {
       return (
           <NavigationContainer>
               <Stack.Navigator initialRouteName="Home">
                   <Stack.Screen name="Home" component={CommandController} />
                   <Stack.Screen name="Definition" component={DefinitionController}/>
               </Stack.Navigator>
           </NavigationContainer>
       );
   }

   export default App;
   ```

   This is doing the same job as wrapping your Swift view in a `NavigationView` -- it gives every screen in the stack the automatic back button and slide transition for free.

1. Now let's actually make tapping a card navigate to the definition screen. Go back to `cardCommand.tsx` and add the `useNavigation` hook:

   ```typescript
   import { StackNavigationProp } from "@react-navigation/stack";
   import { RootStackParamList } from "../types";
   import { useNavigation } from "@react-navigation/native";

   function CardCommand({flashcard}: CardProps): React.JSX.Element {
       const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Definition'>>()

       return (
           <TouchableOpacity onPress={() => {navigation.navigate('Definition', {definition: flashcard.definition})}}>
               <View>
                   <Text>{flashcard.command}</Text>
               </View>
           </TouchableOpacity>
       );
   }
   ```

   Notice that we're only passing the `definition` string through navigation, not the whole `ViewController`/controller object the way the Swift version does -- this keeps each screen's data dependency explicit and matches how `types.tsx` described the `Definition` screen's params.

1. Update `definitionController.tsx` to read that param out of `route.params`, using the `RouteProp` type from React Navigation:

   ```typescript
   import { RootStackParamList } from "../types";
   import { RouteProp } from "@react-navigation/native"

   type Props = {
       route: RouteProp<RootStackParamList, 'Definition'>
   }

   function DefinitionController({route}: Props) {
       const definition = route.params.definition

       return (
           <CardDefinition definition={definition}></CardDefinition>
       )
   }
   ```

1. Now try out your app! It should be mostly functional. However, you might notice that you keep landing on the same flashcard when you come back to the command screen. This is because we never call `nextFlashcard()` to draw a new, random card. In Swift, we solved this with `.onAppear()`; in React Navigation the equivalent is the `useFocusEffect` hook, which runs every time a screen comes back into focus. Update `commandController.tsx`:

   ```typescript
   import { useFocusEffect } from "@react-navigation/native";

   function CommandController() {
       const railsCardDeck = deck;
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
   ```

1. Now the app should be fully functional, but it is not as appealing as it could be. Let's refactor the views to improve the appearance of our user interface.

Making Cards
---

1. Since our app is called RailsCards, let's clean up our views using actual card styling. Create a `styles.js` (or `styles.ts`) file at the root of your project, similar to the one from the TempConverter lab, and define a card style with a fixed `width` (try `350`) and `height` (try `200`).

1. Give the card a rounded, outlined appearance using `borderWidth`, `borderRadius`, and `borderColor` in your style object -- this is the React Native equivalent of the Swift version's `.overlay(RoundedRectangle(cornerRadius: 10.0).stroke(Color.gray))`. Apply this style to the `View` inside `cardCommand.tsx`, and center the text within it (`alignItems: 'center'`, `justifyContent: 'center'`).

1. Create a similar card style for `cardDefinition.tsx`. Make sure to add some padding inside the card and to center the text there as well.

On Your Own
---

This app is super basic in terms of styling. If time allows, I would encourage you to find some ways to spruce up the styling and make it look more professional. Qapla'
