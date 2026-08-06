import { View } from "react-native";
import ControlButton from "./ControlButton";
import styles from "../styles";
import { ControlBarProps } from "../types";

function ControlBar({ canGoBack, canGoForward, goBack, goForward, reload, stop, share }: ControlBarProps): React.JSX.Element {
  return (
    <View style={styles.controlBar}>
      <ControlButton show={canGoBack} fn={goBack} txt="<" />
      <ControlButton show={canGoForward} fn={goForward} txt=">" />
      <ControlButton fn={reload} txt="↻" />
      <ControlButton fn={stop} txt="x" />
      <ControlButton fn={share} txt="⤴" />
    </View>
  )
}
export default ControlBar