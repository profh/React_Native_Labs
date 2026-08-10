Lab 9
	
Rename from Lab 8 to Lab 9: EmojiHunter

- Multiple errors with peer-dependencies
		npm install expo-camera@15.0.16 @tensorflow/tfjs @tensorflow/tfjs-react-native @tensorflow-models/mobilenet react-native-reanimated expo-image-manipulator --legacy-peer-deps

		add expo-image-manipulator --legacy-peer-deps
			npm install expo-image-manipulator --legacy-peer-deps

			npm install expo-image-manipulator
			npm error code ERESOLVE
			npm error ERESOLVE could not resolve
			npm error
			npm error While resolving: @tensorflow/tfjs-react-native@1.0.0
			npm error Found: expo-camera@15.0.16
			npm error node_modules/expo-camera
			npm error   expo-camera@"^15.0.16" from the root project
			npm error
			npm error Could not resolve dependency:
			npm error peer expo-camera@"^13.4.4" from @tensorflow/tfjs-react-native@1.0.0
			npm error node_modules/@tensorflow/tfjs-react-native
			npm error   @tensorflow/tfjs-react-native@"^1.0.0" from the root project
			npm error
			npm error Conflicting peer dependency: expo-camera@13.9.0
			npm error node_modules/expo-camera
			npm error   peer expo-camera@"^13.4.4" from @tensorflow/tfjs-react-native@1.0.0
			npm error   node_modules/@tensorflow/tfjs-react-native
			npm error     @tensorflow/tfjs-react-native@"^1.0.0" from the root project
			npm error

			npm error Fix the upstream dependency conflict, or retry this command with --force or --legacy-peer-deps to accept an incorrect (and potentially broken) dependency resolution.

		npm install expo-camera@15.0.16 @tensorflow/tfjs @tensorflow/tfjs-react-native @tensorflow-models/mobilenet react-native-reanimated@4.5.1 expo-image-manipulator expo-gl @react-native-async-storage/async-storage@2.2.0 react-native-fs react-native-worklets --legacy-peer-deps

		"dependencies": {
				"@react-native-async-storage/async-storage": "^2.2.0",
				"@tensorflow-models/mobilenet": "^2.1.1",
				"@tensorflow/tfjs": "^4.22.0",
				"@tensorflow/tfjs-react-native": "^1.0.0",
				"expo": "~57.0.10",
				"expo-camera": "^15.0.16",
				"expo-file-system": "^57.0.2",
				"expo-gl": "^57.0.2",
				"expo-image-manipulator": "^57.0.9",
				"expo-status-bar": "~57.0.1",
				"react": "19.2.3",
				"react-native": "0.86.2",
				"react-native-fs": "^2.20.0",
				"react-native-reanimated": "^4.5.1",
				"react-native-worklets": "^0.11.3"
			}

CustomCamera section
	2. "Case on whether showNext is true OR... "

File not found error with...
    const response = await fetch(manipulatedImage.uri);
    const imageData = await response.arrayBuffer();

Refactored CustomCamera.imageToTensor to use expo file system...
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




