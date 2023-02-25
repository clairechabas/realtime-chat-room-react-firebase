import { useEffect, useMemo, useRef, useState } from 'react'

import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import 'firebase/compat/auth'

import { useAuthState } from 'react-firebase-hooks/auth'

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
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
  const [formValue, setFormValue] = useState('')
  const theEnd = useRef()

  /**
   * ⚠️ We need to memoize `messagesRef` to avoid creating a new object
   * at each component re-render since it's used as a useEffect dependency
   * which would end up in an infinite re-render loop.
   */
  const messagesRef = useMemo(() => firestore.collection('messages'), [])

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
    /**
     * ⚠️ Adding `messagesRef` as a useEffect() dependency
     * would cause an infinite re-render loop if `messagesRef`
     * was reintiated every time the component re-rendered.
     * To avoid this we're using useMemo to memoize `messagesRef`.
     */
  }, [messagesRef])

  const sendMessage = async (e) => {
    e.preventDefault()

    const { uid, photoUrl } = auth.currentUser

    // Creating a new document in firestore
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoUrl,
    })

    // Reseting our form value
    setFormValue('')

    // Scrolling to the last message when a new message comes in
    theEnd.current.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <ul>
        {messages &&
          messages.map((message) => {
            return <ChatMessage key={message.id} message={message} />
          })}
      </ul>

      <div ref={theEnd}></div>

      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit">🕊️</button>
      </form>
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
