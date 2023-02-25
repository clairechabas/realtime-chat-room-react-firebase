import functions from 'firebase-functions'
import Filter from 'bad-words'

import admin from 'firebase-admin'
admin.initializeApp()

const db = admin.firestore()

exports.detectEvilUsers = functions.firestore
  .document('messages/{msgId}')
  .onCreate(async (doc, ctx) => {
    const filter = new Filter()
    const { text, uid } = doc.data()

    if (filter.isProfane(text)) {
      const cleaned = filter.clean(text)
      await doc.ref.update({
        text: `🤐 I got banned for life for saying: ${cleaned}`,
      })

      await db.collection('banned').doc(uid).set({})
    }
  })
