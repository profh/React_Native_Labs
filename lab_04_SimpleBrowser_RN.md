Lab 4: Simple Browser (React Native)
---

In this lab, we will use React Native's WebView component to help us build our own browser for iOS and Android. It's a scaled down browser, but it should have a navigation bar so we can enter in URLs, a reload and stop button, and a set of back and forward buttons for simple navigation. Here is what the app will look like when finished:

<p float="left" align="center">
  <img src="PLACEHOLDER_SCREENSHOT_1.png" width="45%"/>
</p>

I. Setup
---

1. Start a new Expo project called `SimpleBrowserRN`:

   ```
   npx create-expo-app SimpleBrowserRN --template blank-typescript
   cd SimpleBrowserRN
   ```

1. Install `react-native-webview`, the package that gives us access to a native web view component -- this is our stand-in for WebKit's `WKWebView` from the Swift version:

   ```
   npx expo install react-native-webview
   ```

1. Create three folders inside your project -- `models`, `controllers`, and `views` -- the same organizational split we've used in the last couple of labs. There are 3 main components of the UI -- the URL search bar, the web view, and the bottom control bar. The search bar and the control bar are both simple `View`s laid out in a row; let's work on those first, since they're significantly simpler than the web view.

II. The URL Search Bar
---

1. The 2 elements of the URL search bar are a `TextInput` for typing in the URL and a `Button` to load it. Create a new file called `searchView.tsx` inside `views`. Start with a component that just lays out those two pieces in a row:

   ```typescript
   import { Button, TextInput, View } from "react-native";
   import React from "react";
   import styles from "../styles";

   function SearchView({inputUrl, setInputUrl, loadUrl}: SearchViewProps): React.JSX.Element {
       return (
           <View style={styles.searchContainer}>
               <TextInput
                   style={styles.searchBar}
                   value={inputUrl}
                   onChangeText={setInputUrl}
               />
               <Button
                   title="Search!"
                   onPress={loadUrl}
               />
           </View>
       )
   }

   export default SearchView
   ```

   Notice `inputUrl`, `setInputUrl`, and `loadUrl` are all coming in as props rather than being declared inside this component. In the Swift version, the `TextField` bound directly to `$viewModel.urlString` on a shared `ObservableObject`; here, since React Native doesn't have that binding syntax, `SearchView` stays a "dumb" component that just displays whatever state its parent hands it, and calls back up to the parent (via `setInputUrl` and `loadUrl`) when the user interacts with it. We'll create the actual state this depends on in Part IV.

1. Add the following type to a new file called `types.ts` at the root of your project, which documents the props `SearchView` expects:

   ```typescript
   export type SearchViewProps = {
       inputUrl: string,
       setInputUrl: React.Dispatch<React.SetStateAction<string>>,
       loadUrl: () => void,
   }
   ```

   Then import and apply it to `SearchView`'s function signature: `function SearchView({inputUrl, setInputUrl, loadUrl}: SearchViewProps)`.

1. Create a `styles.js` file at the root of your project (the same pattern we used in TempConverter) and add some basic styling for the search container and the input itself:

   ```javascript
   import { StyleSheet } from "react-native";

   const styles = StyleSheet.create({
       searchContainer: {
           flexDirection: 'row',
           alignItems: 'center',
           padding: 10
       },
       searchBar: {
           flex: 2,
           borderColor: '#ccc',
           borderWidth: 1,
           borderRadius: 5,
           padding: 5,
           marginRight: 10,
       },
   })

   export default styles
   ```

   We'll add more style rules to this file as we build out the rest of the screen.

III. The Navigation Options Bar
---

1. Now let's create the bottom navigation option button bar. First, let's build a single reusable button, since we'll need four of them that all behave the same way except for their label and what they do when tapped. Create a new file called `controlButton.tsx` in `views`:

   ```typescript
   import { TouchableOpacity, Text } from "react-native";
   import styles from "../styles";

   function ControlButton({show = undefined, fn, txt}: ControlButtonProps) {
       return (
           <TouchableOpacity onPress={fn} disabled={show === undefined ? false : !show}>
               <Text style={styles.font32}>{txt}</Text>
           </TouchableOpacity>
       )
   }

   export default ControlButton
   ```

   The `show` prop is optional and lets us disable a button entirely -- we'll use this for the back and forward buttons, which should only be tappable when there's actually somewhere to go back or forward to. Add the corresponding type to `types.ts`:

   ```typescript
   export type ControlButtonProps = {
       show?: boolean | undefined,
       fn: () => void,
       txt: string
   }
   ```

1. Now create `controlBar.tsx` in `views`, which lays out four `ControlButton`s in a row using simple text glyphs in place of the SF Symbols from the Swift version (`"<"` for back, `">"` for forward, `"↻"` for reload, and `"x"` for stop):

   ```typescript
   import { View } from "react-native";
   import ControlButton from "./controlButton";
   import styles from "../styles";

   function ControlBar({canGoBack, canGoForward, goBack, goForward, reload, stop}: ControlBarProps): React.JSX.Element {
       return (
           <View style={styles.controlBar}>
               <ControlButton show={canGoBack} fn={goBack} txt="<"/>
               <ControlButton show={canGoForward} fn={goForward} txt=">"/>
               <ControlButton fn={reload} txt="↻"/>
               <ControlButton fn={stop} txt="x"/>
           </View>
       )
   }
   export default ControlBar
   ```

   Add the matching type to `types.ts`:

   ```typescript
   export type ControlBarProps = {
       canGoBack: boolean,
       canGoForward: boolean,
       goBack: () => void,
       goForward: () => void,
       reload: () => void,
       stop: () => void,
   }
   ```

   Notice this bar takes 6 props but has no state of its own -- just like `SearchView`, it's purely a display component. All of `canGoBack`, `canGoForward`, `goBack`, `goForward`, `reload`, and `stop` will come from the web view itself, which we'll wire up next.

1. Add a couple more style rules for the control bar and the button text size:

   ```javascript
   controlBar: {
       flexDirection: 'row',
       justifyContent: 'space-between',
       padding: 10
   },
   font32: {
       fontSize: 32
   },
   ```

IV. The Model and Controller
---

In the Swift version, we created a `ViewModel` as an `ObservableObject` to hold the URL string and used Combine's `PassthroughSubject` to route button taps into the `WebView`'s `Coordinator`. React Native's `WebView` component makes this dramatically simpler: it exposes imperative methods directly through a `ref` (`goBack()`, `goForward()`, `reload()`, `stopLoading()`), and it reports navigation state changes (including whether you *can* go back or forward) through a callback prop. So instead of a publisher/subscriber pipeline, our "view model" is just a small custom hook holding a few pieces of `useState`, and our "controller" is a component that turns those state values and the web view's ref into the functions our views need.

1. Create a new file called `browserModel.tsx` in `models`. This plays the same role the `@Published` properties on `ViewModel` did -- it's just been pulled out into its own reusable hook rather than a class:

   ```typescript
   import { useState } from "react";

   function BrowserModel() {
       const [url, setUrl] = useState("")
       const [inputUrl, setInputUrl] = useState("")
       const [canGoBack, setCanGoBack] = useState(false)
       const [canGoForward, setCanGoForward] = useState(false)

       return {
           url,
           setUrl,
           inputUrl,
           setInputUrl,
           canGoBack,
           setCanGoBack,
           canGoForward,
           setCanGoForward,
       };
   }

   export default BrowserModel
   ```

   `url` is the URL currently loaded in the web view, while `inputUrl` is just what the user has typed so far -- they're kept separate so that typing in the search bar doesn't reload the page on every keystroke; the page only reloads once the user taps "Search!".

1. Now create `browserController.tsx` in `controllers`. This is where we bring the model's state together with a `ref` to the `WebView`, and define the five action functions our navigation buttons need:

   ```typescript
   import React, {useRef} from "react";
   import BrowserView from "../views/browserView";
   import WebView from "react-native-webview";
   import BrowserModel from "../models/browserModel";

   function BrowserController() {
       const {
           url,
           setUrl,
           inputUrl,
           setInputUrl,
           canGoBack,
           setCanGoBack,
           canGoForward,
           setCanGoForward,
         } = BrowserModel();

       const webViewRef = useRef<WebView>(null);
       const goBack = () => webViewRef.current?.goBack();
       const goForward = () => webViewRef.current?.goForward();
       const reload = () => webViewRef.current?.reload();
       const stop = () => webViewRef.current?.stopLoading();

       const loadUrl = () => {
           let formattedUrl = inputUrl;
           if (!/^https?:\/\//i.test(formattedUrl)) {
             formattedUrl = 'https://' + formattedUrl;
           }
           setUrl(formattedUrl);
       };

       const handleNavStateChange = (navState: any) => {
           setCanGoBack(navState.canGoBack);
           setCanGoForward(navState.canGoForward);
       };

       return (
           <BrowserView
               url={url}
               inputUrl={inputUrl}
               setInputUrl={setInputUrl}
               canGoBack={canGoBack}
               canGoForward={canGoForward}
               loadUrl={loadUrl}
               WebViewRef={webViewRef}
               goBack={goBack}
               goForward={goForward}
               reload={reload}
               stop={stop}
               handleNavStateChange={handleNavStateChange}
           />
       )
   }

   export default BrowserController
   ```

   Take a moment to compare this to the Swift version's `Coordinator`. There, we needed an `NSObject` conforming to `WKNavigationDelegate`, a `PassthroughSubject` enum pipeline, and a `.sink()` subscriber just to let button taps reach the `WKWebView` instance. Here, `useRef` gives us a direct handle to the underlying native web view, and `react-native-webview` calls our functions for us -- no delegate protocol or Combine plumbing required. `loadUrl()` is also doing a little extra housekeeping the Swift version didn't need to worry about: since users might type `apple.com` instead of `https://apple.com`, we prepend `https://` if it's missing before setting `url`.

1. Add the `BrowserViewProps` type to `types.ts`, which documents everything `browserController` is about to hand down to its view:

   ```typescript
   import WebView from "react-native-webview"

   export type BrowserViewProps = {
       url: string,
       inputUrl: string,
       setInputUrl: React.Dispatch<React.SetStateAction<string>>,
       canGoBack: boolean,
       canGoForward: boolean,
       loadUrl: () => void,
       WebViewRef: React.RefObject<WebView>,
       goBack: () => void,
       goForward: () => void,
       reload: () => void,
       stop: () => void,
       handleNavStateChange: (navState: any) => void;
   }
   ```

V. The Web View
---

1. Now, let's tie everything together. Create `browserView.tsx` in `views`:

   ```typescript
   import React from "react";
   import { WebView } from "react-native-webview";
   import { BrowserViewProps } from "../types";
   import { SafeAreaView, View } from "react-native";
   import SearchView from "./searchView";
   import ControlBar from "./controlBar";
   import styles from "../styles";

   function BrowserView({url, inputUrl, setInputUrl, canGoBack, canGoForward, loadUrl, WebViewRef, goBack, goForward, reload, stop, handleNavStateChange}: BrowserViewProps): React.JSX.Element {
       return (
           <SafeAreaView>
               <SearchView
                   inputUrl={inputUrl}
                   setInputUrl={setInputUrl}
                   loadUrl={loadUrl}
               />
               <View style={styles.webViewContainer}>
                   <WebView
                       ref={WebViewRef}
                       source={{uri: url}}
                       onNavigationStateChange={handleNavStateChange}
                   />
               </View>
               <ControlBar
                   canGoBack={canGoBack}
                   canGoForward={canGoForward}
                   goBack={goBack}
                   goForward={goForward}
                   reload={reload}
                   stop={stop}
               />
           </SafeAreaView>
       )
   }

   export default BrowserView
   ```

   Notice how closely this mirrors the structure of the Swift `ContentView`'s `VStack { SearchBar(...); WebView(...); BottomBar(...) }` -- a search bar, a web view, and a control bar, stacked vertically. The `ref={WebViewRef}` is what lets `browserController`'s `goBack`, `goForward`, `reload`, and `stop` functions reach into this specific `WebView` instance, and `onNavigationStateChange` is what feeds `canGoBack`/`canGoForward` back up to the controller every time the page changes.

1. Give the web view container a sensible height so it doesn't get squeezed out by the search bar and control bar. Add this to `styles.js`:

   ```javascript
   import { StyleSheet, Dimensions } from "react-native";

   const deviceHeight = Dimensions.get('window').height;

   const styles = StyleSheet.create({
       // ...your existing rules...
       webViewContainer: {
           height: deviceHeight - 200,
           padding: 10
       },
   })
   ```

1. Finally, wire `BrowserController` up in `App.tsx`:

   ```typescript
   import BrowserController from "./controllers/browserController";

   export default function App() {
     return (
       <BrowserController/>
     );
   }
   ```

1. Now try it out! Type a URL into the search bar (with or without `https://`, since `loadUrl()` handles that for you), tap "Search!", and confirm the page loads. Browse around a bit and confirm the back and forward buttons only become active once there's somewhere to go, and that reload and stop both work as expected.

On Your Own
---

The Swift version of this lab also builds out a share sheet, using a `PassthroughSubject` to route a "share" button tap through the `Coordinator` and into a `UIActivityViewController`. We've left that out here to keep the lab focused, but if you'd like to add it as an extension, look into Expo's [`Sharing`](https://docs.expo.dev/versions/latest/sdk/sharing/) module, or React Native's built-in [`Share`](https://reactnative.dev/docs/share) API -- either would let you add a fifth `ControlButton` that shares the current `url` the same way the Swift version's share sheet did. Qapla'
