# Lab 8: EmojiHunter

Our goal is to create a simple game called Emoji Hunter that will use our camera to identity real world object that look like emojis. A sample of the gameplay can be seen below:

![Image from cmuis net](https://i.imgur.com/gNIfNZb.png)

## Styling
Similar to the SimpleContacts lab, to abstract the styling out of the lab, we will provide style code snippets at the end of each section. Refer to that section's instructions (styles will be in parentheses, next to the component) to see what styles go with each component.

## Part 1: Setup
Start by making a new project: `npx create-expo-app --template`. Make sure to select the `Blank (Typescript)` template again!

Install the following packages in the root directory of the project:

```
npm install expo-camera@15.0.16 @tensorflow/tfjs @tensorflow/tfjs-react-native @tensorflow-models/mobilenet react-native-reanimated --legacy-peer-deps
```

Inside the `app.json` file, replace whatever was inside there with this:

```
{
  "expo": {
    "name": "Test",
    "slug": "Test",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "infoPlist": {
      "NSCameraUsageDescription": "This app needs access to the camera to detect objects."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": ["CAMERA"]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera"
        }
      ]
    ]
  }
}
```

This gives the app to camera permissions for your phone which we need later.

Next, make a `types.ts` file in the root directory. In this file, we are going to declare three things:

### EmojiModel type
- emoji: string
- emojiNames: string[]

### EmojiSearchStatus enum
- Found = "Found"
- NotFound = "NotFound"
- Searching = "Searching"
- GameOver = "GameOver"

### CameraProps
- emojiNames: string[]
- onEmojiFound: (status: EmojiSearchStatus) => void
- setTensorLoaded: (loaded: boolean) => void

Essentially, what we have done is declare three types we need going forward: the type for the `EmojiModel`, an enum for `EmojiSearchStatus`to indicate the current game state, and a `CameraProps` type which defines what three props the CameraView will take in (don't worry about this right now)!

Once you are done, make sure to export everything! You can do so by including the `export` keyword before every type definition.

## Part 2: EmojiModel

Make a `Models` folder and create a `Emoji.tsx` file.

Copy and paste the following code in:

```
import { EmojiModel } from "../types";

export const emojiObjects: EmojiModel[] = [
  { emoji: "💻", emojiNames: ["laptop", "computer"] },
  { emoji: "📱", emojiNames: ["phone", "cellphone", "cell"] },
  { emoji: "🖊️", emojiNames: ["pen", "pencil"] },
  { emoji: "📕", emojiNames: ["book", "book jacket", "book cover"] },
  { emoji: "🎒", emojiNames: ["backpack", "sack"] },
];
```

To explain what this code is doing, we have defined `emojiObjects` to be a list of dictionaries mapping emojis to a list of names that are commonly associated with them!

## Part 3: GameViewModel

Now, we want to create a `GameViewModel.tsx` file (this can be in project's root directory). The `GameViewModel` will be in charge of a lot of the game logic such as the timer countdown, changing the game state when an emoji is found/not found, and restarting the game!

To get started, import `useState`, `useEffect`, `useCallback`, `emojiObjects`, and `EmojiSearchStatus` from their appropriate places! Also define a constant called `MAX_LEVELS` which is just the length of the `emojiObjects` array since the length of the game is determined by how many emojis an user needs to find.

Within the view model, let's define some constants (you can use React's `useState` here!):

- `currentLevel`: A number to denote the current level/emoji the user is on
- `emojiStatus`: One of the values of `EmojiSearchStatus`, the default state should be the "Searching" status
- `timeRemaining`: A number to denote the amount of time the user has left (set this to 10 seconds)
- `showNext`: A boolean that determines whether or not the app needs to show the "Next" screen (set this to false)
- `tensorLoaded`: A boolean that indicates if our image classification model has been loaded (set this to false)
- `isGameOver`: A boolean that indicates if the game has ended (set this to false)

### IMPORTANT: Make sure to define setters for all the above constants!

Next, we need to make some functions run the game logic. Let's break this down into three parts:

### Timer

We want a 10 second timer to count down when the user is trying to find an emoji. The logic for this will be in a `useEffect` hook. Here are some specifications:

- Have the hook be called only when the `tensorLoaded`, `emojiStatus`, and `isGameOver` constants change
- The timer should only run when all of the following have been satisfied:
  -  The model has been loaded (think about what variable provides this information)
  -  The game is not over
  -  The `EmojiSearchStatus` is "Searching"
- When updating the timer, check if the previous time is greater than 1. If so, decrement it by one
- Otherwise, do the following:
  - Clear the timer (use `clearInterval`)
  - Update the `showNext` constant
  - Update the `emojiStatus` constant
  - Return 0
    
Below is a template to guide you!

```
  useEffect(() => {
    if (____ && ____ && ____) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (____) { // Logic for updating the timer
            return ____;
          } else {
            ____;
            ____;
            ____;
            ____;
          }
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [____, _____, ____]);
```

### StartSearch

We also want a function to start the search! It should do the following:
- If the current level is greater than the maximum number of levels, update `isGameOver` and `emojiStatus` to their appropriate values
- Otherwise, increment `currentLevel`, reset the timer to 10 seconds, update `showNext` (we don't want the "Next" screen to show when we are searching) as well as `emojiStatus` to their appropriate values

Below is a template to guide you:

```
  const startSearch = useCallback(() => {
    if (____) {
      ____;
      ____;
    } else {
      setCurrentLevel((prev) => ____);
      ____;
      ____;
      ____;
    }
  }, [currentLevel]);
```

### RestartGame

Lastly, we want a function to restart the game. It should do the following:
- Reset the current level
- Reset the timer to 10 seconds
- Set `showNext`, `isGameOver`, and `emojiStatus` to their default values

```
const restartGame = useCallback(() => {
  // YOUR CODE GOES HERE
}, []);
```

### Exporting Game Logic
You might have noticed we haven't return anything in this view model so let's fix that!

Return `currentLevel`, `emojiStatus`, `timeRemaining`, `showNext`, `startSearch`, `setEmojiStatus`, `setTensorLoaded`, and `restartGame` (you need to wrap them in curly braces instead of parantheses since we are returning an object). By doing this, we are making these constants and functions available to fall future instaniations of the `GameViewModel`.

## Part 4: Rendering Game Screens using App.tsx

### GameViewModel
We have the `GameViewModel` and an `Emoji` model but we need some code that will be repsonsible for showing the correct screen! To do this, we can modify `App.tsx` (this is the entry point for all React Native apps)

### NOTE: We will not be providing you the imports for this file so try to figure out what imports are needed based on the instructions below!

To start, let's create an instance of the `GameViewModel`. Inside the `App` component, copy and paste the following code:

```
const {
  currentLevel,
  emojiStatus,
  timeRemaining,
  showNext,
  startSearch,
  setEmojiStatus,
  setTensorLoaded,
  restartGame,
} = GameViewModel();
```

Next, write a function called `handleEmojiFound` that takes in an `EmojiSearchStatus` and then sets `emojiStatus` to the input (hint: use `setEmojiStatus` that we imported above)!

### CustomCamera
Let's also quickly make a file called `CustomCamera.tsx` (this can also be in the root directory). This view will be in charge of managing the camera but we need to import it here since `App.tsx` needs to render it.

Now, we can work on the views in `CustomCamera.tsx`

Let's wrap everything in a `View` first (container style). 

Notice that the entire app has three screens: a camera screen to find an emoji, a screen that will display the "Next" button, and finally a "Game Over" screen to restart the game. To determine what screen to display, we will need to case on the information that is provided by the `GameViewModel`.

1. Case on whether the `emojiStatus` is set to `GameOver` (remember `emojiStatus` is supplied by the `GameViewModel` we initialized at the top of this file!
  - If the above case is satisfied, define a `TouchableOpacity` component that calls `restartGame` when pressed
  - Within that component, define a `Text` component that says "Game Over! Restart?"
    
2. Case on whether `showNext` is true of if `emojiStatus` is set to `Found` (this makes sense since we want the the "Next" screen to be rendered only if the time runs out (`showNext` is true) or if the emoji is found)
  - If the above case is satisfied, define a `TouchableOpactiy` component that calls `startSearch` when pressed
  - Within that component, define a `Text` component that says "Next Emoji!"
    
3. If neither of the aboves cases are satisfied, define a `CustomCamera` component (from above). Have it taking in the following props:
   - `emojiNames`: A list of names for the current emoji (hint: use `emojiObjects` and `currentLevel` in conjuction to get this information)
   - `onEmojiFound`: Pass in `handleEmojiFound`
   - `setTensorLoaded`: Pass in the `setTensorLoaded` setter
   
Below is a template to guide you:

```
{____ ? (
  <____ onPress={____}>
    <____ style={{ fontSize: 40, color: "red" }}>____</____>
  </____>
) : ____ || ____ ? (
  <____ onPress={____}>
    <____ style={{ fontSize: 40, color: "green" }}>_____</____>
  </____>
) : (
  <____
    ____={____}
    ____={____}
    ____={____}
  />
)}
```

We also want to show a timer along the bottom as well as the emoji that needs to be found. Wrap everything in a `View` component (info style)!

Let's show the time remaining first. Check if the `emojiStatus` is set `GameOver` and if not, define a `Text` component (timer style) with "Time Remaining: {timeRemaining}" as the value (remember `timeRemaining` is a constant we have access to through the `GameViewModel`)

We also want to show text if the emoji is found/not found. Using the same check above, define a `Text` component (emojiText style). Within the component, do the following:

- Check if `emojiStatus` is `Found` and if so, display the emoji itself and then "FOUND!" right after it (hint: use the ${...} syntax to render the emoji)
- Else, check if `emojiStatus` is `NotFound` and if so, put "Find: " and then display the emoji

### App.tsx Styles
Here is the styling for `App.tsx` (you can put these styles at the bottom of the file):

```
container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  info: {
    position: "absolute",
    bottom: 50,
    alignItems: "center",
  },
  timer: {
    fontSize: 24,
    fontWeight: "bold",
  },
  emojiText: {
    fontSize: 50,
    fontWeight: "bold",
  },
```

Don't forget to export the `App` component!

## Part 5: CustomCamera
You might have noticed we haven't defined a `CustomCamera` component that `App.tsx` was using in the previous section (this should prevent you from running the app entirely). Let's tackle that now!

As an overview, we want this `CustomCamera` component to access the camera, take a picture, pass it through an image classification model, read predictions from that model, and then update the app in the case that the emoji is found. 

Note: A lot of things in this section is heavily based in machine learning and with that math. We don't expect you to understand the logic of how ML models work so gear your understanding towards the parts that are responsible for the integration of ML models.

### Setup
In the `CustomCamera.tsx` file, import the following:

```
import React, { useEffect, useRef, useState } from "react";
import { Text, View, StyleSheet, Button, Dimensions } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native"; 
import * as mobilenet from "@tensorflow-models/mobilenet";
import jpeg from "jpeg-js"; 
import { EmojiSearchStatus } from "./types";
import { CameraProps } from "./types";
```

Looking back at `App.tsx`, you can see that we passed in three props (`emojiStatus`, `onEmojiFound`, `setTensorLoaded`. Ensure that those three props are passed in properly to the component.

Copy the following inside the component:
```
const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
const cameraRef = useRef<CameraView | null>(null); 
const [permission, requestPermission] = useCameraPermissions();
```

What we have done simply is define the `model` constant to use the MobileNet image classification model, set a `cameraRef` constant to reference the `CameraView` (more on this later), and then `permission` constant that we can get from the `expo-camera` package.

Let's also define a few more constants:

- `isModelLoaded`: A boolean that denotes whether the MobileNet model have been fully loaded (this is needed since we don't want the timer to start ticking down until the model is fully loaded), set this to false as its default value
- `isProcessing`: A boolean that denotes whether the MobileNet model is currently processing an image (this will stop the model from processing another image if it is currently processing one)
- `emojiFound`: A boolean that denotes whether or not the emoji has been found

Finally, define a `emojis` constant. Set this constant to be the list of names for the current emoji. Hint: use the `emojiNames` prop to find a list of names we defined in the `Emoji` model.

### Camera Permissions
Before using the camera, we need to prompt the user for access to the camera if the permission is not granted (we should check this everytime).

Copy and paste the following code into `CustomerCamera.tsx` (somewhere in the component):

```
useEffect(() => {
  if (!permission || !permission.granted) {
    requestPermission();
  }
}, [permission, requestPermission]);
```

### Integrating MobileNet
In order to properly use the MobileNet model, many things such as converting an image to a tensor are needed to use the model. To make it easier, we have broken this section down into the following parts:

#### LoadModel
We want to load the model when the `CustomCamera` view first gets mounted. To do this, define a `useEffect` hook with an empty dependency array. Within this hook, do the following:

- Define a constant called `loadModel` and make it async
- Inside the function, ready Tensorflow and then load the MobileNet Model (already done for you below)
- Set the `model` constant to `loadedModel`
- Set `isModelLoaded` and `setTensorLoaded` to be true
- Inside the catch statement, log the error to the console.

Below is a template to guide you:

```
useEffect(() => {
    ________ = ____ () => {
      try {
          await tf.ready();
          const loadedModel = await mobilenet.load();
          ____;
          ____;
          ____;
      } catch (error) {
          ____;
      }
    };
    loadModel();
}, []);
```

#### ImageToTensor
To actually pass in an image to MobileNet, it needs to be a tensor which is a specific data format that the MobileNet model expects.

To actually do this is too complicated and involved that we can't put all the nitty gritty details into a lab. However, to help with understanding, we have included comments to help you understand what is going on.

Copy and paste the folowing code:

```
const imageToTensor = async (imageUri: string) => {
  // Resize the image to fit the input shape expected by the Mobile Net Model
  const manipulatedImage = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 224, height: 224 } }], 
    { format: ImageManipulator.SaveFormat.JPEG }
  );

  // Fetches the uri of the modified image and then converts to the image to binary
  const response = await fetch(manipulatedImage.uri);
  const imageData = await response.arrayBuffer();
  
  // Decode the JPEG image to a Uint8Array with jpeg-js. Decoding with jpeg-js automatically includes the alpha/transparency channel
  const { width, height, data } = jpeg.decode(imageData, { useTArray: true });

  // Remove alpha channel from the image data since MobileNet is not expected it
  const rgbArray = new Uint8Array(width * height * 3);
  let rgbIndex = 0;
  for (let i = 0; i < data.length; i += 4) {
    rgbArray[rgbIndex++] = data[i];     // R
    rgbArray[rgbIndex++] = data[i + 1]; // G
    rgbArray[rgbIndex++] = data[i + 2]; // B
  }
  
  // Convert the pixel data to a TensorFlow tensor
  const imageTensor = tf.tensor3d(rgbArray, [height, width, 3]);

  return imageTensor;
};
```

#### ClassifyImage
Here, we want to take in the image uri (provided by the camera) and attempt to classify it.

Fill in the blanks below:

```
const classifyImage = async (imageUri: string) => {
  // Return early if model is not loaded, already processing, or we have already found the emoji
  ____;
  
  ____; // Update the isProcessing constant to denote that the model is classifying something

  try {
    const imageTensor = ____; call the imageToTensor function asynchronously
    const predictions = await model.classify(imageTensor as any); // Classifies the imageTensor above using the MobileNet model

    // Loops through each prediction and checks if it matches the emoji
    predictions.forEach((prediction) => {
        const isEmojiMatch = emojis.some((emoji) => prediction.className.toLowerCase().includes(emoji));
        if (isEmojiMatch && prediction.probability > 0.2) {
            ____; // Update emojiFound here
            ____; // Call onEmojiFound and pass in the Found status; this will tell the GameViewModel to that the emoji has been found
        }
    });
    console.log("Predictions:", predictions); // Leave this log statement in as it will print out what the ML model thinks it is looking at
  } catch (error) {
    console.error("Error classifying image:", error);
  } finally {
    ____; // Reset the isProcessing constant
  }
};
```

#### ProcessFrame
This function mainly serves to take a picture and then pass it to the `classifyImage` function above. It should do the following:

1. Checks if `cameraRef.current` is not null as we only want to take a picture when the camera is properly mounted, if the model is loaded, and if `emojiFound` is false (we only want to proces the frame we are looking at if the emoji has not been found)
2. Calls `classifyimage` on the photo's uri asynchronously
   
Below is a template to guide you:
```
const processFrame = async () => {
  if (____) {
    const photo = await cameraRef.current.takePictureAsync({ skipProcessing: true });
    if (photo) {
      ____;
    }
  }
};
```

We alo want `processFrame` to be called every second so that users don't have to tap on a capture button. The function should also only be called when `emojiFound` has been updated or the model has been loaded.

The following code will do that for us:

```
useEffect(() => {
  if (isModelLoaded && !emojiFound) {
    const intervalId = setInterval(processFrame, 1000); 
    return () => clearInterval(intervalId);
  }
}, [isModelLoaded, emojiFound]);
```

#### CameraView
Finally, we can render the view.

Wrap everything in a `View` component (container style) and do the following inside:

- Define a `CameraView` component (imported from the `expo-camera` package) and set the `ref` and `facing` props to be `cameraRef` and 'back' respectively.
- Render another `View` component (overlay style) only if the model has been loaded
- Within that component, define a `Text` component (loadingText style) that says "Loading Image Classification Model..."

### CustomCamera Styles
Here is the styling for `CustomCamera.tsx` (_you can put these styles at the bottom of the file_):

```
container: {
  justifyContent: 'center',
},
message: {
  textAlign: 'center',
  paddingBottom: 10,
},
camera: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
},
overlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
},
loadingText: {
  fontSize: 20,
  fontWeight: "bold",
  color: "#fff",
},
```

Congrats you are now finished with the app. Feel free to run the game on your phone and good luck finding emojis.

Make sure to show the app running to your TA and correct classifications!











