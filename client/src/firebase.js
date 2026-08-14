import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  //FacebookAuthProvider 
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCzyCwiEgFs0h264o-UBeIaxphwjszQ1Wo",
  authDomain: "rekkerwebapp.firebaseapp.com",
  projectId: "rekkerwebapp",
  storageBucket: "rekkerwebapp.firebasestorage.app",
  messagingSenderId: "166558603833",
  appId: "1:166558603833:web:17531fa4ad51f12738cbe8",
  measurementId: "G-GF8SMC8FQ7"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Add provider exports
export const googleProvider = new GoogleAuthProvider();
//export const facebookProvider = new FacebookAuthProvider();