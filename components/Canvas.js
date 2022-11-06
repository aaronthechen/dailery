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
  const [strokeWidth, setStrokeWidth] = useState()
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    const getColors = async () => {
      var url = "https://api.huemint.com/color";
      var json_data = {
        mode: "transformer", // transformer, diffusion or random
        num_colors: 5, // max 12, min 2
        temperature: "2.4", // max 2.4, min 0
        num_results: 1, // max 50 for transformer, 5 for diffusion
        adjacency: ["50", "50", "50", "50", "50", "50", "50", "50", "50", "50", "50", "50", "50", "50", "50", "50", "50", "50", "50", "50", "50", "50", "50", "50", "50"], // nxn adjacency matrix as a flat array of strings
        palette: ["-", "-", "-", "-", "-"], // locked colors as hex codes, or '-' if blank
      }

      var http = new XMLHttpRequest();

      http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
          var palette = JSON.parse(http.responseText).results[0].palette;

          setColors((palette.map(color => {
            return color
          })))
          setCurrentColor(palette[0])
          setStrokeWidth(20)
        }
      }

      http.open("post", url, true);
      http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      http.send(JSON.stringify(json_data));
    }
    getColors()
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
        <input type="text" maxLength={30} className='border border-black p-2 rounded-none outline-none w-full' onChange={(event) => { setTitle(event.target.value) }} />
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
        <div className="flex md:flex-col flex-row gap-4 md:w-8 md:-mr-[20%] justify-between">
          <div className="flex xs:gap-4 gap-2 md:flex-col flex-row">
            {
              colors.map(color => (
                <button key={color} onClick={() => { setCurrentColor(color) }} className={"aspect-square md:grow-0 w-8 rounded-full hover:scale-125 transition duration-300 ring-offset-4 ring-black " + ((currentColor === color ? "ring-1" : "ring-none"))} style={{ 'backgroundColor': `${color}` }}></button>
              ))
            }
          </div>
          <div className="flex xs:gap-4 gap-2 md:flex-col flex-row items-center">
            <button onClick={() => { setStrokeWidth(5) }} className={"aspect-square w-2 rounded-full hover:scale-125 transition duration-300 ring-offset-4 ring-black " + (strokeWidth === 5 ? "ring-1" : "ring-none")} style={{ 'backgroundColor': `${currentColor}` }}></button>
            <button onClick={() => { setStrokeWidth(10) }} className={"aspect-square w-4 rounded-full hover:scale-125 transition duration-300 ring-offset-4 ring-black " + (strokeWidth === 10 ? "ring-1" : "ring-none")} style={{ 'backgroundColor': `${currentColor}` }}></button>
            <button onClick={() => { setStrokeWidth(20) }} className={"aspect-square w-6 rounded-full hover:scale-125 transition duration-300 ring-offset-4 ring-black " + (strokeWidth === 20 ? "ring-1" : "ring-none")} style={{ 'backgroundColor': `${currentColor}` }}></button>
            <button onClick={() => { setStrokeWidth(40) }} className={"aspect-square w-8 rounded-full hover:scale-125 transition duration-300 ring-offset-4 ring-black " + (strokeWidth === 40 ? "ring-1" : "ring-none")} style={{ 'backgroundColor': `${currentColor}` }}></button>
            <button onClick={() => { setStrokeWidth(100) }} className={"md:h-16 h-8 md:w-8 w-16 rounded-xl hover:scale-125 transition duration-300 ring-offset-4 ring-black " + (strokeWidth === 100 ? "ring-1" : "ring-none")} style={{ 'backgroundColor': `${currentColor}` }}></button>
          </div>
        </div>
      </div>

      <button onClick={submit} className='bg-black text-white py-4 grow'>SUBMIT</button>

    </div>
  )
}
