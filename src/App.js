import { useRef, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getDatabase, ref, set, onValue, off } from "firebase/database";

function App() {
  const [colorRef, setColorRef] = useState(null);

  const rSliderRef = useRef(null);
  const gSliderRef = useRef(null);
  const bSliderRef = useRef(null);

  const [red, setRed] = useState(0);
  const [green, setGreen] = useState(0);
  const [blue, setBlue] = useState(0);

  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    rSliderRef.current.value = red;
    gSliderRef.current.value = green;
    bSliderRef.current.value = blue;

    const firebaseConfig = {
      apiKey: "AIzaSyD17oz6__jT1xUgV9fzq73Ffqj9okY7Vjc",
      authDomain: "blocky-platformer.firebaseapp.com",
      databaseURL: "https://blocky-platformer-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "blocky-platformer",
      storageBucket: "blocky-platformer.appspot.com",
      messagingSenderId: "131040467603",
      appId: "1:131040467603:web:0a63889e5ada12fc4e4b66"
    };
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const db = getDatabase();
    const cRef = ref(db, "color");
    setColorRef(cRef);

    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Logged in.");
      } else {
        console.log("Logged out.");
      }
    });

    signInAnonymously(auth)
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  }, []);

  useEffect(() => {
    if (colorRef === null) {
      return;
    }

    const listener = onValue(colorRef, (snapshot) => {
      const rgb = snapshot.val();
      if (rgb.r != red) {
        setRed(rgb.r);
      }
      if (rgb.g != green) {
        setGreen(rgb.g);
      }
      if (rgb.b != blue) {
        setBlue(rgb.b);
      }
    });

    const interval = setInterval(() => {
      if (updated) {
        set(colorRef, {
          r: red,
          g: green,
          b: blue,
        });
        setUpdated(false);
      }
    }, 200);
    return () => {
      off(colorRef);
      clearInterval(interval);
    };
  });

  function handleColorChange(event) {
    switch (event.target.name) {
      case "r":
        setRed(event.target.value);
        setUpdated(true);
        break;
      case "g":
        setGreen(event.target.value);
        setUpdated(true);
        break;
      case "b":
        setBlue(event.target.value);
        setUpdated(true);
        break;
      default:
        break;
    }
  }

  return (
    <div style={{
      width: "100vw", 
      height: "100vh",
      backgroundColor: `rgb(${red}, ${green}, ${blue})`,
    }}>

      <form onChange={handleColorChange}> 
        <input ref={rSliderRef} type="range" min="0" max="255" name="r" />
        <input ref={gSliderRef} type="range" min="0" max="255" name="g" />
        <input ref={bSliderRef} type="range" min="0" max="255" name="b" />
      </form>

    </div>
  );
}

export default App;
