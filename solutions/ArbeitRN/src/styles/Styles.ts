import { StyleSheet, Platform } from 'react-native';

// Color palette
export const colors = {
  primary: '#007AFF',
  background: '#f5f5f5',
  white: '#ffffff',
  black: '#000000',
  textPrimary: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#e0e0e0',
  danger: '#FF3B30',
};

// Common styles used across the app
export const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  section: {
    backgroundColor: colors.white,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // Text styles
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.textTertiary,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  taskName: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  assignee: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dueDate: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  statusText: {
    fontSize: 17,
    color: colors.textPrimary,
  },
  dateText: {
    fontSize: 17,
    color: colors.textPrimary,
  },

  // Input styles
  input: {
    fontSize: 17,
    color: colors.textPrimary,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  // Button styles
  addButton: {
    marginRight: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '600',
    marginTop: -2,
  },
  cancelButton: {
    color: colors.white,
    fontSize: 17,
    marginLeft: 5,
    marginRight: 8,
  },
  saveButton: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
    marginRight: 16,
  },
  dateButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    marginHorizontal: 16,
    marginVertical: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },

  // Checkbox styles
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // TaskRowView specific styles
  taskRowContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  taskRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  taskRowLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskRowTextContainer: {
    flex: 1,
  },

  // Status row styles
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
});