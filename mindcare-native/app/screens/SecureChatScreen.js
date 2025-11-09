import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { auth, db } from '../services/firebase';
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, doc, setDoc } from 'firebase/firestore';

export default function SecureChatScreen({ route, navigation }) {
  const doctorId = route?.params?.doctorId || route?.params?.doctor?.id || null;
  const patientId = route?.params?.patientId || auth?.currentUser?.uid || null;

  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);

  const conversationId = useMemo(() => {
    if (!doctorId || !patientId) return null;
    // Stable conversation id for one-to-one chat
    return [String(doctorId), String(patientId)].sort().join('_');
  }, [doctorId, patientId]);

  useEffect(() => {
    if (!db || !conversationId) return;

    const messagesRef = collection(db, 'chats', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(data);
    });

    return unsub;
  }, [db, conversationId]);

  const sendMessage = async () => {
    const text = messageText.trim();
    if (!text || !db || !conversationId) return;

    const senderId = auth?.currentUser?.uid;
    if (!senderId) return;

    const receiverId = senderId === String(patientId) ? String(doctorId) : String(patientId);

    try {
      // Ensure chat meta exists with participants for security rules
      const chatDocRef = doc(db, 'chats', conversationId);
      await setDoc(chatDocRef, { doctorId: String(doctorId), patientId: String(patientId), updatedAt: serverTimestamp() }, { merge: true });

      const messagesRef = collection(db, 'chats', conversationId, 'messages');
      await addDoc(messagesRef, {
        senderId,
        receiverId,
        text,
        doctorId: String(doctorId),
        patientId: String(patientId),
        timestamp: serverTimestamp(),
      });
      setMessageText('');
    } catch (e) {
      // Intentionally minimal error handling here; could add UI alert
      console.error('Failed to send message', e);
    }
  };

  const renderItem = ({ item }) => {
    const isMine = item.senderId === auth?.currentUser?.uid;
    return (
      <View style={[styles.messageRow, isMine ? styles.mine : styles.theirs]}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message"
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  listContent: { padding: 12, paddingBottom: 8 },
  messageRow: {
    maxWidth: '80%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e7eb',
  },
  messageText: {
    color: '#111827',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  sendText: { color: '#fff', fontWeight: '700' },
});
