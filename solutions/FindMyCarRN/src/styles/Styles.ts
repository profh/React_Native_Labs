import { Dimensions, StyleSheet } from 'react-native';

export const colors = {
  primary: '#007AFF',
  secondary: '#FF9500',
  background: '#F2F2F2',
  text: '#333',
  buttonText: '#FFF',
  white: '#FFF',
  danger: '#FF3B30',
};

export const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: 16,
    width: '75%',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
  },
  successButton: {
    backgroundColor: colors.secondary,
  },
  buttonIcon: {
    marginRight: 8,
    width: 24,
    height: 24,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    marginTop: 5,
  },
  buttonContainer: {
    width: '100%',
    marginVertical: 10,
  },
  spacer: {
    flex: 1,
  },
});

export const mapStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerIconContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 5,
    elevation: 5,
  },
  markerLabel: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
  },
  markerLabelText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
  },
});