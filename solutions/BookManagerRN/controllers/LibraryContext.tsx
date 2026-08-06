import { createContext, ReactNode, useState } from "react";
import { LibraryContextType } from "../types";
import { Library } from "../models/Library";
import { Book } from "../models/Book";

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
    <LibraryContext.Provider value={{ books, setBooks, addBookToLibrary, getBooksFor, getMaleAuthoredBooks, getFemaleAuthoredBooks }}>
      {children}
    </LibraryContext.Provider>
  );
};

export { LibraryContext, LibraryProvider };