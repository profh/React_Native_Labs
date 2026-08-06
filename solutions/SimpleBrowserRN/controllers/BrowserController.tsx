import React, { useRef } from "react";
import BrowserView from "../views/BrowserView";
import WebView from "react-native-webview";
import BrowserModel from "../models/BrowserModel";
import { Alert, Share } from 'react-native';

function BrowserController() {
  const {
    url,
    setUrl,
    inputUrl,
    setInputUrl,
    canGoBack,
    setCanGoBack,
    canGoForward,
    setCanGoForward,
  } = BrowserModel();

  const webViewRef = useRef<WebView>(null);
  const goBack = () => webViewRef.current?.goBack();
  const goForward = () => webViewRef.current?.goForward();
  const reload = () => webViewRef.current?.reload();
  const stop = () => webViewRef.current?.stopLoading();
  const share = async () => {
    if (url) {
      // Implement sharing functionality here
      try {
        const result = await Share.share({
          message: url,
        });
        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            // shared with activity type of result.activityType
          } else {
            // shared
          }
        } else if (result.action === Share.dismissedAction) {
          // dismissed
        }
      } catch (error: any) {
        Alert.alert(error.message);
      }
    }
  }

  const loadUrl = () => {
    let formattedUrl = inputUrl;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }
    setUrl(formattedUrl);
  };

  const handleNavStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
  };

  return (
    <BrowserView
      url={url}
      inputUrl={inputUrl}
      setInputUrl={setInputUrl}
      canGoBack={canGoBack}
      canGoForward={canGoForward}
      loadUrl={loadUrl}
      WebViewRef={webViewRef}
      goBack={goBack}
      goForward={goForward}
      reload={reload}
      stop={stop}
      share={share}
      handleNavStateChange={handleNavStateChange}
    />
  )
}

export default BrowserController