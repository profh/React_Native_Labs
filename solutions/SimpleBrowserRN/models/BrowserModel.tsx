import { useState } from "react";

function BrowserModel() {
  const [url, setUrl] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  return {
    url,
    setUrl,
    inputUrl,
    setInputUrl,
    canGoBack,
    setCanGoBack,
    canGoForward,
    setCanGoForward,
  };
}

export default BrowserModel;