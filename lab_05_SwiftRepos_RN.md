Lab 5: Swift Repos (React Native)
---

Overview
---

1. In this lab, we will build an application to look at the most popular Swift repositories on GitHub using the GitHub API and many of the skills we have learned in class. Where the Swift version needed a third-party dependency (Alamofire) and a fair amount of protocol conformance (`Codable`, `Identifiable`) to talk to the network, JavaScript's built-in `fetch()` and its naturally dynamic objects let us skip most of that ceremony -- so this version of the lab will feel noticeably lighter on setup. The final application will look like this:

   <p float="left" align="center">
     <img src="PLACEHOLDER_SCREENSHOT_1.png" width="45%"/>
   </p>

Setup
---

1. Create a new Expo project called `SwiftReposRN`:

   ```
   npx create-expo-app SwiftReposRN --template blank
   cd SwiftReposRN
   ```

   Note we're using the plain `blank` template rather than `blank-typescript` this time -- this lab is written in plain JavaScript (`.js` files), since we don't need TypeScript's type annotations to get the same safety `Codable` gave us in Swift. GitHub's API already returns predictably-shaped JSON, and `fetch()` parses it straight into ordinary JavaScript objects with `response.json()`.

1. Install the navigation packages we've used in past labs, along with `expo-web-browser`, a package that lets us pop open a URL in an in-app browser sheet without having to build our own WebView screen:

   ```
   npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context expo-web-browser
   ```

   That's it for setup -- there's no equivalent step here to adding a Swift Package Manager dependency and waiting for Xcode to resolve it. `fetch()` is already built into JavaScript, so there's no networking library to install at all.

1. Create three folders inside your project -- `screens`, `components`, and `services` -- to organize our work. This maps roughly onto the Swift version's Views/Models split: `screens` will hold our main list screen (playing the role `ContentView` did), `components` will hold the reusable row cell (`RepositoryRow`), and `services` will hold the function that talks to the GitHub API (playing the role `Parser.swift` did).

Fetching the Data
---

1. In the Swift version, a good chunk of this lab was spent making the `Repository` struct conform to `Codable` and `Identifiable`, and wiring up `CodingKeys` so Swift's JSON decoder knew how to map GitHub's JSON fields onto your struct's properties. In JavaScript we don't need a model type at all -- the objects that come back from `response.json()` already have exactly the fields GitHub sent us (`name`, `description`, `html_url`, `id`, and so on), and we can just reference those fields directly wherever we need them.

1. Create a new file called `repositoryService.js` inside `services`. This is the JavaScript equivalent of `Parser.swift` -- like the Swift version, we're giving you fully working networking code here since making the network call itself isn't the main focus of this lab:

   ```javascript
   export const fetchRepositories = async () => {
     try {
       const response = await fetch('https://api.github.com/search/repositories?q=language:swift&sort=stars&order=desc');
       const data = await response.json();
       return data.items || [];
     } catch (error) {
       console.error('Error fetching repositories:', error);
       return [];
     }
   };
   ```

   Compare this to `Parser.swift`'s use of Alamofire -- both are hitting the same GitHub search endpoint (`language:swift`, sorted by stars descending) and both are pulling the array of repositories out from under an `items` key in the response. In Swift, that `items` key is why we created the `Repositories` container struct (`struct Repositories: Codable { let items: [Repository] }`); here, `data.items` reaches into that same field directly, no container type required.

   I realize most students want to just get through the lab as quickly as possible, but I would urge you to take a few minutes to look over the [GitHub Search API documentation](https://docs.github.com/en/rest/search/search) and see what other fields and query parameters are available -- you'll likely find them useful in project work.

State Management
---

In the Swift version, a `ViewModel` conforming to `ObservableObject` held three `@Published` fields -- `repos`, `searchText`, and `filteredRepos` -- so that changes would automatically propagate to the interface. React Native's `useState` hook plays the same role but without needing a separate class: state lives directly inside the component that needs it, and any time that state changes, the component re-renders.

1. Create a new file called `HomeScreen.js` inside `screens`. Start by declaring four pieces of state:

   ```javascript
   import React, { useState, useEffect } from 'react';
   import { Text, View, FlatList, TextInput, Alert } from 'react-native';
   import * as WebBrowser from 'expo-web-browser';
   import { styles } from '../styles/AppStyles';
   import { fetchRepositories } from '../services/repositoryService';
   import { RepositoryRow } from '../components/RepositoryRow';

   export const HomeScreen = () => {
     const [repositories, setRepositories] = useState([]);
     const [displayedRepos, setDisplayedRepos] = useState([]);
     const [searchText, setSearchText] = useState('');
     const [loading, setLoading] = useState(true);

     // ...
   };
   ```

   `repositories` is the full list we get back from the API (this is the equivalent of the view model's `repos`), `displayedRepos` is whatever subset should currently be shown on screen (the equivalent of `filteredRepos`, though here it also covers the unfiltered case), and `searchText` mirrors the Swift version's `searchText`/`searchField`. `loading` is a small addition that lets us show a "Loading..." message while the initial fetch is in flight, since there's nothing on screen at all until that first API call resolves.

1. Now let's load the data. In the Swift version, `loadData()` was called from `.onAppear(perform: loadData)` on the outer `VStack`. React Native's equivalent for "run this once when the component first mounts" is the `useEffect` hook with an empty dependency array:

   ```javascript
   useEffect(() => {
     loadData();
   }, []);

   const loadData = async () => {
     setLoading(true);
     const repos = await fetchRepositories();
     setRepositories(repos);
     setDisplayedRepos(repos);
     setLoading(false);
   };
   ```

1. Next we need the filtering logic that corresponds to the Swift view model's `search(searchText:)` method and the `displayRepos()` helper on `ContentView`. Rather than wiring this up through a custom `Binding` the way the Swift version did, we can lean on a second `useEffect` that automatically reruns whenever `searchText` or `repositories` changes:

   ```javascript
   useEffect(() => {
     filterRepositories();
   }, [searchText, repositories]);

   const filterRepositories = () => {
     if (searchText === '') {
       setDisplayedRepos(repositories);
     } else {
       const filtered = repositories.filter(repo =>
         repo.name.toLowerCase().includes(searchText.toLowerCase())
       );
       setDisplayedRepos(filtered);
     }
   };
   ```

   Compare this to the Swift version's `search(searchText:)` method (`self.repos.filter { repo in repo.name.lowercased().contains(searchText.lowercased()) }`) -- the filtering logic itself is nearly identical, just spelled with JavaScript's `filter`/`includes`/`toLowerCase` instead of Swift's `filter`/`contains`/`lowercased`. The difference is in how it gets triggered: Swift's custom `Binding` called `search()` manually every time the text field's `set` closure ran, while here the `useEffect` dependency array (`[searchText, repositories]`) declares "rerun this whenever either of these values changes" and React handles the rest.

Views
---

List Row Cell (`RepositoryRow`)
---

1. Let's start easy with the file that basically holds the contents of an individual list cell. Create `RepositoryRow.js` inside `components`. Recall from the Swift version that a cell displays the repository's name (bolded, larger) and description (smaller, secondary color), with the name on top and the description below:

   ```javascript
   import React from 'react';
   import { Text, View, TouchableOpacity } from 'react-native';
   import { styles } from '../styles/AppStyles';

   export const RepositoryRow = ({ repository, onPress }) => (
     <TouchableOpacity style={styles.repositoryRow} onPress={onPress}>
       <View>
         <Text style={styles.repositoryName}>{repository.name}</Text>
         <Text style={styles.repositoryDescription} numberOfLines={1}>
           {repository.description || 'N/A'}
         </Text>
       </View>
     </TouchableOpacity>
   );
   ```

   Notice this component takes an `onPress` prop rather than handling navigation itself -- that keeps `RepositoryRow` a simple, reusable display component, and lets whatever screen uses it decide what tapping a row should actually do (we'll fill that in shortly).

1. Add the corresponding styles to a new file called `AppStyles.js` inside a `styles` folder at the root of your project:

   ```javascript
   import { StyleSheet } from 'react-native';

   export const styles = StyleSheet.create({
     container: {
       flex: 1,
       backgroundColor: '#fff',
     },
     centerContainer: {
       flex: 1,
       justifyContent: 'center',
       alignItems: 'center',
       backgroundColor: '#fff',
     },
     searchInput: {
       height: 40,
       margin: 12,
       borderWidth: 1,
       padding: 10,
       borderColor: '#ddd',
       borderRadius: 8,
       backgroundColor: '#f8f9fa',
     },
     list: {
       flex: 1,
     },
     repositoryRow: {
       padding: 16,
       borderBottomWidth: 1,
       borderBottomColor: '#eee',
       backgroundColor: '#fff',
     },
     repositoryName: {
       fontSize: 18,
       fontWeight: 'bold',
       marginBottom: 4,
     },
     repositoryDescription: {
       fontSize: 14,
       color: '#666',
     },
   });
   ```

List View (`HomeScreen`)
---

1. Now time to hit the challenging one: our list of repos, back in `HomeScreen.js`. If the screen is still loading, show a simple message rather than an empty list:

   ```javascript
   if (loading) {
     return (
       <View style={styles.centerContainer}>
         <Text>Loading repositories...</Text>
       </View>
     );
   }
   ```

1. Otherwise, return a `View` containing a `TextInput` for the search bar and a `FlatList` for the repos, the React Native equivalent of SwiftUI's `List`:

   ```javascript
   return (
     <View style={styles.container}>
       <TextInput
         style={styles.searchInput}
         placeholder="Search"
         value={searchText}
         onChangeText={setSearchText}
       />
       <FlatList
         data={displayedRepos}
         keyExtractor={(item) => item.id.toString()}
         renderItem={({ item }) => (
           <RepositoryRow
             repository={item}
             onPress={() => openRepository(item)}
           />
         )}
         style={styles.list}
       />
     </View>
   );
   ```

   Notice the `TextInput`'s `value`/`onChangeText` pair is doing the same job the Swift version's custom `Binding` did -- reading from `searchText` and writing back to it as the user types -- but without needing a hand-rolled `Binding<String>`, since `onChangeText` just calls `setSearchText` directly and lets the `useEffect` from the State Management section pick up the change.

Opening a Repository
---

This is where the two versions diverge the most. The Swift version's bonus challenge was to make each row link to a `WebView` screen (via `NavigationLink(destination: WebView(request: URLRequest(url: URL(string: repository.htmlURL)!)))`), reusing the custom `WebView` wrapper around `WKWebView` you may have built in a previous lab. React Native's `expo-web-browser` package gives us an even simpler option: rather than building and navigating to our own in-app browser screen, we can hand the URL to the operating system's own in-app browser sheet with a single function call.

1. Back in `HomeScreen.js`, add an `openRepository` function that uses `WebBrowser.openBrowserAsync()`:

   ```javascript
   const openRepository = async (repository) => {
     try {
       await WebBrowser.openBrowserAsync(repository.html_url);
     } catch (error) {
       Alert.alert('Error', 'Could not open repository URL');
     }
   };
   ```

   Notice we're reading `repository.html_url` here -- that's the exact field name GitHub's API returns (snake_case, since it's a Ruby/Rails-flavored API), which is exactly the kind of mismatch `CodingKeys` existed to paper over in the Swift version. Since we're not mapping this JSON onto a strongly-typed struct, we just reference the field by its real name directly.

1. This function is already wired up as the `onPress` handler passed into `RepositoryRow` above, so at this point tapping a row should open that repository's GitHub page in a browser sheet layered on top of your app.

1. Finally, let's give our screen a title. Create `App.js` at the root of your project and set up a stack navigator with a single screen, giving it the title "Swift Repos" the way `.navigationBarTitle("Swift Repos")` did in the Swift version:

   ```javascript
   import React from 'react';
   import { StatusBar } from 'expo-status-bar';
   import { NavigationContainer } from '@react-navigation/native';
   import { createNativeStackNavigator } from '@react-navigation/native-stack';
   import { HomeScreen } from './screens/HomeScreen';

   const Stack = createNativeStackNavigator();

   export default function App() {
     return (
       <NavigationContainer>
         <Stack.Navigator
           screenOptions={{
             headerStyle: { backgroundColor: '#f8f9fa' },
             headerTintColor: '#000',
             headerTitleStyle: { fontWeight: 'bold' },
           }}
         >
           <Stack.Screen
             name="Home"
             component={HomeScreen}
             options={{
               title: 'Swift Repos',
               headerTitleAlign: 'center'
             }}
           />
         </Stack.Navigator>
         <StatusBar style="auto" />
       </NavigationContainer>
     );
   }
   ```

1. Run the app in a simulator and see that it displays the repos from the API call, that searching filters the list as you type, and that tapping a row opens that repo's GitHub page.

If time allows, you can also explore customizing the views more and cleaning up some of the code -- consider what it would take to add pull-to-refresh to the `FlatList`, show a loading spinner instead of plain text, or display the repo's star count alongside its description. Feel free to explore further -- that's where the real fun and learning is! Qapla'
