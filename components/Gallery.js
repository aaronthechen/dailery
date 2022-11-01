import Drawing from "./Drawing"
import { auth, firestore } from "../firebase/firebase"
import { useState, useEffect } from "react"
import { collection, query, onSnapshot, orderBy } from "firebase/firestore"

export default function Gallery() {
  const [pending, setPending] = useState(true)
  const [drawings, setDrawings] = useState([])

  useEffect(() => {
    const q = query(collection(firestore, 'images'), orderBy('timestamp', 'desc'))

    onSnapshot(q, (querySnapshot) => {
      setDrawings(querySnapshot.docs.map(doc => ({
        image: doc.data().image,
        artist: doc.data().artist,
        date: doc.data().date,
        title: doc.data().title,
        id: doc.id,
        isown: (auth.currentUser !== null && doc.id === auth.currentUser.uid)
      })))
      setPending(false)
    })
  }, [])

  if (pending) {
    return <div className="flex w-full h-screen justify-center items-center">
      LOADING...
    </div>
  }

  return (

    <div className="max-w-screen-2xl grow grid md:grid-cols-2 xl:grid-cols-4 lg:grid-cols-3 gap-10">
      {drawings.map(drawing => (
        <Drawing
          key={drawing.id}
          image={drawing.image}
          title={drawing.title}
          artist={drawing.artist}
          date={drawing.date}
          isown={drawing.isown}
        />
      ))}
    </div>
  )
}
