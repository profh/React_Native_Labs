# Lab: TempConverter (React Native)

---

This lab will build off our TempConverter that we worked with in [67-272](67272.cmuis.net/labs/2) and in our [previous lab](67443.cmuis.net/labs/1) and turn it into a functional cross-platform app using React Native. The app will take some user input, convert it (if valid) from either Celsius to Fahrenheit or Fahrenheit to Celsius. There will also be a toggle switch to change the direction of the conversion and a simple "info" screen that describes your app. This is what your app might look like when you are done:

<p float="left" align="center">
  <img src="PLACEHOLDER_SCREENSHOT_1.png" width="50%"/>
</p>

One of the main goals of this lab is to give you an introduction into [React Native](https://reactnative.dev/) and [Expo](https://expo.dev/). React Native is a framework for building native mobile apps using JavaScript/TypeScript and a component-based, declarative style similar in spirit to SwiftUI -- so a lot of the mental model you built in the last lab will transfer directly.

Part 1: App creation and project setup
---

1. Create a new project using Expo. In your terminal, run:

   ```
   npx create-expo-app TempConverterRN --template blank-typescript
   cd TempConverterRN
   ```

   This gives you a minimal TypeScript-based Expo project with a single `App.tsx` file to start from.

1. Take a look at the project structure. Unlike a native iOS project, there's no Storyboard or `.xcodeproj` -- everything lives in plain `.ts`/`.tsx` files. Open `App.tsx` and delete the boilerplate content inside the returned JSX so you have a clean, mostly-empty component to start from.

1. Create a new file called `styles.js` (or `styles.ts`) in the root of your project. We'll use this to hold a `StyleSheet` object with all of our style definitions, keeping our component files focused on structure and logic rather than styling. Import it into `App.tsx` with:

   ```javascript
   import styles from './styles';
   ```

1. Run `npx expo start` and open the app in Expo Go (on your phone) or an iOS/Android simulator to make sure everything is working before you start building.

Part 2 -- Initial interface building
---

4. Let's mock up the interface. For right now, let's assume that all temperature conversions are from Celsius to Fahrenheit.

   This is the basic idea of what we're looking to do:

   <img src="PLACEHOLDER_SCREENSHOT_2.png" width="45%"/>

1. Wrap your content in a `SafeAreaView`, and inside that, a `View` -- this is React Native's equivalent of SwiftUI's `VStack`, except by default it's a flexbox container, so you'll want to set `flexDirection` and `alignItems` in your styles to control layout (add `alignItems: 'center'` to keep things centered).

1. Add a `Text` element to display the converted temperature and its unit, e.g. `<Text>{displayTemp + " " + (unit ? "C" : "F")}</Text>`. Style it with a large font size (try `fontSize: 48`) so it stands out.

1. Create a separate reusable component for the temperature input. Make a new file called `Input.tsx`. This component should render a `View` containing a `Text` label ("Enter temp:") and a `TextInput` for the numeric entry. Pass a setter function down as a prop so the parent component can be notified when the value changes -- this is React Native's version of a two-way binding, though here the data flows one direction (child calls a function passed from the parent) rather than using something like SwiftUI's `$` binding syntax.

   ```typescript
   interface InputProps {
     setTemp: React.Dispatch<React.SetStateAction<number>>;
   }

   function Input({setTemp}: InputProps): React.JSX.Element {
     return (
       <View style={styles.inputContainer}>
         <Text style={styles.inputItem}>Enter temp:</Text>
         <TextInput
           keyboardType='numeric'
           onChangeText={(text) => setTemp(parseFloat(text))}
           placeholder='0.0'
           style={styles.inputItem}
         />
       </View>
     );
   }
   ```

   Be sure to set `keyboardType='numeric'` so the on-screen keyboard is appropriate for entering numbers.

1. Add a `Button` from `react-native` below your input. Don't worry about the `onPress` handler yet, but do set the `title` prop to `"Convert!"`.

1. By this point, your `App.tsx` should look approximately like this (may differ slightly depending on how you've structured your imports):

   ```typescript
   import React from 'react';
   import { useState } from 'react';
   import styles from './styles';
   import Input from './Input';
   import { Button } from 'react-native';

   import {
     SafeAreaView,
     Text,
     View,
   } from 'react-native';

   function App(): React.JSX.Element {
     const [displayTemp, setDisplayTemp] = useState(0.0)
     const [inputTemp, setInputTemp] = useState(0.0)

     return (
       <SafeAreaView>
         <View style={styles.appContainer}>
           <Text style={styles.font_48}>{displayTemp + " F"}</Text>
           <Input setTemp={setInputTemp}/>
           <View style={styles.button}>
             <Button
               onPress={() => {}}
               title='Convert!'
             />
           </View>
         </View>
       </SafeAreaView>
     );
   }

   export default App;
   ```

1. Play around with the styling in `styles.js` to make the app a little more appealing. Some suggestions to try in your `StyleSheet.create()` call:

   ```javascript
   const styles = StyleSheet.create({
     appContainer: {
       marginTop: 50,
       alignItems: 'center'
     },
     font_48: {
       fontSize: 48
     },
     inputContainer: {
       flexDirection: 'row',
       marginTop: 30
     },
     inputItem: {
       padding: 5,
       fontSize: 20
     },
     button: {
       marginVertical: 35,
     }
   });
   ```

   Feel free to experiment with colors, spacing, and fonts beyond this starting point. Try to get your app to look something like this:

   <img src="PLACEHOLDER_SCREENSHOT_3.png" width="45%"/>

Part 3 -- Handling state and conversion logic
---

5. Unlike SwiftUI, React Native doesn't have a separate `ObservableObject`/controller class by convention -- instead, we use React's `useState` hook to hold pieces of state, and any component that reads that state automatically re-renders when it changes. Take a moment to look over the `useState` calls you already have in `App.tsx` and make sure you understand what each one does:

   ```typescript
   const [displayTemp, setDisplayTemp] = useState(0.0)
   const [inputTemp, setInputTemp] = useState(0.0)
   const [unit, setUnit] = useState(false)    // false = celsius, true = fahrenheit
   ```

   `displayTemp` holds the converted temperature shown at the top of the screen. `inputTemp` holds the raw value typed into the `TextInput`. `unit` tracks which direction we're currently converting.

1. Add the `unit` state variable shown above if you haven't already, and write a `convertTemp` function inside `App.tsx` that takes the current unit and a temperature and returns the converted value:

   ```typescript
   function convertTemp(unit: boolean, temp: number) {
     return unit ? (temp - 32) * 5/9 : (temp * 9/5) + 32
   }
   ```

   Take a moment to think about why this function takes `unit` as a parameter rather than reading it directly from the `unit` state variable -- it will matter when we wire up the toggle switch in the next section, since state updates in React don't happen instantly.

1. If you'd like some extra practice with separating your logic the way we did with the model/controller split in the Swift lab, consider pulling `convertTemp` (and a validity check for absolute zero) out into a separate `TempConverter.ts` file and importing it into `App.tsx`. This isn't required, but it's good practice for keeping your components focused on rendering rather than computation.

Part 4 -- Tying the interface together
---

6. Now let's wire up the toggle switch that lets us change conversion direction. Import `Switch` from `react-native` and add it between your temperature display and your input, inside a `View` styled with `flexDirection: 'row'`:

   ```typescript
   <View style={styles.unitPicker}>
     <Text style={styles.font_28}>C</Text>
     <Switch
         trackColor={{true: '#81b0ff'}}
         thumbColor={unit ? '#f5dd4b' : '#FCB1A6'}
         ios_backgroundColor="#FB6376"
         value={unit}
         onValueChange={() => {setUnit(!unit); setDisplayTemp(convertTemp(!unit, inputTemp))}}
         style={styles.switch}
     />
     <Text style={styles.font_28}>F</Text>
   </View>
   ```

   Notice that `onValueChange` both flips the `unit` state and recalculates `displayTemp` using the *new* unit value (`!unit`), rather than relying on `unit` having already updated -- this is exactly the kind of timing issue mentioned above.

1. Wire up the `Convert!` button's `onPress` handler to recalculate `displayTemp` from the current `inputTemp` and `unit`:

   ```typescript
   <Button
       onPress={() => {setDisplayTemp(convertTemp(unit, inputTemp))}}
       title='Convert!'
   />
   ```

1. At this point your temperature display `Text` element should reflect both the converted value and the correct unit label depending on `unit`:

   ```typescript
   <Text style={styles.font_48}>{displayTemp + " " + (unit ? "C" : "F")}</Text>
   ```

1. Now you can test your app. Try entering a temperature, tapping "Convert!", and flipping the switch to make sure both units update correctly. Also test some edge cases -- what happens if the input is left blank, or if you enter something that isn't a number? Consider how you might handle invalid input gracefully (e.g., checking for `NaN` before updating `displayTemp`, similar to how the Swift version returned `nil` for invalid temperatures).

Part 5 -- Creating a multi-screen app
---

7. It would be nice to start working towards apps that have more than one screen. (So far, this is a single-screen app.) To do that, let's create a simple info screen for the app that we can navigate to. This will provide us with a brief introduction into [React Navigation](https://reactnavigation.org/), the standard way of handling multi-screen navigation in React Native.

1. Install the navigation dependencies:

   ```
   npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
   ```

1. Wrap your app's root component in a `NavigationContainer`, and set up a `NativeStackNavigator` with two screens: your existing converter screen (e.g. `HomeScreen`) and a new `InfoScreen`.

1. Create a new file called `InfoScreen.tsx`. Style this screen however you would like and add some brief text. If you need some elegant text and can't think of any off the top of your head, the following might do in a pinch: "This is the ever-famous TempConverter turned into a working React Native app. This is a moment of great celebration! People of the Earth, rejoice!"

1. Add a button or icon (consider an icon library like `@expo/vector-icons`, which ships with Expo) to your home screen that navigates to the info screen, e.g.:

   ```typescript
   <Button
     onPress={() => navigation.navigate('Info')}
     title="Info"
   />
   ```

   Run this and see how the back button is automatically created for you when you use a stack navigator!

Now you have an information button and have successfully linked to another screen, and your app should be fully functional; congrats on creating your first cross-platform app using React Native! We will continue to build on these concepts as the semester goes on, so you will become much more familiar with this framework over time. Qapla'
