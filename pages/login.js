import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";

import { auth } from "../firebase/firebase"

export default function login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [onLogin, setOnLogin] = useState(true)

  const router = useRouter()

  useEffect(() => {

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      console.log(currentUser)
      if (currentUser) {
        router.push('/')
      }
    });

    return unsubscribe;

  }, [])

  const switchForm = () => {
    setOnLogin(!onLogin)
  }

  const register = async () => {
    if (!email || !password || !name) {
      return
    }
    try {
      const user = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      .then(() => {
        updateProfile(auth.currentUser, {
          displayName: name
        })
      })
      .catch(e => {
        console.log(e)
      })

    } catch (e) {
      setError(
        "ERROR: " +
        JSON.stringify(e.code)
          .replace("auth/", "")
          .replaceAll('"', '')
          .replaceAll('-', ' ')
          .toUpperCase()
      )

      console.log(e)
    }
  }

  const login = async () => {
    try {
      const user = await signInWithEmailAndPassword(
        auth,
        email,
        password
      )
    } catch (e) {
      setError(
        "ERROR: " +
        JSON.stringify(e.code).replace("auth/", "")
          .replaceAll('"', '')
          .replaceAll('-', ' ')
          .toUpperCase()
      )
      console.log(e.message);
    }
  }

  return (
    <div className="flex w-full h-screen absolute -z-10 left-0 top-0 px-4 justify-center items-center">
      <div className='w-[32rem] border border-black py-6 px-4 flex flex-col gap-6 items-center'>
        <p className='font-bold text-lg'>{onLogin ? "LOGIN" : "REGISTER"}</p>

        <div className='flex flex-col gap-2 w-full items-start'>
          <p className='text-sm text-red-600'>{error}</p>
          {!onLogin &&
            <>
              <p>USERNAME</p>
              <input type="text" maxLength={20} className='border border-black p-2 outline-none w-full' onChange={(event) => { setName(event.target.value)}} />
            </>
          }
          <p>EMAIL</p>
          <input type="email" className='border border-black p-2 outline-none w-full' onChange={(event) => { setEmail(event.target.value)}} />
          <p>PASSWORD</p>
          <input type="password" maxLength={20} className='border border-black p-2 outline-none w-full' onChange={(event) => { setPassword(event.target.value) }} />
          {onLogin ?
            <div className='grid grid-cols-2 gap-4 w-full'>
              <button className='bg-black text-white grow py-4 mt-4' onClick={login}>LOGIN</button>
              <button className='bg-black text-white grow py-4 mt-4' onClick={switchForm}>REGISTER INSTEAD</button>
            </div> :
            <div className='grid grid-cols-2 gap-4 w-full'>
            <button className='bg-black text-white grow py-4 mt-4' onClick={switchForm}>LOGIN INSTEAD</button>
            <button className='bg-black text-white grow py-4 mt-4' onClick={register}>REGISTER</button>
          </div>
          }

        </div>

        {/* <p className='font-bold'>OR</p>

        <div className='flex flex-col gap-4 w-full'>
          <button className='bg-red-600 text-white py-4'>SIGN IN WITH GOOGLE</button>
          <button className='border border-black py-4'>SIGN IN WITH GOOGLE</button>
        </div> */}
      </div>
    </div>
  )
}
