import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { auth } from '../services/firebase';

let JitsiMeet = null;
let JitsiMeetView = null;
let jitsiInitializationError = null;

if (Platform.OS !== 'web') {
  try {
    const jitsi = require('react-native-jitsi-meet');
    JitsiMeet = jitsi.default || jitsi;
    JitsiMeetView = jitsi.JitsiMeetView;
  } catch (e) {
    console.log('Jitsi not available on this platform:', e.message);
    jitsiInitializationError = e.message;
  }
}

export default function VideoCallScreen({ route, navigation }) {
  const { appointmentId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [error, setError] = useState(null);

  // Validate appointment ID
  useEffect(() => {
    if (!appointmentId) {
      setError('Invalid appointment ID. Unable to start video call.');
    }
  }, [appointmentId]);

  const handleStartCall = () => {
    if (!appointmentId) {
      Alert.alert('Error', 'Invalid appointment. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (Platform.OS === 'web') {
        // Open Jitsi in browser for web
        const jitsiUrl = `https://meet.jit.si/${appointmentId}`;
        window.open(jitsiUrl, '_blank');
        setCallActive(true);
      } else if (JitsiMeet && JitsiMeetView) {
        // Native platform with Jitsi available
        const options = {
          room: appointmentId,
          userInfo: {
            displayName: auth.currentUser?.displayName || 'User',
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
          },
          featureFlags: {
            'chat.enabled': true,
            'recording.enabled': false,
            'raise-hand.enabled': true,
          },
        };

        JitsiMeet.call(options);
        setCallActive(true);
      } else {
        // Jitsi not available - show appropriate error
        const isWeb = Platform.OS === 'web';
        const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

        let errorMsg = 'Video call is not available on this platform.';
        if (isMobile) {
          errorMsg = jitsiInitializationError 
            ? `Video call library error: ${jitsiInitializationError}`
            : 'Video call library not installed. Please reinstall the app.';
        }

        setError(errorMsg);
        Alert.alert('Video Call Unavailable', errorMsg);
      }
    } catch (err) {
      console.error('Error starting video call:', err);
      setError('Failed to start video call. Please try again.');
      Alert.alert('Error', 'Failed to start video call. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEndCall = () => {
    try {
      if (Platform.OS !== 'web' && JitsiMeet) {
        JitsiMeet.endCall();
      }
      setCallActive(false);
      navigation.goBack();
    } catch (err) {
      console.error('Error ending call:', err);
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {callActive && Platform.OS !== 'web' && JitsiMeetView ? (
        <JitsiMeetView
          onConferenceTerminated={() => {
            setCallActive(false);
            navigation.goBack();
          }}
          onConferenceJoined={() => {
            console.log('Conference joined');
          }}
          style={styles.jitsiView}
        />
      ) : (
        <View style={styles.content}>
          <Text style={styles.title}>Video Call</Text>
          <Text style={styles.subtitle}>Appointment ID: {appointmentId || 'N/A'}</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : (
            <>
              <TouchableOpacity
                style={[styles.startButton, error && styles.buttonDisabled]}
                onPress={handleStartCall}
                disabled={!!error || loading}
              >
                <Text style={styles.buttonText}>
                  {error ? 'Unavailable' : 'Start Call'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {callActive && (
        <TouchableOpacity
          style={styles.endCallButton}
          onPress={handleEndCall}
        >
          <Text style={styles.endCallText}>End Call</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  jitsiView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 30,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#10b981',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  cancelButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  endCallButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    minWidth: 200,
    alignItems: 'center',
  },
  endCallText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
