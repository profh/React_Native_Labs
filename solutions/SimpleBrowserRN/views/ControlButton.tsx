import { TouchableOpacity, Text } from "react-native";
import styles from "../styles";
import { ControlButtonProps } from "../types";

function ControlButton({ show = undefined, fn, txt }: ControlButtonProps) {
  return (
    <TouchableOpacity onPress={fn} disabled={show === undefined ? false : !show}>
      <Text style={styles.searchButton}>{txt}</Text>
    </TouchableOpacity>
  )
}

export default ControlButton;