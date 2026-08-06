import { Book } from './models/Book';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export interface LibraryContextType {
    books: Book[];
    setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
    addBookToLibrary: (title: string, author: string, gender: string, displayed: boolean) => void;
    getBooksFor: (author: string) => Book[];
    getMaleAuthoredBooks: () => Book[];
    getFemaleAuthoredBooks: () => Book[];
}


export type RootStackParamList = {
    LibraryView: undefined;
    BookDetails: { book: Book };
};

export type BookDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'BookDetails'>;