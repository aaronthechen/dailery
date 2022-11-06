import Link from "next/link"
import { useState, useEffect } from "react"
import { auth } from "../firebase/firebase"
import { signOut } from "firebase/auth"

export default function Navbar() {

  const [pending, setPending] = useState(true)

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setPending(false)
    })
  }, [])

  if(pending) {
    return
  } 

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <nav className="p-4 w-full border-b border-black z-40 flex justify-center">
      <div className="flex justify-between items-center max-w-screen-2xl grow">
        <Link href="https://github.com/aaronthechen/dailery/" className="flex w-20 hover:font-bold">
          ABOUT
        </Link>
        <Link href="/" className="font-bold font-['Playfair_Display'] text-4xl">
          DAILERY
        </Link>
        {!auth.currentUser &&
          <Link href="/login" className="flex justify-end w-20 hover:font-bold">
            LOGIN
          </Link>
        }
        {auth.currentUser &&
          <Link href="/" onClick={logout} className="flex justify-end w-20 hover:font-bold">
            LOGOUT
          </Link>
        }
      </div>
    </nav>
  )
}
