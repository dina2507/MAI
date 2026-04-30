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
 */
export async function saveChatSession(userId, messages) {
  if (!userId || !messages.length) return;

  const chatRef = doc(db, "chats", userId);
  try {
    await setDoc(chatRef, {
      userId,
      messages,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error("Error saving chat:", error);
  }
}

/**
 * Loads the last chat session for a user.
 * @param {string} userId 
 * @returns {Array|null}
 */
export async function loadLastChatSession(userId) {
  if (!userId) return null;

  const chatRef = doc(db, "chats", userId);
  try {
    const docSnap = await getDoc(chatRef);
    if (docSnap.exists()) {
      return docSnap.data().messages;
    }
  } catch (error) {
    console.error("Error loading chat:", error);
  }
  return null;
}
