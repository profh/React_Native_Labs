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
      "Pride and Prejudice": ["Jane Austen", Gender.FEMALE],
      "Sense and Sensibility": ["Jane Austen", Gender.FEMALE],
      "Emma": ["Jane Austen", Gender.FEMALE],
      "Hamlet": ["William Shakespeare", Gender.MALE],
      "Macbeth": ["William Shakespeare", Gender.MALE],
      "Lord of the Rings": ["J.R.R. Tolkien", Gender.MALE],
      "The Hobbit": ["J.R.R. Tolkien", Gender.MALE],
      "The Silmarillion": ["J.R.R. Tolkien", Gender.MALE],
      "The Great Gatsby": ["F. Scott Fitzgerald", Gender.MALE],
      "To Kill a Mockingbird": ["Harper Lee", Gender.FEMALE],
      "1984": ["George Orwell", Gender.MALE],
      "Animal Farm": ["George Orwell", Gender.MALE],
      "Oliver Twist": ["Charles Dickens", Gender.MALE],
      "A Tale of Two Cities": ["Charles Dickens", Gender.MALE],
      "Great Expectations": ["Charles Dickens", Gender.MALE],
    };

    for (const title in bookData) {
      const [author, gender] = bookData[title];
      this.books.push(new Book(title, author, gender, true));
      this.books.sort(Book.compare);
    }
  }

  public addBookToLibrary(title: string, author: string, gender: Gender, displayed: boolean): void {
    this.books.push(new Book(title, author, gender, displayed));
    this.books.sort(Book.compare);
  }

  public getBooksFor(author: string): Book[] {
    return this.books.filter(book => book.author === author);
  }

  public getFemaleAuthoredBooks(): Book[] {
    return this.books.filter(book => book.gender === Gender.FEMALE);
  }

  public getMaleAuthoredBooks(): Book[] {
    return this.books.filter(book => book.gender === Gender.MALE);
  }

  public getBooks(): Book[] {
    return this.books;
  }
}