import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { getDatabase, ref, onValue, push } from "firebase/database";
import { useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useNavigation } from "expo-router";

const MessageScreen = () => {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { user } = useUser();
  const navigation = useNavigation();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  const flatListRef = useRef<FlatList>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Chat",
      headerStyle: { backgroundColor: "#0f172a" },
      headerTitleStyle: { color: "#fff", fontWeight: "600" },
      headerTintColor: "#fff",
    });
  }, [navigation]);

  useEffect(() => {
    if (!chatId) return;
    const db = getDatabase();
    const chatRef = ref(db, `Chats/${chatId}`);

    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const messageList = Object.entries(data)
        .map(([id, value]: any) => ({ id, ...value }))
        .sort((a, b) => a.timestamp - b.timestamp);

      setMessages(messageList);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const db = getDatabase();
    const chatRef = ref(db, `Chats/${chatId}`);

    const newMessage = {
      text: text.trim(),
      senderId: user?.id,
      timestamp: Date.now(),
    };

    await push(chatRef, newMessage);
    setText("");
  };

  const renderMessage = ({ item }: any) => {
    const isCurrentUser = item.senderId === user?.id;
    return (
      <View
        style={[
          styles.messageBubble,
          isCurrentUser ? styles.sentBubble : styles.receivedBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: isCurrentUser ? "#fff" : "#111827" },
          ]}
        >
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Type a message..."
          value={text}
          onChangeText={setText}
          style={styles.input}
          placeholderTextColor="#94a3b8"
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default MessageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2EFE7", // Light Beige (same as ChatList)
  },
  chatContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  messageBubble: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 20,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  sentBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#006A71", // Dark Teal
  },
  receivedBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#9ACBD0", // Soft Blue
  },
  messageText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF", // White text for both sent and received bubbles
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#FFFFFF", // White
  },
  input: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    color: "#111827", // Dark input text
  },
  sendButton: {
    backgroundColor: "#006A71", // Dark Teal
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 8,
  },
  sendText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
