import { useRef, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getDatabase, ref, set, get, remove, onValue, off, onDisconnect } from "firebase/database";
import "./App.css";

function App() {
  const rSliderRef = useRef(null);
  const gSliderRef = useRef(null);
  const bSliderRef = useRef(null);

  const [userCount, setUserCount] = useState(0);
  const [userId, setUserId] = useState(null);
  const [db, setDB] = useState(null);

  const [color, setColor] = useState({
    r: {
      currentUser: "",
      val: 0,
    },
    g: {
      currentUser: "",
      val: 0,
    },
    b: {
      currentUser: "",
      val: 0,
    },
  });

  useEffect(() => {
    rSliderRef.current.value = color.r.val;
    gSliderRef.current.value = color.g.val;
    bSliderRef.current.value = color.b.val;

    const firebaseConfig = {
      apiKey: "AIzaSyCtTiAZjftFrnNxrTtTI_uSrINKyvplX60",
      authDomain: "color-bd3dd.firebaseapp.com",
      databaseURL: "https://color-bd3dd-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "color-bd3dd",
      storageBucket: "color-bd3dd.appspot.com",
      messagingSenderId: "48176252468",
      appId: "1:48176252468:web:ffeb0ffa120ee57fe3ac61"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getDatabase();
    setDB(db);

    const usersRef = ref(db, "users");

    onAuthStateChanged(auth, (user) => {
      if (user) {

        setUserId(user.uid);
        const userRef = ref(db, `users/${user.uid}`);
        set(userRef, {
          uid: user.uid,
        });
        onDisconnect(userRef).remove();

      } else {
        remove(ref(db, `users/${userId}`));
        setUserId("");
      }
    });

    onValue(usersRef, (snapshot) => {
      setUserCount(snapshot.size);
    });

    const colorRef = ref(db, "color");
    onValue(colorRef, (snapshot) => {
      const c = snapshot.val();
      rSliderRef.current.value = c.r.val;
      gSliderRef.current.value = c.g.val;
      bSliderRef.current.value = c.b.val;
      setColor(c);
    });

    signInAnonymously(auth)
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        remove(ref(db, `users/${userId}`));
      } else {
        const userRef = ref(db, `users/${userId}`);
        set(userRef, {
          uid: userId,
        });
        onDisconnect(userRef).remove();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  });

  function handlePointerDown(event) {
    const cRef = ref(db, `color/${event.target.name}`);
    set(cRef, {
      currentUser: userId,
      val: event.target.value,
    });
  }
  function handlePointerUp(event) {
    const cRef = ref(db, `color/${event.target.name}`);
    set(cRef, {
      currentUser: "",
      val: event.target.value,
    });
  }
  function handleChange(event) {
    const cRef = ref(db, `color/${event.target.name}`);
    set(cRef, {
      currentUser: userId,
      val: event.target.value,
    });
  }

  return (
    <>
      <div className="main" style={{
        backgroundColor: `rgb(${color.r.val}, ${color.g.val}, ${color.b.val})`,
      }}>

        <div className="picker">
          <h1> Users online: { userCount } </h1>
          <input 
            ref={rSliderRef} 
            disabled={!(color.r.currentUser === "" || color.r.currentUser == userId)} 

            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onChange={handleChange}

            name="r"
            type="range" 
            min="0" 
            max="255" 
          />

          <input 
            ref={gSliderRef} 
            disabled={!(color.g.currentUser === "" || color.g.currentUser == userId)} 

            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onChange={handleChange}

            name="g"
            type="range" 
            min="0" 
            max="255" 
          />

          <input 
            ref={bSliderRef} 
            disabled={!(color.b.currentUser === "" || color.b.currentUser == userId)} 

            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onChange={handleChange}

            name="b"
            type="range" 
            min="0" 
            max="255" 
          />
        </div>

      </div>
    </>
  );
}

export default App;
