import React, { useEffect, useRef, useState } from "react";
import { Text, View, StyleSheet, Button, Dimensions, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import * as mobilenet from "@tensorflow-models/mobilenet";
import jpeg from "jpeg-js";
import { EmojiSearchStatus } from "../models/Types";
import { File } from "expo-file-system";

type CustomCameraProps = {
  emojiNames: string[];
  onEmojiFound: (status: EmojiSearchStatus) => void;
  setTensorLoaded: (loaded: boolean) => void;
};

export const CustomCamera: React.FC<CustomCameraProps> = ({ emojiNames, onEmojiFound, setTensorLoaded }) => {

  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEmojiFound, setIsEmojiFound] = useState(false);

  const emojis = emojiNames;

  useEffect(() => {
    if (!permission || !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await mobilenet.load();
        setModel(loadedModel);
        setIsModelLoaded(true);
        setTensorLoaded(true);
      } catch (error) {
        Alert.alert(`Error: ${error}`);
      }
    };
    loadModel();
  }, []);

  const imageToTensor = async (imageUri: string) => {
    // Resize the image to fit the input shape expected by the Mobile Net Model

    const imageManipulatorContext = ImageManipulator.manipulate(imageUri);

    const manipulatedImageAsync = await imageManipulatorContext.resize({ width: 224, height: 224 });
    const renderedImage = await manipulatedImageAsync.renderAsync();

    const result = await renderedImage.saveAsync({
      format: SaveFormat.JPEG,
      base64: true,
    });

    // Create a file of the modified image and then convert the image to binary
    const arrayBuffer = await new File(result.uri).arrayBuffer();

    // Decode the JPEG image to a Uint8Array with jpeg-js. Decoding with jpeg-js automatically includes the alpha/transparency channel
    const { width, height, data } = jpeg.decode(arrayBuffer, { useTArray: true });

    // Remove alpha channel from the image data since MobileNet is not expected it
    const rgbArray = new Uint8Array(width * height * 3);
    let rgbIndex = 0;
    for (let i = 0; i < data.length; i += 4) {
      rgbArray[rgbIndex++] = data[i];     // R
      rgbArray[rgbIndex++] = data[i + 1]; // G
      rgbArray[rgbIndex++] = data[i + 2]; // B
    }

    // Convert the pixel data to a TensorFlow tensor
    const imageTensor = tf.tensor3d(rgbArray, [height, width, 3]);

    return imageTensor;
  };

  const classifyImage = async (imageUri: string) => {
    // Return early if model is not loaded, already processing, or we have already found the emoji
    if (!isModelLoaded || isProcessing || isEmojiFound) {
      return;
    }

    setIsProcessing(true); // Update the isProcessing constant to denote that the model is classifying something

    try {
      const imageTensor = await imageToTensor(imageUri); // call the imageToTensor function asynchronously
      const predictions = await model!.classify(imageTensor as any); // Classifies the imageTensor above using the MobileNet model

      // Loops through each prediction and checks if it matches the emoji
      predictions.forEach((prediction) => {
        const isEmojiMatch = emojis.some((emoji) => prediction.className.toLowerCase().includes(emoji));
        if (isEmojiMatch && prediction.probability > 0.2) {
          setIsEmojiFound(true); // Update emojiFound here
          onEmojiFound(EmojiSearchStatus.Found); // Call onEmojiFound and pass in the Found status; this will tell the GameViewModel to that the emoji has been found
        }
      });
      console.log("Predictions:", predictions); // Leave this log statement in as it will print out what the ML model thinks it is looking at
    } catch (error) {
      console.error("Error classifying image:", error);
    } finally {
      setIsProcessing(false); // Reset the isProcessing constant
    }
  };

  const processFrame = async () => {
    if (cameraRef.current && isModelLoaded && !isEmojiFound) {
      const photo = await cameraRef.current.takePictureAsync({ skipProcessing: true });
      if (photo) {
        await classifyImage(photo.uri);
      }
    }
  };

  useEffect(() => {
    if (isModelLoaded && !isEmojiFound) {
      const intervalId = setInterval(processFrame, 1000);
      return () => clearInterval(intervalId);
    }
  }, [isModelLoaded, isEmojiFound]);


  return (
    <View style={cameraStyles.container}>
      <CameraView
        style={cameraStyles.camera}
        ref={cameraRef}
        facing="back" />
      {!isModelLoaded && (
        <View>
          <Text style={cameraStyles.loadingText}>Loading Image Classification Model...</Text>
        </View>
      )}
    </View>
  );
};

const cameraStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  loadingText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
});