import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Camera } from 'expo-camera';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function MeetingScreen() {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const route = useRoute();
    const navigation = useNavigation();
    const { roomName, userName } = route.params as { roomName: string; userName: string };

    useEffect(() => {
        (async () => {
            const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
            const { status: audioStatus } = await Camera.requestMicrophonePermissionsAsync();
            setHasPermission(cameraStatus === 'granted' && audioStatus === 'granted');
        })();
    }, []);

    if (hasPermission === null) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#667eea" />
                <Text>Requesting permissions...</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.center}>
                <Text>No access to camera or microphone</Text>
            </View>
        );
    }

    // Construct Jitsi URL with config params
    // disabling deep links to avoid app switching
    // disabling welcome page
    const jitsiUrl = `https://meet.jit.si/${roomName}#userInfo.displayName="${encodeURIComponent(
        userName
    )}"&config.startWithAudioMuted=false&config.startWithVideoMuted=false`;

    return (
        <View style={styles.container}>
            <WebView
                source={{ uri: jitsiUrl }}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                // Important for Android permissions in WebView
                onPermissionRequest={(event) => {
                    event.grant(event.resources);
                }}
                userAgent="Mozilla/5.0 (Linux; Android 10; Android SDK built for x86) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    Alert.alert('Error', 'Failed to load meeting: ' + nativeEvent.description);
                    navigation.goBack();
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    webview: {
        flex: 1,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
