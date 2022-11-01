import Gallery from "../components/Gallery"
import Canvas from "../components/Canvas"

import { onValue, ref } from "firebase/database"
import { auth, db } from "../firebase/firebase"
import { useState, useEffect } from "react"

export default function Home() {
  const [pending, setPending] = useState(true)
  const [drawing, setDrawing] = useState(false)

  useEffect(() => {
    auth.onAuthStateChanged(() => {
      if(auth.currentUser) {
        const dateRef = ref(db, 'users/' + auth.currentUser.uid)
        onValue(dateRef, (snapshot) => {
          if(!snapshot.exists() || Date.now() - snapshot.val().time > 8640) {
            setDrawing(true)
          }
        })
      }
      setPending(false)
    })
  }, [])

  if(pending) {
    return <div className="flex w-full h-screen justify-center items-center absolute left-0 top-0 z-50">
      LOADING...
    </div>
  } 
  return (
    <div className="flex w-full px-4 py-10 justify-center">
      {(!auth.currentUser || !drawing) && <Gallery/>}
      {(auth.currentUser && drawing) && <Canvas setDrawing={setDrawing}/>}
    </div>
  )
}
