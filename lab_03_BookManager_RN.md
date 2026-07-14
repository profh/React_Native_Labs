Lab 3: BookManager (React Native)
---

In this lab we are going to build a slight variation of the BookManager lab from 67-272. However, at this stage, we don't have access to a database yet so we will be drawing data through an array of records we'll provide. But it will allow us to use some mobile UI elements, in addition to a form to add records to the array and create some charts to analyze our book records.

When we are finished, we'll have an app like this:

<p float="left" align="center">
  <img src="PLACEHOLDER_SCREENSHOT_1.png" width="30%"/>
  <img src="PLACEHOLDER_SCREENSHOT_2.png" width="30%"/>
  <img src="PLACEHOLDER_SCREENSHOT_3.png" width="30%"/>
</p>

Again, this lab will be built with Expo and TypeScript, the same setup we've used for the past two labs.

Part 0: Creating tab bar navigation
---

1. Create a new Expo project called `BookManagerRN`:

   ```
   npx create-expo-app BookManagerRN --template blank-typescript
   cd BookManagerRN
   ```

1. Install the navigation packages we'll need. This app uses both a bottom tab bar (for Library / New Book / Charts) and a stack navigator nested inside the Library tab (for pushing into a book's details), so we need both:

   ```
   npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated
   ```

   We'll also grab an icon set for the tab bar, and a couple of UI libraries we'll lean on later for the swipeable list and the gender picker:

   ```
   npx expo install react-native-vector-icons react-native-swipe-list-view react-native-dropdown-picker react-native-chart-kit react-native-svg
   ```

1. Create three folders inside your project -- `Views`, `Models`, and `Controllers` -- like we did last week to organize our work.

1. Inside `Views`, create four new files -- `AppView.tsx`, `LibraryView.tsx`, `NewBookView.tsx`, and `BookDetailsView.tsx` -- along with `ChartsView.tsx`. `App.tsx` at the root of your project will stay very small; its only job is to render `AppView`:

   ```typescript
   import React from 'react';
   import AppView from './Views/AppView';

   export default function App() {
     return (
       <AppView />
     );
   }
   ```

1. Inside `AppView.tsx` we are going to build our tab bar. Unlike SwiftUI's `TabView`, React Native doesn't ship with a tab bar component -- that's exactly why we installed `@react-navigation/bottom-tabs` above. The following code will get us started with a single tab:

   ```typescript
   import React from 'react';
   import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
   import { NavigationContainer } from '@react-navigation/native';
   import Icon from 'react-native-vector-icons/Ionicons';
   import LibraryView from './LibraryView';

   const Tab = createBottomTabNavigator();

   const AppView: React.FC = () => {
     return (
       <NavigationContainer>
         <Tab.Navigator
           screenOptions={({ route }) => ({
             tabBarIcon: ({ color, size }) => {
               let iconName: string = '';
               if (route.name === 'Library') {
                 iconName = 'library-sharp';
               }
               return <Icon name={iconName} size={size} color={color} />;
             },
             headerShown: false,
             tabBarActiveTintColor: 'blue',
             tabBarInactiveTintColor: 'gray',
           })}
         >
           <Tab.Screen name="Library" component={LibraryView} />
         </Tab.Navigator>
       </NavigationContainer>
     );
   };

   export default AppView;
   ```

   If we run this code now (`npx expo start`), we should see a single "Library" tab at the bottom of the screen, pointing at an empty `LibraryView` component you haven't built yet -- go ahead and stub it out with a bare `<Text>Library</Text>` for now so the app compiles.

1. Now go ahead and add two more `Tab.Screen` entries, one named `"New Book"` (pointing at a stubbed-out `NewBookView`) using the icon `book-outline`, and another named `"Charts"` (pointing at a stubbed-out `ChartsView`) using the icon `bar-chart`. If you want to choose different icons, you can browse [Ionicons](https://ionic.io/ionicons) for other options. Rerunning and flipping through the tabs, you should see all three screens.

Part 1: Creating models
---

1. We are going to be tracking the gender of the authors of our books, so to make that easier, we'll create a file called `Gender.tsx` in the `Models` folder. TypeScript has an `enum` construct that plays a very similar role to Swift's `enum`, so this should feel familiar:

   ```typescript
   export enum Gender {
     MALE = 'Male',
     FEMALE = 'Female',
     OTHER = 'Other'
   }
   ```

1. Now create a `Book` class inside the `Models` folder, in a file called `Book.tsx`. It should have `title`, `author`, and `gender` fields (all strings), as well as a boolean field called `displayed`.

1. Of course, we need a constructor for this class:

   ```typescript
   export class Book {
     id;
     title;
     author;
     gender;
     displayed;

     constructor(title: string, author: string, gender: string, displayed: boolean) {
       this.title = title;
       this.author = author;
       this.gender = gender;
       this.displayed = displayed;
     }
   }
   ```

1. Since we are going to build these records from a plain object rather than a database, there is no ID for these records that lets us uniquely identify them. In the Swift version, we solved this by conforming to the `Identifiable` protocol and letting `UUID()` generate an ID for us. TypeScript doesn't have a built-in UUID generator, so we'll write a small helper method ourselves and call it from the constructor:

   ```typescript
   constructor(title: string, author: string, gender: string, displayed: boolean) {
     this.id = this.generateUUID();
     this.title = title;
     this.author = author;
     this.gender = gender;
     this.displayed = displayed;
   }

   // Generates a 128-bit hexadecimal string in the same version-4 UUID format
   // Apple's UUID() produces, e.g. 08B15DB4-2F02-4AB8-A965-67A9C90D8A44,
   // so each book gets a unique id even without a database behind it.
   generateUUID() {
     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
       var r = (Math.random() * 16) | 0,
         v = c === 'x' ? r : (r & 0x3) | 0x8;
       return v.toString(16);
     });
   }
   ```

   Don't worry about memorizing this regex trick -- the important idea, same as in Swift, is that every `Book` gets a unique `id` the moment it's created.

1. The other challenge is how do we compare `Book` objects, and how do we sort them? In Swift, we solved this by conforming to the `Comparable` protocol. TypeScript classes don't have an equivalent protocol to conform to, but we can get the same effect with two static methods on the class:

   ```typescript
   static equals(book1: Book, book2: Book) {
     return book1.title === book2.title && book1.author === book2.author;
   }

   static compare(book1: Book, book2: Book) {
     return book1.title.localeCompare(book2.title);
   }
   ```

   `localeCompare` is doing the same job here that `<` did on strings in Swift -- it returns a negative, zero, or positive number depending on alphabetical order, which is exactly the shape JavaScript's `Array.prototype.sort()` expects from a comparator function.

Part 2: Creating a library
---

1. We have a `Book` model which describes a book object, but now we need a class for a collection of books, which we will call `Library`. Create a new file called `Library.tsx` in the `Models` folder.

1. Within the class we will declare a private `books` array and then create a constructor that will read in the same 77 classic books from a plain object and populate that array:

   ```typescript
   import { Book } from './Book';
   import { Gender } from './Gender';

   export class Library {
     private books: Book[];

     constructor() {
       this.books = [];

       const bookData: Record<string, [string, Gender]> = {
         "The Count of Monte Cristo": ["Alexandre Dumas", Gender.MALE],
         "The Man in the Iron Mask": ["Alexandre Dumas", Gender.MALE],
         "The Three Musketeers": ["Alexandre Dumas", Gender.MALE],
         "Black Beauty": ["Anna Sewell", Gender.FEMALE],
         // ...and so on for the rest of the 77 books.
         // Feel free to copy the full dictionary from the Swift version of this
         // lab and translate each entry into this [author, Gender] tuple shape.
       };

       for (const title in bookData) {
         const [author, gender] = bookData[title];
         this.books.push(new Book(title, author, gender, true));
         this.books.sort(Book.compare);
       }
     }
   }
   ```

   The nice thing is that since `Book.compare` gives us an ordering, we can call `sort()` after every insertion and get our books in alphabetical order by title, rather than some random order -- the same benefit `Comparable` gave us in Swift.

1. We want this class to have a method to add a new book to the library. The following method would accomplish this:

   ```typescript
   public addBookToLibrary(title: string, author: string, gender: Gender, displayed: boolean): void {
     this.books.push(new Book(title, author, gender, displayed));
     this.books.sort(Book.compare);
   }
   ```

1. We also need some methods to extract subsets of our library. JavaScript arrays have a `filter` method that behaves just like Swift's `filter` (and like `select` in Ruby). We can use it here to write a method to get all the books for a particular author:

   ```typescript
   public getBooksFor(author: string): Book[] {
     return this.books.filter((book) => book.author === author);
   }
   ```

   Now write two more methods, one called `getFemaleAuthoredBooks()` which will return a list of all the books in the library written by women, and a similar method called `getMaleAuthoredBooks()`. We will need all three of these methods later in our charting section. Also add a simple `getBooks()` getter that returns the full `books` array, since `books` is `private`.

1. Here's where things diverge a bit from the Swift version. In SwiftUI, we made `Library` an `ObservableObject`, created a single instance of it in `AppView`, and shared it across tabs with `.environmentObject()`. React doesn't have `ObservableObject`, but it has a very similar tool for sharing data across a whole component tree without passing props down manually at every level: the [Context API](https://react.dev/learn/passing-data-deeply-with-context).

   Create a new file in the `Controllers` folder called `LibraryContext.tsx`. This will hold both the shared `books` state (using `useState`, since a plain `Library` instance has no way to notify React when it changes) and the functions any screen might need to read or update it:

   ```typescript
   import React, { createContext, useState, ReactNode } from 'react';
   import { Library } from '../Models/Library';
   import { Book } from '../Models/Book';
   import { LibraryContextType } from '../types';

   const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

   const LibraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
     const [books, setBooks] = useState(new Library().getBooks());

     const addBookToLibrary = (title: string, author: string, gender: string, displayed: boolean) => {
       const newBook = new Book(title, author, gender, displayed);
       setBooks((prevBooks) => [...prevBooks, newBook]);
     };

     const getBooksFor = (author: string) => {
       return new Library().getBooksFor(author);
     };

     const getMaleAuthoredBooks = () => {
       return new Library().getMaleAuthoredBooks();
     };

     const getFemaleAuthoredBooks = () => {
       return new Library().getFemaleAuthoredBooks();
     };

     return (
       // `children` represents whatever components get nested inside <LibraryProvider>.
       // In AppView.tsx we'll wrap our entire tab navigator in this provider, which
       // is what makes `books` and these functions available to every tab.
       <LibraryContext.Provider value={{ books, setBooks, addBookToLibrary, getBooksFor, getMaleAuthoredBooks, getFemaleAuthoredBooks }}>
         {children}
       </LibraryContext.Provider>
     );
   };

   export { LibraryContext, LibraryProvider };
   ```

   You'll notice `LibraryContextType` referenced above -- add this to a new `types.ts` file at the root of your project, which we'll also use in a moment for our navigation types:

   ```typescript
   import { Book } from './Models/Book';

   export interface LibraryContextType {
       books: Book[];
       setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
       addBookToLibrary: (title: string, author: string, gender: string, displayed: boolean) => void;
       getBooksFor: (author: string) => Book[];
       getMaleAuthoredBooks: () => Book[];
       getFemaleAuthoredBooks: () => Book[];
   }
   ```

1. Now go back to `AppView.tsx` and wrap the whole `NavigationContainer` in `LibraryProvider`, the same role `.environmentObject(library)` played in the Swift version:

   ```typescript
   import { LibraryProvider } from '../Controllers/LibraryContext';

   const AppView: React.FC = () => {
     return (
       <LibraryProvider>
         <NavigationContainer>
           {/* ...Tab.Navigator from Part 0 goes here... */}
         </NavigationContainer>
       </LibraryProvider>
     );
   };
   ```

Part 3: Building out the library view
---

1. Let's build out the list view in `LibraryView.tsx` first. To read from our shared library, we import the `useContext` hook along with `LibraryContext`:

   ```typescript
   import React, { useContext } from 'react';
   import { LibraryContext } from '../Controllers/LibraryContext';
   import { LibraryContextType } from '../types';

   const LibraryView: React.FC = () => {
     const { books } = useContext(LibraryContext) as LibraryContextType;
     // ...
   };
   ```

   This one line is doing the same job as `@EnvironmentObject var library: Library` did in SwiftUI -- it reaches up into the nearest `LibraryProvider` and pulls out the shared state.

1. To make a simple list, React Native gives us a `FlatList` component, which is the rough equivalent of SwiftUI's `List`. For now, try rendering just the titles:

   ```typescript
   <FlatList
     data={books}
     keyExtractor={(item) => item.id}
     renderItem={({ item }) => <Text>{item.title}</Text>}
   />
   ```

   This is okay, but what if we wanted more information about the book (like author and such)? We need a little more than a simple list -- as we saw last week with RailsCards, it'd be nice to navigate to a details screen and then pop back to the list later.

1. To make this happen, let's first create a simple `BookDetailsView.tsx` in `Views` with the following code:

   ```typescript
   import React from 'react';
   import { View, Text, StyleSheet } from 'react-native';
   import { BookDetailsScreenProps } from '../types';

   const BookDetailsView: React.FC<BookDetailsScreenProps> = ({ route }) => {
     const { book } = route.params;

     return (
       <View style={styles.container}>
         <Text style={styles.title}>{book.title}</Text>
         <Text style={styles.author}>Author: {book.author} ({book.gender})</Text>
       </View>
     );
   };

   const styles = StyleSheet.create({
     container: {
       flex: 1,
       padding: 20,
       justifyContent: 'center',
     },
     title: {
       fontSize: 30,
       fontWeight: 'bold',
       marginBottom: 10,
       textAlign: 'center',
     },
     author: {
       fontSize: 20,
       marginBottom: 5,
       textAlign: 'center',
     }
   });

   export default BookDetailsView;
   ```

   Notice this already fills in the title, author, and gender -- feel free to leave it this way rather than stubbing it out first the way the Swift version did with `Text("Qapla'")`. Just make sure you understand why `justifyContent: 'center'` pushes the content to the middle of the screen vertically while `textAlign: 'center'` centers the text horizontally within each line -- these are two different jobs that Swift's default centering handled for us automatically.

1. Since we want to push from the Library tab into this details screen and get the automatic back button, we need a *stack navigator nested inside our Library tab*. Add these types to `types.ts`:

   ```typescript
   import { NativeStackScreenProps } from '@react-navigation/native-stack';

   export type RootStackParamList = {
       LibraryView: undefined;
       BookDetails: { book: Book };
   };

   export type BookDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'BookDetails'>;
   ```

   Then in `AppView.tsx`, create the nested stack and swap it in for the plain `LibraryView` component on the Library tab:

   ```typescript
   import { createStackNavigator } from '@react-navigation/stack';
   import { RootStackParamList } from '../types';
   import BookDetailsView from './BookDetailsView';

   const LibraryStack = createStackNavigator<RootStackParamList>();

   const LibraryStackScreen = () => {
     return (
       <LibraryStack.Navigator>
         <LibraryStack.Screen
           name="LibraryView"
           component={LibraryView}
           options={{ headerShown: false, title: "Library" }}
         />
         <LibraryStack.Screen
           name="BookDetails"
           component={BookDetailsView}
           options={{ title: 'Book Details' }}
         />
       </LibraryStack.Navigator>
     );
   };

   // Then in your Tab.Navigator:
   <Tab.Screen name="Library" component={LibraryStackScreen} />
   ```

1. Now back in `LibraryView.tsx`, use the `useNavigation` hook to navigate to `BookDetails` when a row is tapped, passing the whole `book` object as a param (the same idea as passing `book: book` into `BookDetailsView` in Swift):

   ```typescript
   import { useNavigation, NavigationProp } from '@react-navigation/native';
   import { RootStackParamList } from '../types';

   const LibraryView: React.FC = () => {
     const navigation = useNavigation<NavigationProp<RootStackParamList>>();
     const { books } = useContext(LibraryContext) as LibraryContextType;

     return (
       <SafeAreaView style={styles.container}>
         <Text style={styles.header}>Library</Text>
         <FlatList
           data={books}
           keyExtractor={(item) => item.id}
           renderItem={({ item }) => (
             <Pressable onPress={() => navigation.navigate('BookDetails', { book: item })}>
               <Text style={styles.bookTitle}>{item.title}</Text>
             </Pressable>
           )}
         />
       </SafeAreaView>
     );
   };
   ```

   Run this and see that it works -- you can tap into a book's details and use the header's back button to return to the list.

1. This works, but is the code easy to read? Rather than writing the row's markup inline the way we've done above, consider pulling it out into its own component (a "row view," to use SwiftUI's terminology) that just takes a `book` and an `onPress` handler as props. This is much like the partials we discussed again and again in 67-272 -- the list view's job is just to lay out rows, and if we want to learn more about what a row looks like, we know exactly where to go look.

1. One last thing: we'd like to be able to swipe left on a row and delete a book -- it's a gesture we're used to in the mobile space. React Native doesn't ship this out of the box the way SwiftUI's `.onDelete()` does, which is why we installed `react-native-swipe-list-view` earlier. Swap your `FlatList` for a `SwipeListView`, which renders each row as a stack of a normal "front" row and a hidden "back" row that's revealed when you swipe:

   ```typescript
   import { SwipeListView } from 'react-native-swipe-list-view';

   const deleteBook = (rowMap: { [key: string]: any }, rowKey: string) => {
     rowMap[rowKey]?.closeRow();
     setBooks(books.filter((item) => item.id !== rowKey));
   };

   <SwipeListView
     data={books.filter((book) => book.displayed)}
     keyExtractor={(item) => item.id}
     renderItem={({ item }) => (
       <Pressable onPress={() => navigation.navigate('BookDetails', { book: item })}>
         <Text style={styles.bookTitle}>{item.title}</Text>
       </Pressable>
     )}
     renderHiddenItem={(data, rowMap) => (
       <TouchableOpacity onPress={() => deleteBook(rowMap, data.item.id)}>
         <Text>Delete</Text>
       </TouchableOpacity>
     )}
     leftOpenValue={0}
     rightOpenValue={-75}
     disableRightSwipe
   />
   ```

   Notice this filters `books` down to only those with `displayed === true` before rendering -- that field will start to matter once we build the New Book form.

Part 4: Building a new book form
---

1. In `NewBookView.tsx`, start by pulling `addBookToLibrary` out of context, the same way we did in `LibraryView`:

   ```typescript
   const { addBookToLibrary } = useContext(LibraryContext) as LibraryContextType;
   ```

1. Add the following state, which plays the same role the `@State` properties did in the Swift form:

   ```typescript
   const [title, setTitle] = useState('');
   const [author, setAuthor] = useState('');
   const [gender, setGender] = useState('Male');
   const [displayed, setDisplayed] = useState(false);
   ```

1. Give the screen a heading:

   ```typescript
   <Text style={styles.heading}>New Book</Text>
   ```

1. Next we need the two text fields for title and author. React Native's `TextInput` is the equivalent of SwiftUI's `TextField`, but note that it doesn't have a built-in two-way `$binding` -- you have to wire up `value` and `onChangeText` yourself:

   ```typescript
   <TextInput
     style={styles.input}
     placeholder="Title"
     value={title}
     onChangeText={setTitle}
   />
   <TextInput
     style={styles.input}
     placeholder="Author"
     value={author}
     onChangeText={setAuthor}
   />
   ```

1. Now we need a picker that lets us choose the author's gender. SwiftUI's `Picker` has no built-in React Native equivalent with the same look, which is why we installed `react-native-dropdown-picker` earlier:

   ```typescript
   import DropDownPicker from 'react-native-dropdown-picker';

   const [open, setOpen] = useState(false);
   const [items, setItems] = useState([
     { label: 'Male', value: 'Male' },
     { label: 'Female', value: 'Female' },
     { label: 'Other', value: 'Other' }
   ]);

   // ...inside your JSX:
   <DropDownPicker
     open={open}
     value={gender}
     items={items}
     setOpen={setOpen}
     setValue={setGender}
     setItems={setItems}
   />
   ```

   Notice this component needs a bit more state than SwiftUI's `Picker` did (`open` tracks whether the dropdown is currently expanded) -- that's a fairly common pattern with third-party React Native components, since there's no single first-party equivalent that Apple maintains for you.

1. Now let's add a `Switch` to let us toggle whether to display the book (in truth, this field only exists right now for us to practice with a toggle control):

   ```typescript
   <Switch
     value={displayed}
     onValueChange={setDisplayed}
   />
   ```

1. At this point everything is there, but we can't actually add a book yet. Add a `Button` that calls `addBookToLibrary` with our current form values, then resets the form and shows a confirmation. React Native's `Alert.alert()` is a handy stand-in for a simple success message:

   ```typescript
   import { Alert, Keyboard } from 'react-native';

   const handleAddBook = () => {
     Keyboard.dismiss();
     if (title && author) {
       addBookToLibrary(title, author, gender, displayed);
       setTitle('');
       setAuthor('');
       setGender('Male');
       setDisplayed(false);
       Alert.alert('Success', 'Book added to the library!');
     } else {
       Alert.alert('Error', 'Please provide both title and author.');
     }
   };

   // ...inside your JSX:
   <Button
     title="Add Book"
     onPress={handleAddBook}
     disabled={!title || !author}
   />
   ```

   Unlike the Swift version, where clearing the form and confirming success were called out as optional extras left as an exercise, go ahead and include them here -- `handleAddBook` above does both, and the `disabled` prop on `Button` takes care of only showing an active "Add Book" button once title and author are both present.

Part 5: Building out some simple charts
---

React Native doesn't have a first-party charting library the way SwiftUI gained the `Charts` framework, but `react-native-chart-kit` (which we installed back in Part 0) gets us most of the same functionality with a similarly small amount of code.

1. In `ChartsView.tsx`, pull the chart-related functions out of context the same way we've done in the other screens, and import `BarChart` from the charting library:

   ```typescript
   import { BarChart } from 'react-native-chart-kit';
   import { LibraryContext } from '../Controllers/LibraryContext';
   import { LibraryContextType } from '../types';

   const ChartsView = () => {
     const { getBooksFor, getMaleAuthoredBooks, getFemaleAuthoredBooks } = useContext(LibraryContext) as LibraryContextType;
     // ...
   };
   ```

1. Our first chart will be a simple bar chart counting the books by author gender. `react-native-chart-kit` expects its data in a particular shape -- a `labels` array and a `datasets` array of matching numbers -- rather than the mark-by-mark approach SwiftUI's `Chart` uses:

   ```typescript
   const maleBooks = getMaleAuthoredBooks().length;
   const femaleBooks = getFemaleAuthoredBooks().length;

   const genderChartData = {
     labels: ['Male', 'Female'],
     datasets: [
       {
         data: [maleBooks, femaleBooks],
       },
     ],
   };
   ```

   Then, give the screen a title and render the chart, sizing it to the width of the screen with `Dimensions`:

   ```typescript
   import { Dimensions } from 'react-native';

   const screenWidth = Dimensions.get('window').width;

   <Text style={styles.title}>Books by Author Gender</Text>
   <BarChart
     data={genderChartData}
     width={screenWidth}
     height={250}
     chartConfig={chartGenderConfig}
     fromZero={true}
     yAxisLabel=""
     yAxisSuffix=""
   />
   ```

   `chartConfig` is where `react-native-chart-kit` wants its colors and styling, roughly playing the role `.foregroundColor()` and friends played on the SwiftUI `Chart`:

   ```typescript
   const chartGenderConfig = {
     backgroundGradientFrom: '#fff',
     backgroundGradientTo: '#fff',
     fillShadowGradient: '#3c78f6',
     fillShadowGradientOpacity: 1,
     decimalPlaces: 0,
     color: () => '#3c78f6',
     labelColor: () => '#000000',
   };
   ```

   Wrap the whole screen in a `ScrollView` inside a `SafeAreaView` so the second chart we're about to add doesn't get cut off on smaller screens.

1. We are going to add the counts for some of the most popular authors. We will hand-pick these now (we could write methods to dynamically generate the list). Take what you learned above and pick 5 authors (two must be William Shakespeare and Jane Austen, but you can choose any others for the remaining 3 -- try J.R.R. Tolkien, Charles Dickens, and Charlotte Bronte as a starting point, but do as you wish). Use the `getBooksFor(author)` function to get each author's count:

   ```typescript
   const authorChartData = {
     labels: ['Shakespeare', 'Tolkien', 'Austen', 'Dickens', 'Bronte'],
     datasets: [
       {
         data: [
           getBooksFor('William Shakespeare').length,
           getBooksFor('J.R.R. Tolkien').length,
           getBooksFor('Jane Austen').length,
           getBooksFor('Charles Dickens').length,
           getBooksFor('Charlotte Bronte').length,
         ],
       },
     ]
   };
   ```

   Give this one a green `chartConfig` (try `#65c466` for `fillShadowGradient` and `color`) to distinguish it from the gender chart above, and render it below the first `BarChart` inside the same `ScrollView`.

I know we've covered a lot of ground, but hopefully this gets you familiar with some basic React Native UI elements and prepares you for future labs. In our next lab, we will draw on data from an external API to power our application, which should be fun. Qapla'
