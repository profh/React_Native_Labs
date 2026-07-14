Lab 6: Simple Contacts (React Native)
---

Create a new Expo project with TypeScript. Name it `SimpleContactsRN`. We will add in what we need for navigation, persistence, and photos over the course of the lab.

We covered the Swift version of this app in class, but the idea is very simple: a list view of all your contacts. When you tap on a row, you can see details for that contact and can edit that contact's information or add a photo. The finished app will look something like this:

<p float="left" align="center">
  <img src="PLACEHOLDER_SCREENSHOT_1.png" width="30%"/>
  <img src="PLACEHOLDER_SCREENSHOT_2.png" width="30%"/>
</p>

Part 0: Getting Started
---

1. Create a new Expo project called `SimpleContactsRN`:

   ```
   npx create-expo-app SimpleContactsRN --template blank-typescript
   cd SimpleContactsRN
   ```

1. Install the packages we'll need for navigation, local persistence, the swipe-to-delete gesture, and photo picking. In the Swift version, SwiftData and PhotosUI came bundled with the SDK; here we're pulling in a handful of focused packages instead, much like we did in BookManager and FindMyCar:

   ```
   npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage react-native-swipe-list-view expo-image-picker @expo/vector-icons
   ```

1. Create three folders inside a new `src` directory -- `models`, `context`, and `screens` -- along with a `navigation` folder and a `styles` folder. This maps loosely onto the Swift version's Models/Views split, with two additions: `context` will hold our shared data store (the RN stand-in for SwiftData's model context), and `navigation` will hold our screen stack declaration, since React Navigation asks us to set that up in its own file.

Part 1: Setting Up the Model
---

1. Create a new file called `Person.ts` inside `src/models`. In the Swift version, `@Model class Person` used the SwiftData macro to get persistence, identity, and change tracking essentially for free. TypeScript doesn't have anything like `@Model`, so we'll build the same three pieces by hand, just spread across a few lines instead of one macro: a plain `interface` for the shape of the data, and a small helper function for creating a blank one.

   ```typescript
   export interface Person {
     id: string;
     name: string;
     email: string;
     details: string;
     photoUri?: string;
   }
   ```

   Notice `photoUri` is optional (marked with `?`) and typed as `string` rather than `Data` -- we'll get to why when we build the photo picker in Part 6, but the short version is that RN stores a *reference* to an image file rather than the raw image bytes themselves.

1. SwiftData's `Identifiable` conformance gave every `Person` a stable identity automatically. We need to do that ourselves here. Add a small UUID-generating helper and a `createBlankPerson()` factory function to the bottom of the same file -- this is the same UUID trick we used back in BookManager's `Book` model:

   ```typescript
   // Generates a 128-bit hexadecimal string in the same version-4 UUID format
   // Apple's UUID() produces. Same helper we used back in BookManager -- it
   // gives every Person a unique id even without a database behind it.
   const generateId = (): string => {
     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
       const r = (Math.random() * 16) | 0,
         v = c === 'x' ? r : (r & 0x3) | 0x8;
       return v.toString(16);
     });
   };

   export const createBlankPerson = (): Person => ({
     id: generateId(),
     name: '',
     email: '',
     details: '',
   });
   ```

   Compare this to the Swift version's `init(name:email:details:photo:)` -- both exist to hand back a freshly-constructed `Person` with sensible defaults, ready to be inserted into the store.

Part 2: Setting Up a Store for Persistence
---

In class we said there were three parts to the CoreData stack, and that SwiftData's `@Model` macro and `.modelContainer(for:)` collapsed most of that down to almost nothing. React Native doesn't have a built-in persistence framework at all, so we'll build the RN equivalent from three ingredients we've already used in past labs: `AsyncStorage` for the actual saving and loading, React's Context API for sharing that data across every screen, and a `useEffect` that automatically persists to storage any time the data changes.

1. Create a new file called `PeopleContext.tsx` inside `src/context`. This single file is going to play the role that SwiftData's model context, `@Query`, and `.modelContainer(for: Person.self)` played together in the Swift version. Start with the shape of what this context will expose:

   ```typescript
   import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
   import AsyncStorage from '@react-native-async-storage/async-storage';
   import { Person, createBlankPerson } from '../models/Person';

   const STORAGE_KEY = '@SimpleContacts:people';

   type PeopleContextType = {
     people: Person[];
     loading: boolean;
     addPerson: () => Person;
     updatePerson: (id: string, updates: Partial<Person>) => void;
     deletePerson: (id: string) => void;
     getPerson: (id: string) => Person | undefined;
   };

   const PeopleContext = createContext<PeopleContextType | undefined>(undefined);
   ```

1. Now build the `PeopleProvider` component, which will wrap our entire app the same way `.modelContainer(for: Person.self)` wrapped the Swift app's `WindowGroup`:

   ```typescript
   export const PeopleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
     const [people, setPeople] = useState<Person[]>([]);
     const [loading, setLoading] = useState(true);

     // Load whatever was saved from a previous session as soon as the
     // provider mounts -- this is the RN equivalent of SwiftData's
     // modelContainer(for: Person.self) automatically loading the store.
     useEffect(() => {
       loadPeople();
     }, []);

     // Any time `people` changes, persist the whole array back to
     // AsyncStorage. This plays the role the model context's automatic
     // persistence played in the Swift version -- we don't have to call
     // a "save" method by hand every time something changes.
     useEffect(() => {
       if (!loading) {
         AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(people)).catch((error) => {
           console.error('Error saving people:', error);
         });
       }
     }, [people, loading]);

     const loadPeople = async () => {
       try {
         const json = await AsyncStorage.getItem(STORAGE_KEY);
         if (json != null) {
           setPeople(JSON.parse(json));
         }
       } catch (error) {
         console.error('Error loading people:', error);
       } finally {
         setLoading(false);
       }
     };

     // More to come...
   };
   ```

   Take a moment to notice what this buys us: every screen that reads `people` from this context will automatically re-render when it changes, and every change automatically gets written back to disk -- without any screen needing to know that `AsyncStorage` exists at all. That's the same separation of concerns SwiftData's model context gave us, just built from primitives we already know (`useState`, `useEffect`) instead of a framework macro.

1. Now let's add the operations screens will actually call -- creating, updating, deleting, and looking up a single person. Add these methods inside `PeopleProvider`, right where the "More to come..." comment is:

   ```typescript
   const addPerson = (): Person => {
     const person = createBlankPerson();
     setPeople((prev) => [...prev, person]);
     return person;
   };

   const updatePerson = (id: string, updates: Partial<Person>) => {
     setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
   };

   const deletePerson = (id: string) => {
     setPeople((prev) => prev.filter((p) => p.id !== id));
   };

   const getPerson = (id: string) => people.find((p) => p.id === id);

   return (
     <PeopleContext.Provider
       value={{ people, loading, addPerson, updatePerson, deletePerson, getPerson }}
     >
       {children}
     </PeopleContext.Provider>
   );
   ```

   Compare `addPerson()` here to `AppView.addPerson()` in the Swift version (`let person = Person(...); modelContext.insert(person); path.append(person)`) -- both create a blank person and add it to the store, and both hand the new person back to the caller so a screen can immediately navigate to it. `updatePerson()` and `deletePerson()` correspond to editing a `@Bindable` person's fields directly and to `modelContext.delete(person)`, respectively.

1. Finally, add a small custom hook at the bottom of the file so screens don't have to import both `useContext` and `PeopleContext` every time they need the store:

   ```typescript
   export const usePeople = (): PeopleContextType => {
     const context = useContext(PeopleContext);
     if (!context) {
       throw new Error('usePeople must be used within a PeopleProvider');
     }
     return context;
   };
   ```

Part 3: Setting Up Navigation
---

1. Before building our screens, let's declare the navigation stack that connects them, since our `EditPerson` screen will need to know which contact it's editing. Create `types.ts` inside `src/navigation`:

   ```typescript
   export type RootStackParamList = {
     People: undefined;
     EditPerson: { personId: string };
   };
   ```

   Notice we're passing just a `personId` string as the navigation parameter, not a whole `Person` object -- this is the same pattern we used with RailsCards and BookManager, and it means the edit screen always looks up the very latest version of a person from context rather than working from a possibly-stale copy.

1. Now create `AppNavigator.tsx` inside `src/navigation`. This plays the role `NavigationStack(path: $path) { }` played in `AppView` -- it's the top-level navigation container for the whole app:

   ```typescript
   import React from 'react';
   import { NavigationContainer } from '@react-navigation/native';
   import { createNativeStackNavigator } from '@react-navigation/native-stack';
   import PeopleScreen from '../screens/PeopleScreen';
   import EditPersonScreen from '../screens/EditPersonScreen';
   import { RootStackParamList } from './types';

   const Stack = createNativeStackNavigator<RootStackParamList>();

   const AppNavigator: React.FC = () => {
     return (
       <NavigationContainer>
         <Stack.Navigator initialRouteName="People">
           <Stack.Screen
             name="People"
             component={PeopleScreen}
             options={{ title: 'My Contacts' }}
           />
           <Stack.Screen
             name="EditPerson"
             component={EditPersonScreen}
             options={{ title: 'Edit Person', headerBackTitle: 'My Contacts' }}
           />
         </Stack.Navigator>
       </NavigationContainer>
     );
   };

   export default AppNavigator;
   ```

   The `title: 'My Contacts'` option here is doing the same job `.navigationTitle("My Contacts")` did in the Swift version, and `EditPerson`'s title corresponds to `.navigationTitle("Edit Person")` / `.navigationBarTitleDisplayMode(.inline)` on `EditPersonView`.

1. Finally, tie everything together in `App.tsx` at the root of your project, wrapping the navigator in our `PeopleProvider` so every screen underneath it has access to the shared contacts store:

   ```typescript
   import React from 'react';
   import { StatusBar } from 'expo-status-bar';
   import { PeopleProvider } from './src/context/PeopleContext';
   import AppNavigator from './src/navigation/AppNavigator';

   export default function App() {
     return (
       <PeopleProvider>
         <StatusBar style="auto" />
         <AppNavigator />
       </PeopleProvider>
     );
   }
   ```

Part 4: Building the Contacts List
---

1. We now need to build `PeopleScreen`, the RN equivalent of `PeopleView`. Create `PeopleScreen.tsx` inside `src/screens`. Start by pulling `people`, `addPerson`, and `deletePerson` out of context -- this one line is doing the same job `@Query var people: [Person]` plus `@Environment(\.modelContext) var modelContext` did together in the Swift version:

   ```typescript
   import React, { useState, useLayoutEffect, useMemo } from 'react';
   import { View, Text, TouchableOpacity, Alert } from 'react-native';
   import { useNavigation } from '@react-navigation/native';
   import { NativeStackNavigationProp } from '@react-navigation/native-stack';
   import { SwipeListView } from 'react-native-swipe-list-view';
   import { Ionicons } from '@expo/vector-icons';
   import { usePeople } from '../context/PeopleContext';
   import { RootStackParamList } from '../navigation/types';
   import { styles, colors } from '../styles/styles';

   type SortOrder = 'asc' | 'desc';
   type PeopleScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'People'>;

   const PeopleScreen: React.FC = () => {
     const navigation = useNavigation<PeopleScreenNavigationProp>();
     const { people, addPerson, deletePerson } = usePeople();
     const [searchText, setSearchText] = useState('');
     const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

     const handleAddPerson = () => {
       const person = addPerson();
       navigation.navigate('EditPerson', { personId: person.id });
     };
   ```

   Compare `handleAddPerson` to `AppView.addPerson()` in the Swift version -- both create a blank person and immediately navigate to its edit screen, so a newly-added contact opens straight into editing rather than sitting blank in the list.

1. Now let's build the sort control. The Swift version used a `Menu` containing a `Picker` bound to `sortOrder`, offering "Name (A-Z)" and "Name (Z-A)". React Native doesn't have a direct equivalent to a toolbar `Menu`, so we'll reach for something simpler that's just as effective: `Alert.alert()` with a list of button options, the same tool we used for confirmation dialogs back in BookManager and FindMyCar.

   ```typescript
     const handleSort = () => {
       Alert.alert('Sort', undefined, [
         { text: 'Name (A-Z)', onPress: () => setSortOrder('asc') },
         { text: 'Name (Z-A)', onPress: () => setSortOrder('desc') },
         { text: 'Cancel', style: 'cancel' },
       ]);
     };
   ```

1. Now for the header itself. In the Swift version, `.toolbar { }` and `.searchable(text: $searchText)` were chained directly onto the `NavigationStack`. React Navigation's native-stack navigator has a very close equivalent: `headerSearchBarOptions`, which renders a native search bar built into the header on both iOS and Android. We configure both the search bar and our sort/add buttons together with `navigation.setOptions()`, called inside a `useLayoutEffect` so it runs before the screen is painted:

   ```typescript
     // Configure the header's search bar and buttons. This is the RN
     // equivalent of chaining .searchable(text:) and .toolbar { } onto the
     // NavigationStack in the Swift version.
     useLayoutEffect(() => {
       navigation.setOptions({
         headerSearchBarOptions: {
           placeholder: 'Search',
           onChangeText: (event: any) => setSearchText(event.nativeEvent.text),
         },
         headerRight: () => (
           <View style={styles.headerButtons}>
             <TouchableOpacity onPress={handleSort} style={styles.headerButton}>
               <Ionicons name="swap-vertical" size={22} color={colors.primary} />
             </TouchableOpacity>
             <TouchableOpacity onPress={handleAddPerson} style={styles.headerButton}>
               <Ionicons name="add" size={26} color={colors.primary} />
             </TouchableOpacity>
           </View>
         ),
       });
     }, [navigation, people]);
   ```

1. Now let's handle the filtering and sorting itself. In the Swift version, this lived inside `PeopleView`'s `init(searchString:sortOrder:)`, using `#Predicate` and a `SortDescriptor` to build a live-updating `@Query`. We don't have a query predicate system in plain JavaScript, but a `useMemo` recomputing a filtered-and-sorted array does the same job, and only reruns when one of its dependencies actually changes:

   ```typescript
     // The RN equivalent of PeopleView's #Predicate-based @Query -- filter
     // first by the search text, then sort by the currently selected order.
     const displayedPeople = useMemo(() => {
       let filtered = people;
       if (searchText.trim() !== '') {
         const lower = searchText.toLowerCase();
         filtered = people.filter(
           (p) => p.name.toLowerCase().includes(lower) || p.email.toLowerCase().includes(lower)
         );
       }
       return [...filtered].sort((a, b) =>
         sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
       );
     }, [people, searchText, sortOrder]);
   ```

   Notice this filters on both `name` and `email`, matching the Swift version's predicate (`person.name.localizedStandardContains(searchString) || person.email.localizedStandardContains(searchString)`), and `localeCompare` here is standing in for `SortDescriptor(\Person.name)`/`.reverse`.

1. Now let's build the list itself, along with swipe-to-delete. The Swift version got this almost for free with `.onDelete(perform: deletePeople)` on a `ForEach` inside a `List`. React Native doesn't have a built-in delete gesture, which is exactly why we're reaching for `react-native-swipe-list-view` again, the same package we used for BookManager's library list:

   ```typescript
     const handleDelete = (rowMap: { [key: string]: any }, rowKey: string) => {
       rowMap[rowKey]?.closeRow();
       deletePerson(rowKey);
     };

     return (
       <View style={styles.container}>
         <SwipeListView
           data={displayedPeople}
           keyExtractor={(item) => item.id}
           renderItem={({ item }) => (
             <TouchableOpacity
               style={styles.personRow}
               onPress={() => navigation.navigate('EditPerson', { personId: item.id })}
             >
               <Text style={styles.personName}>{item.name || 'New Contact'}</Text>
               <Ionicons name="chevron-forward" size={18} color={colors.darkGray} />
             </TouchableOpacity>
           )}
           renderHiddenItem={(data, rowMap) => (
             <View style={styles.rowBack}>
               <TouchableOpacity
                 style={styles.deleteButton}
                 onPress={() => handleDelete(rowMap, data.item.id)}
               >
                 <Text style={styles.deleteButtonText}>Delete</Text>
               </TouchableOpacity>
             </View>
           )}
           rightOpenValue={-75}
           disableRightSwipe
         />
       </View>
     );
   };

   export default PeopleScreen;
   ```

   Compare `handleDelete` to `PeopleView.deletePeople(at:)` in the Swift version -- both remove a person from the shared store by identity, and both are triggered by the same left-swipe gesture users already expect from a contacts-style list.

1. Add a `styles.ts` file inside `src/styles` with a `styles` `StyleSheet` and a small `colors` object (we'll build this out fully in the next part, once we know what `EditPersonScreen` needs too). For now, it just needs `container`, `headerButtons`, `headerButton`, `personRow`, `personName`, `rowBack`, `deleteButton`, and `deleteButtonText` to make this screen compile.

1. Run the app (`npx expo start`) and try it out. You can run this, but really all we see that's useful right now is the "My Contacts" title, a search bar, and a sort/add button pair in the header -- tapping "+" should take you to a blank `EditPerson` screen, which we'll build next.

Part 5: Adding/Editing People
---

Unfortunately, not much to test yet because we can't actually put any real information into a contact. To rectify this, create `EditPersonScreen.tsx` inside `src/screens`.

1. Start by reading the `personId` navigation param and looking up the matching person from context:

   ```typescript
   import React from 'react';
   import { View, Text, TextInput, Image, TouchableOpacity, ScrollView } from 'react-native';
   import * as ImagePicker from 'expo-image-picker';
   import { Ionicons } from '@expo/vector-icons';
   import { RouteProp, useRoute } from '@react-navigation/native';
   import { usePeople } from '../context/PeopleContext';
   import { RootStackParamList } from '../navigation/types';
   import { styles, colors } from '../styles/styles';

   type EditPersonRouteProp = RouteProp<RootStackParamList, 'EditPerson'>;

   const EditPersonScreen: React.FC = () => {
     const route = useRoute<EditPersonRouteProp>();
     const { personId } = route.params;
     const { getPerson, updatePerson } = usePeople();
     const person = getPerson(personId);

     if (!person) {
       return (
         <View style={styles.centerContainer}>
           <Text>Contact not found.</Text>
         </View>
       );
     }
   ```

   This `route.params` lookup is the RN equivalent of `EditPersonView`'s `@Bindable var person: Person` parameter, and the early return guards against the (rare) case of navigating to a person that's since been deleted.

1. Within the returned JSX we'll build a form, similar to what we did in BookManager. We could just add three text fields for name, email, and details, but to make the form a little nicer, let's break this into sections the way the Swift version's `Form` did with `Section("Information")` and `Section("Details")`. Since React Native doesn't have a built-in `Form`/`Section` component, we'll build the same visual grouping with plain `View`s and a small header label:

   ```typescript
     return (
       <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
         <View style={styles.section}>
           <Text style={styles.sectionHeader}>Information</Text>
           <TextInput
             style={styles.input}
             placeholder="Name"
             value={person.name}
             onChangeText={(text) => updatePerson(person.id, { name: text })}
             textContentType="name"
           />
           <TextInput
             style={styles.input}
             placeholder="Email"
             value={person.email}
             onChangeText={(text) => updatePerson(person.id, { email: text })}
             textContentType="emailAddress"
             autoCapitalize="none"
             keyboardType="email-address"
           />
         </View>

         <View style={styles.section}>
           <Text style={styles.sectionHeader}>Details</Text>
           <TextInput
             style={[styles.input, styles.detailsInput]}
             placeholder="Details on this person"
             value={person.details}
             onChangeText={(text) => updatePerson(person.id, { details: text })}
             multiline
           />
         </View>
       </ScrollView>
     );
   };

   export default EditPersonScreen;
   ```

   Notice `textContentType="name"` and `textContentType="emailAddress"` -- `TextInput` supports the very same `textContentType` values as SwiftUI's `.textContentType()`, so on iOS you'll get the same autofill suggestions the Swift version's `.textContentType(.name)`/`.textContentType(.emailAddress)` gave you. Also notice there's no explicit "save" step anywhere here: every keystroke calls `updatePerson()` directly, which writes straight into our shared context (and from there, into `AsyncStorage`) -- this is the RN equivalent of editing a `@Bindable` person's properties directly through a two-way `$person.name` binding.

1. Finish wiring up `styles.ts` with the remaining styles this screen needs: `section`, `sectionHeader`, `input`, and `detailsInput`. Give `detailsInput` a taller `minHeight` so it reads more like a paragraph field than a single-line one.

1. Now you can do a basic build and add some data to your contacts. Notice new contacts appear in the list with the placeholder "New Contact" until you give them a name -- try it out.

Part 6: Adding Photos
---

The final step is to add photos to our contacts. This seems hard, but is actually quite easy thanks to `expo-image-picker`, an Expo module that does the heavy lifting of talking to the native photo library on both iOS and Android.

1. We already added the `photoUri` field to `Person` back in Part 1 -- notice it's typed as an optional `string` rather than `Data`. In the Swift version, `@Attribute(.externalStorage) var photo: Data?` told SwiftData to keep the raw image bytes out of the main database file and store them separately on disk. We're accomplishing something similar here, just more directly: `expo-image-picker` already saves the picked photo to a file on the device and simply hands us back a `uri` string pointing at it, so our `AsyncStorage` record only ever holds a small text reference rather than a multi-megabyte blob.

1. Before this will work, we need to grant the app permission to access the photo library -- the RN equivalent of Xcode's `PhotosUI` permission handling. Open `app.json` and add the following inside the `expo` object:

   ```json
   "ios": {
     "supportsTablet": true,
     "infoPlist": {
       "NSPhotoLibraryUsageDescription": "This app needs access to your photos so you can add a picture to a contact."
     }
   },
   "android": {
     "permissions": ["READ_EXTERNAL_STORAGE"]
   },
   "plugins": [
     [
       "expo-image-picker",
       {
         "photosPermission": "This app needs access to your photos so you can add a picture to a contact."
       }
     ]
   ]
   ```

   Just like the location permission in FindMyCar, this configures both platforms at once and lets Expo's config plugin wire the permission strings into the native project for us.

1. Back in `EditPersonScreen.tsx`, add a `pickImage` function above your `return` statement:

   ```typescript
     const pickImage = async () => {
       const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
       if (!permission.granted) {
         return;
       }

       const result = await ImagePicker.launchImageLibraryAsync({
         mediaTypes: ['images'],
         quality: 0.7,
       });

       if (!result.canceled && result.assets.length > 0) {
         updatePerson(person.id, { photoUri: result.assets[0].uri });
       }
     };
   ```

   Compare this to the Swift version's `PhotosPicker`/`loadPhoto()` pair -- both request permission, present the system's photo library UI, and then store a reference to whatever the user picked. The big difference is that `expo-image-picker` combines "show the picker" and "get the result" into a single `await`-able function call, so there's no separate `onChange`/`Task { @MainActor in ... }` dance required the way there was with `PhotosPickerItem.loadTransferable`.

1. Add a new section at the top of the form -- before the "Information" section, since the photo is probably the first thing you want to see, just like the Swift version suggested:

   ```typescript
     return (
       <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
         <View style={styles.section}>
           {person.photoUri ? (
             <Image source={{ uri: person.photoUri }} style={styles.photo} resizeMode="cover" />
           ) : null}
           <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
             <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
             <Text style={styles.photoButtonText}>Select a photo</Text>
           </TouchableOpacity>
         </View>

         {/* ...Information and Details sections from Part 5... */}
   ```

   Notice the conditional `{person.photoUri ? (...) : null}` here is doing the same job the Swift version's `if let imageData = person.photo, let uiImage = UIImage(data: imageData) { ... }` did -- only rendering an `Image` once a photo actually exists, and staying out of the way otherwise. Unlike the Swift version, there's no separate `.onChange(of: selectedItem, loadPhoto)` step required: because `pickImage()` already calls `updatePerson()` directly with the new `photoUri`, the `Image` component picks up the change automatically the next time this component re-renders.

1. Finish out `styles.ts` with `photo` and `photoButton`/`photoButtonText` rules -- a fixed height with `resizeMode="cover"` on the `Image` and a modest border radius will get you most of the way to the polished look in the screenshots at the top of this lab.

At this point, we have a basic contacts app that saves data locally on the device, complete with search, sort, swipe-to-delete, and photos. In class we extended the Swift version further by adding an `Event` model and an `EditEventView`. If you have the time and are up to the challenge, I'd encourage you to extend this app the same way -- a second `AsyncStorage`-backed collection, a new stack screen, and a form very similar to `EditPersonScreen` would get you most of the way there. Qapla'
