import { StyleSheet } from 'react-native';

const appStyles = StyleSheet.create({
  appContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  temperature: {
    fontSize: 48,
    textAlign: 'center',
  },
  info: {
    fontSize: 36,
    textAlign: 'center',
  },
  tempInput: {
    width: 100,
    height: 50,
    marginTop: 20,
    fontSize: 24,
  },
  inputLabel: {
    fontSize: 24,
  },
  buttonContainer: {
    backgroundColor: 'blue',
    padding: 30,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
  },
  switch: {
    marginTop: 20,
    flexDirection: 'row',
  },
  infoIcon: { 
    position: 'absolute', 
    top: -20,
    right: 50 
  }
});

export default appStyles;