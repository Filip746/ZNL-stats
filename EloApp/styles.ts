import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Main container styles
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Header styles
  headerContainer: {
    position: 'relative',
    paddingTop: 50,
    paddingBottom: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  headerGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#2E8B57',
  },
  headerGradientMiddle: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#32935D',
  },
  headerGradientBottom: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#3CB371',
  },
  headerContent: {
    position: 'relative',
    alignItems: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#e8f5e8',
    fontWeight: '600',
  },

  // Scroll styles
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },

  // Loading styles
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },

  // Error styles
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f44336',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2E8B57',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Block styles
  modernBlock: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  blockTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2E8B57',
    marginBottom: 8,
    textAlign: 'center',
  },
  blockDescription: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },

  // No data styles
  noDataText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
