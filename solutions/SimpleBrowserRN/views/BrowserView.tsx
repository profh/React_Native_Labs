import React from "react";
import { WebView } from "react-native-webview";
import { BrowserViewProps } from "../types";
import { View } from "react-native";
import SearchView from "./SearchView";
import ControlBar from "./ControlBar";
import styles from "../styles";
import { SafeAreaProvider } from "react-native-safe-area-context";

function BrowserView({url, inputUrl, setInputUrl, canGoBack, canGoForward, loadUrl, WebViewRef, goBack, goForward, reload, stop, share, handleNavStateChange}: BrowserViewProps): React.JSX.Element {
    return (
        <SafeAreaProvider>
            <SearchView
                inputUrl={inputUrl}
                setInputUrl={setInputUrl}
                loadUrl={loadUrl}
            />
            <View style={styles.webViewContainer}>
                <WebView
                    ref={WebViewRef}
                    source={{uri: url}}
                    onNavigationStateChange={handleNavStateChange}
                />
            </View>
            <ControlBar
                canGoBack={canGoBack}
                canGoForward={canGoForward}
                goBack={goBack}
                goForward={goForward}
                reload={reload}
                stop={stop}
                share={share}
            />
        </SafeAreaProvider>
    )
}

export default BrowserView;