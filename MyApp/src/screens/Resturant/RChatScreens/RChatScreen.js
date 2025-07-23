import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSocket } from '../../../context/SocketContext';
import { getChatMessages, sendMessage } from '../../../apis/chatAPI';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RChatScreen = ({ route, navigation }) => {
  const { chatId, participant } = route.params;
  const { socket, isConnected } = useSocket();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const getUserId = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUserId(user._id);
      }
    };
    getUserId();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: participant.name,
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: participant._id })}>
          <Image
            source={{ uri: participant.profilePicture || 'https://placehold.co/400' }}
            style={styles.headerImage}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, participant]);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getChatMessages(chatId);
      setMessages(data || []);
    } catch {
      Alert.alert('Error', 'Could not load messages');
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useFocusEffect(
    useCallback(() => {
      fetchMessages();
    }, [fetchMessages])
  );

  useEffect(() => {
    if (!socket || !currentUserId) return;

    socket.emit('joinChat', chatId);

    const handleReceiveMessage = (message) => {
      setMessages(prev => (prev.some(m => m._id === message._id) ? prev : [...prev, message]));
    };

    const handleTypingEvent = (data) => {
      if (data.chatId === chatId && data.senderId !== currentUserId) {
        setIsTyping(true);
        const timer = setTimeout(() => setIsTyping(false), 2000);
        return () => clearTimeout(timer);
      }
    };

    const handleMessageRead = (data) => {
      if (data.chatId === chatId) {
        setMessages(prev =>
          prev.map(msg =>
            msg.sender._id !== data.userId && !msg.readAt
              ? { ...msg, readAt: new Date().toISOString() }
              : msg
          )
        );
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('typing', handleTypingEvent);
    socket.on('messageRead', handleMessageRead);

    return () => {
      socket.emit('leaveChat', chatId);
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('typing', handleTypingEvent);
      socket.off('messageRead', handleMessageRead);
    };
  }, [socket, chatId, currentUserId]);

  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || !currentUserId) return;

    const tempId = Date.now().toString();
    const tempMessage = {
      _id: tempId,
      chat: chatId,
      content: newMessage,
      sender: { _id: currentUserId },
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    try {
      setSending(true);
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');

      if (isConnected && socket) {
        socket.emit('sendMessage', {
          chatId,
          content: newMessage,
          senderId: currentUserId,
        });
      } else {
        await sendMessage(chatId, newMessage);
      }
    } catch {
      setMessages(prev =>
        prev.map(msg => (msg._id === tempId ? { ...msg, status: 'failed' } : msg))
      );
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  }, [newMessage, chatId, socket, isConnected, currentUserId]);

  const handleTyping = useCallback(() => {
    if (newMessage.trim() && socket) {
      socket.emit('typing', { chatId, senderId: currentUserId });
    }
  }, [newMessage, chatId, socket, currentUserId]);

  useEffect(() => {
    if (messages.length > 0 && socket && currentUserId) {
      socket.emit('markAsRead', { chatId, userId: currentUserId });
    }
  }, [messages, chatId, socket, currentUserId]);

  const renderMessage = useCallback(({ item }) => {
    const isMe = item.sender._id === currentUserId;
    const messageTime = moment(item.createdAt).format('h:mm A');

    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
        {!isMe && (
          <Image
            source={{ uri: participant.profilePicture || 'https://placehold.co/400' }}
            style={styles.messageAvatar}
          />
        )}
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
          <Text style={isMe ? styles.myText : styles.theirText}>{item.content}</Text>
          <View style={styles.messageFooter}>
            <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.theirTimeText]}>
              {messageTime}
            </Text>
            {isMe && (
              <Ionicons
                name={
                  item.status === 'sending'
                    ? 'time-outline'
                    : item.status === 'failed'
                    ? 'warning-outline'
                    : 'checkmark-done-outline'
                }
                size={16}
                color={item.status === 'failed' ? '#ff3b30' : '#007AFF'}
                style={styles.statusIcon}
              />
            )}
          </View>
        </View>
      </View>
    );
  }, [participant, currentUserId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={[...messages].reverse()}
        renderItem={renderMessage}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.messagesContainer}
        inverted
        showsVerticalScrollIndicator={false}
      />

      {isTyping && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>{participant.name} is typing...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          onChange={handleTyping}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
          editable={!sending}
        />
        <TouchableOpacity
          style={[styles.sendButton, !newMessage.trim() && styles.disabledButton]}
          onPress={handleSend}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  headerImage: { width: 30, height: 30, borderRadius: 15, marginRight: 15 },
  messagesContainer: { paddingVertical: 15, paddingHorizontal: 10 },
  messageContainer: { flexDirection: 'row', marginVertical: 4, alignItems: 'flex-end' },
  myMessage: { justifyContent: 'flex-end' },
  theirMessage: { justifyContent: 'flex-start' },
  messageAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  myBubble: { backgroundColor: '#007AFF', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#e5e5ea', borderBottomLeftRadius: 4 },
  myText: { color: '#fff', fontSize: 16 },
  theirText: { color: '#000', fontSize: 16 },
  messageFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 4 },
  timeText: { fontSize: 12, marginRight: 4 },
  myTimeText: { color: 'rgba(255,255,255,0.7)' },
  theirTimeText: { color: 'rgba(0,0,0,0.5)' },
  statusIcon: { marginLeft: 4 },
  typingContainer: { padding: 8, backgroundColor: '#f0f0f0', borderRadius: 12, alignSelf: 'flex-start', marginLeft: 50, marginBottom: 8 },
  typingText: { fontSize: 14, color: '#666', fontStyle: 'italic' },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'center' },
  input: { flex: 1, minHeight: 40, maxHeight: 120, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#f0f0f0', borderRadius: 20, fontSize: 16, color: '#000' },
  sendButton: { marginLeft: 10, backgroundColor: '#007AFF', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  disabledButton: { backgroundColor: '#ccc' },
});

export default RChatScreen;
