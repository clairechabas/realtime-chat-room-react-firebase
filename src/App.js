import './App.css'

import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

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
      <header></header>

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

function signOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {}

export default App
