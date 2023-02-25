import { useEffect, useState } from 'react'

import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import 'firebase/compat/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { collection, getDocs } from 'firebase/firestore'

firebase.initializeApp({
  apiKey: 'AIzaSyBlru3P7s47TlBOoMYys-EHPK1CIlRDEpg',
  authDomain: 'realtime-chat-room-with-react.firebaseapp.com',
  projectId: 'realtime-chat-room-with-react',
  storageBucket: 'realtime-chat-room-with-react.appspot.com',
  messagingSenderId: '789919013928',
  appId: '1:789919013928:web:bfdf26349a90b5981ee91d',
})

const auth = firebase.auth()
const firestore = firebase.firestore()

function App() {
  /* `user` provided by `useAuthState` have 2 possible values:
   *  => signed in: `user` is an object
   *  => signed out: `user` is null
   */
  const [user] = useAuthState(auth)

  return (
    <div className="App">
      <header>
        <h1>🐱🔥 Chatty</h1>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  )
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)
  }

  return <button onClick={signInWithGoogle}>Sign in with Google</button>
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const [messages, setMessages] = useState([])
  const messagesRef = firestore.collection('messages')

  useEffect(() => {
    const unsubscribe = messagesRef.onSnapshot((querySnapshot) => {
      const messagesArray = []
      querySnapshot.forEach((doc) => {
        messagesArray.push({ ...doc.data(), id: doc.id })
      })

      setMessages(messagesArray)
    })

    return () => {
      unsubscribe()
    }
  }, [messagesRef])
  console.log('messages', messages)

  return (
    <>
      <ul>
        {messages &&
          messages.map((message) => {
            return <ChatMessage key={message.id} message={message} />
          })}
      </ul>
    </>
  )
}

function ChatMessage({ message }) {
  const { text, photoUrl, uid } = message
  console.log('uid', uid)
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'

  return (
    <li className={`message ${messageClass}`}>
      <img src={photoUrl} alt={`${auth.currentUser.displayName}'s face`} />
      <p>{text}</p>
    </li>
  )
}

export default App
