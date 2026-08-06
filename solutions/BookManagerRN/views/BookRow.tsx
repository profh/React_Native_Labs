import { Pressable, Text } from "react-native"
import { Book } from "../models/Book"
import { appStyles } from "../styles"

type BookRowProps = {
  item: Book;
  onPress: () => void;
};

const BookRow: React.FC<BookRowProps> = (props: BookRowProps) => {

  const { item } = props;

  return (
    <Pressable onPress={props.onPress}>
      <Text style={appStyles.bookTitle}>{item.title}</Text>
    </Pressable>
  );
}

export default BookRow;