import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";
import { useRouter } from "expo-router";
import { getDatabase, ref, onValue, get, remove } from "firebase/database";
import { useUser } from "@clerk/clerk-expo";

type ChatItem = {
  id: string;
  name: string;
  lastMessage: string;
  unreadCount: number;
  lastTimestamp: number;
};

const ChatList = () => {
  const { user } = useUser();
  const router = useRouter();
  const [role, setRole] = useState<"teacher" | "parent" | null>(null);
  const [chatList, setChatList] = useState<ChatItem[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const db = getDatabase();
    const fetchRole = async () => {
      const teacherSnap = await get(
        ref(db, `Users/Teachers/TeacherId/${user.id}`),
      );
      if (teacherSnap.exists()) return setRole("teacher");

      const parentSnap = await get(
        ref(db, `Users/Teachers/Class-A/Parents/${user.id}`),
      );
      if (parentSnap.exists()) return setRole("parent");

      setRole(null);
    };

    fetchRole();
  }, [user]);

  useEffect(() => {
    if (!user?.id || !role) return;
    const db = getDatabase();

    if (role === "teacher") {
      const parentRef = ref(db, `Users/Teachers/Class-A/Parents`);
      onValue(parentRef, async (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        const list: ChatItem[] = await Promise.all(
          Object.entries(data).map(async ([parentId, val]: any) => {
            const chatId = `${user.id}_${parentId}`;
            const messagesRef = ref(db, `Chats/${chatId}`);

            const lastMessage = await new Promise<ChatItem>((resolve) => {
              onValue(
                messagesRef,
                (msgSnap) => {
                  const messages = msgSnap.val();
                  if (messages) {
                    const sorted = Object.values(
                      messages as Record<
                        string,
                        { message: string; timestamp: number }
                      >,
                    ).sort((a, b) => b.timestamp - a.timestamp);

                    resolve({
                      id: parentId,
                      name: val.childName || "Unnamed",
                      lastMessage: sorted[0]?.message || "",
                      unreadCount: val.unreadCount || 0,
                      lastTimestamp: sorted[0]?.timestamp || 0,
                    });
                  } else {
                    resolve({
                      id: parentId,
                      name: val.childName || "Unnamed",
                      lastMessage: "",
                      unreadCount: 0,
                      lastTimestamp: 0,
                    });
                  }
                },
                { onlyOnce: true },
              );
            });

            return lastMessage;
          }),
        );

        const sortedByTime = list.sort(
          (a, b) => b.lastTimestamp - a.lastTimestamp,
        );
        setChatList(sortedByTime);
      });
    }

    if (role === "parent") {
      const parentRef = ref(db, `Users/Teachers/Class-A/Parents/${user.id}`);
      onValue(parentRef, async (snapshot) => {
        const val = snapshot.val();
        let assignedTeacherId = val?.assignedTeacher;

        if (!assignedTeacherId) {
          const teacherListSnap = await get(
            ref(db, `Users/Teachers/TeacherId`),
          );
          const teacherList = teacherListSnap.val();
          if (teacherList) assignedTeacherId = Object.keys(teacherList)[0];
        }

        if (!assignedTeacherId) return;

        const teacherSnap = await get(
          ref(db, `Users/Teachers/TeacherId/${assignedTeacherId}`),
        );
        const teacherData = teacherSnap.val();

        const chatId = `${assignedTeacherId}_${user.id}`;
        const messagesRef = ref(db, `Chats/${chatId}`);

        const msgSnap = await get(messagesRef);
        const messages = msgSnap.val();

        let lastMessageText = "";
        let lastTimestamp = 0;
        if (messages) {
          const sorted = Object.values(
            messages as Record<string, { message: string; timestamp: number }>,
          ).sort((a, b) => b.timestamp - a.timestamp);

          lastMessageText = sorted[0]?.message || "";
          lastTimestamp = sorted[0]?.timestamp || 0;
        }

        setChatList([
          {
            id: assignedTeacherId,
            name: teacherData?.firstName
              ? `${teacherData.firstName} ${teacherData.lastName}`
              : "Teacher",
            lastMessage: lastMessageText,
            unreadCount: 0,
            lastTimestamp,
          },
        ]);
      });
    }
  }, [role, user]);

  const handleOpenChat = (otherId: string) => {
    if (!user?.id || !role) return;
    const chatId =
      role === "teacher" ? `${user.id}_${otherId}` : `${otherId}_${user.id}`;

    router.push({
      pathname: "/(chat)/[chatId]" as any,
      params: { chatId },
    });
  };

  const handleArchive = async (chatId: string) => {
    Alert.alert("Archive Chat", "Are you sure you want to archive this chat?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Archive",
        style: "destructive",
        onPress: async () => {
          const db = getDatabase();
          await remove(ref(db, `Chats/${chatId}`));
          // Firebase listener will auto-update chatList
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleOpenChat(item.id)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        {item.lastMessage ? (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        ) : null}
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderHiddenItem = (data: { item: ChatItem }) => {
    const chatId =
      role === "teacher"
        ? `${user?.id}_${data.item.id}`
        : `${data.item.id}_${user?.id}`;
    return (
      <TouchableOpacity
        style={styles.rowBack}
        onPress={() => handleArchive(chatId)}
      >
        <Text style={styles.archiveText}>Archive</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {role === "teacher" ? "Chat with Parents" : "Chat with Teacher"}
      </Text>
      <SwipeListView
        data={chatList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-80}
        disableRightSwipe
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ChatList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#4338ca",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 14,
    color: "#6b7280",
  },
  unreadBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  unreadText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  rowBack: {
    alignItems: "center",
    backgroundColor: "#f87171",
    flex: 1,
    justifyContent: "center",
    paddingRight: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  archiveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
