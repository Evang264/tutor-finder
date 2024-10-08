"use client";
import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  doc,
  DocumentSnapshot,
  query,
  where,
  deleteDoc
} from "firebase/firestore";

export interface IUser {
  [key: string]: string | string[];
  name: string;
  bio: string;
  pfp: string;
  school: string;
  calendly: string;
  posts: string[];
}

export interface IPost {
  userId: string;
  title: string;
  description: string;
}

export async function createUser(
  userId: string,
  name: string,
  bio: string,
  school: string,
  calendly: string,
  pfp: string = ""
) {
  const docRef = await doc(collection(db, "users"), userId);
  await setDoc(docRef, {
    name: name,
    pfp: pfp,
    bio: bio,
    school: school,
    calendly: calendly,
    posts: [],
  });
}

export async function updateUser(userId: string, updateData: object) {
  await updateDoc(doc(db, "users", userId), updateData);
}

export async function fetchUser(userId: string): Promise<IUser | null> {
  const docSnapshot: DocumentSnapshot = await getDoc(
    doc(collection(db, "users"), userId)
  );

  if (!docSnapshot.exists())
    return null;

  return docSnapshot.data() as IUser;
}

export async function createPost(userId: string, title: string, description: string): Promise<string> {
  const docRef = await addDoc(collection(db, "posts"), {
    userId: userId,
    title: title,
    description: description
  });
  let posts = (await fetchUser(userId))!.posts;
  posts.push(docRef.id);
  updateUser(userId, { posts: posts });
  return docRef.id;
}

export async function updatePost(postId: string, updateData: object) {
  await updateDoc(doc(db, "posts", postId), updateData);
}

export async function fetchAllPosts() {
  const snapshots = await getDocs(collection(db, "posts"));
  return snapshots.docs.map(doc => doc.data()) as IPost[];
}

export async function fetchUserPosts(userId: string) {
  const querySnapshot = await getDocs(
    query(collection(db, "posts"), where("userId", "==", userId))
  );
  return querySnapshot.docs.map((doc) => doc.data()) as IPost[];
}

export async function deletePost(userId: string, postId: string) {
  await deleteDoc(doc(db, "posts", postId));
  // delete it from user's list of posts
  let posts = (await fetchUser(userId))!.posts;
  posts = posts.filter((id) => id !== postId);
  await updateUser(userId, { posts: posts });
}

export async function fetchPost(postId: string): Promise<IPost> {
  const docSnapshot: DocumentSnapshot = await getDoc(doc(db, "posts", postId));
  if (!docSnapshot.exists())
    throw Error(`The requested post (ID: ${postId}) does not exist.`);

  return docSnapshot.data() as IPost;
}