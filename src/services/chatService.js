import { db } from "./firebase";
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp 
} from "firebase/firestore";

/**
 * Saves a chat session to Firestore.
 * @param {string} userId 
 * @param {Array} messages 
 * @param {string} chatId - Optional, will create new if missing
 */
export async function saveChatSession(userId, messages, chatId = null) {
  if (!userId || !messages.length) return null;

  const id = chatId || crypto.randomUUID();
  const chatRef = doc(db, "chats", id);
  try {
    await setDoc(chatRef, {
      id,
      userId,
      messages,
      title: messages[0].text.substring(0, 40) + "...",
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return id;
  } catch (error) {
    console.error("Error saving chat:", error);
    return null;
  }
}

/**
 * Lists all chat sessions for a user.
 */
export async function listUserChats(userId) {
  if (!userId) return [];
  const q = query(
    collection(db, "chats"),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

/**
 * Loads a specific chat session.
 */
export async function loadChatSession(chatId) {
  if (!chatId) return null;
  const docSnap = await getDoc(doc(db, "chats", chatId));
  return docSnap.exists() ? docSnap.data().messages : null;
}
