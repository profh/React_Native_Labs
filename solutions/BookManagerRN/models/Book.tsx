import uuid from 'react-native-uuid';

export class Book {
  id: string;
  title: string;
  author: string;
  gender: string;
  displayed: boolean;

  constructor(title: string, author: string, gender: string, displayed: boolean) {
    this.id = uuid.v4();
    this.title = title;
    this.author = author;
    this.gender = gender;
    this.displayed = displayed;
  }

  static equals(book1: Book, book2: Book) {
    return book1.title === book2.title && book1.author === book2.author;
  }

  static compare(book1: Book, book2: Book) {
    return book1.title.localeCompare(book2.title);
  }
}