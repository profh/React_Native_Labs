
import WebView from "react-native-webview";

export type SearchViewProps = {
  inputUrl: string,
  setInputUrl: React.Dispatch<React.SetStateAction<string>>,
  loadUrl: () => void,
}

export type ControlButtonProps = {
  show?: boolean | undefined,
  fn: () => void,
  txt: string
}

export type ControlBarProps = {
  canGoBack: boolean,
  canGoForward: boolean,
  goBack: () => void,
  goForward: () => void,
  reload: () => void,
  stop: () => void,
  share: () => void,
}


export type BrowserViewProps = {
    url: string,
    inputUrl: string,
    setInputUrl: React.Dispatch<React.SetStateAction<string>>,
    canGoBack: boolean,
    canGoForward: boolean,
    loadUrl: () => void,
    WebViewRef: React.RefObject<WebView>,
    goBack: () => void,
    goForward: () => void,
    reload: () => void,
    stop: () => void,
    share: () => void,
    handleNavStateChange: (navState: any) => void;
}