import { ReactSketchCanvas } from "react-sketch-canvas";
import { useRef, useState, useEffect } from "react";
import { auth, db, firestore } from "../firebase/firebase"
import { ref, set } from "firebase/database"
import { doc, setDoc } from "firebase/firestore"

const styles = {
  border: "1px solid #000000",
  background: "no-repeat url('../public/painting.png')",
};

export default function Canvas({ setDrawing }) {
  const reference = useRef(null)
  const [title, setTitle] = useState("")
  const [currentColor, setCurrentColor] = useState("")
  const [colors, setColors] = useState([])
  const [strokeWidth, setStrokeWidth] = useState(5)

  useEffect(() => {
    const url = "http://colormind.io/api/";
    const data = {
      model: "default",
    }

    const http = new XMLHttpRequest();

    http.onreadystatechange = () => {
      if (http.readyState == 4 && http.status == 200) {
        const palette = JSON.parse(http.responseText).result;
        setColors(palette.map(color => {
          let r = color[0].toString(16)
          let g = color[1].toString(16)
          let b = color[2].toString(16)

          if (r.length == 1)
            r = "0" + r;
          if (g.length == 1)
            g = "0" + g;
          if (b.length == 1)
            b = "0" + b;
          setCurrentColor("#" + r + g + b)
          return "#" + r + g + b;
        }))

      }
    }

    http.open("POST", url, true);
    http.send(JSON.stringify(data));

  }, [])

  const submit = async () => {
    if (!title) {
      return
    }
    reference.current.exportImage("png")
      .then(data => {

        const userRef = ref(db, 'users/' + auth.currentUser.uid)
        const date = new Date();
        const datestring = ((date.getMonth() + 1).toString()).substring(-2) + "/" + (date.getDate().toString()).substring(-2) + "/" + (date.getFullYear().toString()).substring(2);

        set(userRef, {
          time: Date.now()
        })

        setDoc(doc(firestore, "images", auth.currentUser.uid), {
          timestamp: Date.now(),
          title: title,
          image: data,
          artist: auth.currentUser.displayName,
          date: datestring
        })

        setDrawing(false)
      })
      .catch(e => {
        console.log(e)
      })
  }

  return (
    <div className="flex flex-col max-w-xl grow gap-4 text-center">
      <p className="-my-2">Make your daily painting!</p>
      <div className='flex flex-col gap-2 w-full items-start'>
        <p>TITLE</p>
        <input type="text" maxLength={30} className='border border-black p-2 outline-none w-full' onChange={(event) => { setTitle(event.target.value) }} />
      </div>


      <div className="flex md:flex-row flex-col w-full gap-4">
        <ReactSketchCanvas
          className="aspect-square box-border w-full"
          style={styles}
          width="6000"
          height="6000"
          strokeWidth={strokeWidth}
          strokeColor={currentColor}
          ref={reference}
        />
        <div className="flex gap-4 md:flex-col flex-row md:w-8 md:-mr-[20%]">
          {
            colors.map(color => (
              <button key={color} onClick={() => { setCurrentColor(color) }} className={"aspect-square md:grow-0 w-8 rounded-full hover:scale-125 transition duration-300 ring-offset-4 ring-black " + ((currentColor === color ? "ring-1" : "ring-none"))} style={{ 'backgroundColor': `${color}` }}></button>
            ))
          }
          <div className="flex gap-4 md:flex-col flex-row md:mt-auto ml-auto items-center">
            <button onClick={() => { setStrokeWidth(5) }} className={"aspect-square md:grow-0 w-2 rounded-full hover:scale-125 transition duration-300 ring-offset-4 ring-black " + (strokeWidth === 5 ? "ring-1" : "ring-none")} style={{ 'backgroundColor': `${currentColor}` }}></button>
            <button onClick={() => { setStrokeWidth(10) }} className={"aspect-square md:grow-0 w-4 rounded-full hover:scale-125 transition duration-300 ring-offset-4 ring-black " + (strokeWidth === 10 ? "ring-1" : "ring-none")} style={{ 'backgroundColor': `${currentColor}` }}></button>
            <button onClick={() => { setStrokeWidth(20) }} className={"aspect-square md:grow-0 w-6 rounded-full hover:scale-125 transition duration-300 ring-offset-4 ring-black " + (strokeWidth === 20 ? "ring-1" : "ring-none")} style={{ 'backgroundColor': `${currentColor}` }}></button>
            <button onClick={() => { setStrokeWidth(20) }} className={"aspect-square md:grow-0 w-8 rounded-full hover:scale-125 transition duration-300 ring-offset-4 ring-black " + (strokeWidth === 40 ? "ring-1" : "ring-none")} style={{ 'backgroundColor': `${currentColor}` }}></button>
          </div>
        </div>
      </div>

      <button onClick={submit} className='bg-black text-white py-4 grow'>SUBMIT</button>

    </div>
  )
}
