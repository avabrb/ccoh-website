// Import the functions you need from the SDKs you need

import { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";   
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MSG_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); 
const storage = getStorage(app);
// const functions = getFunctions(app);

export const handleSignOut = () => {
    signOut(auth).then(() => {
    // Sign-out successful.
        console.log('Sign-out successful');
        const navigate = useNavigate();
        navigate('/login');
    }).catch((error) => {
        console.error('Error during sign-out:', error);
    // An error happened.
    });    
};

import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // State for error messages
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear any previous error messages

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (isSignUp) {
      createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
          navigate('/profile');
        })
        .catch((error) => {
          handleAuthError(error);
        });
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => navigate('/home'))
        .catch((error) => {
          handleAuthError(error);
        });
    }
  };

  const handleAuthError = (error) => {
    console.error('Auth error:', error); 
    switch (error.code) {
      case 'auth/invalid-credential':
        setErrorMessage('Invalid email address or password.');
        break;
      // case 'auth/user-not-found':
      //   setErrorMessage('No account found with this email.');
      //   break;
      // case 'auth/wrong-password':
      //   setErrorMessage('Incorrect password. Please try again.');
      //   break;
      case 'auth/email-already-in-use':
        setErrorMessage('This email is already in use. Please log in.');
        break;
      case 'auth/weak-password':
        setErrorMessage('Password should be at least 6 characters.');
        break;
      default:
        setErrorMessage('An error occurred. Please try again.');
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        const userDoc = doc(db, 'users-ccoh', userId);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData({
                ...userData, // Ensure all fields are preserved
                ...data,
                email: auth.currentUser.email || '',
                membershipPaymentYear: data.membershipPaymentYear || '',
                membershipPaymentDate: data.membershipPaymentDate || '',
                membershipPayment: data.membershipPayment || false,
            });
            setIsProfileComplete(data.isProfileComplete || false);
            setIsEditing(!(data.isProfileComplete));
        } else {
            setUserData(prev => ({
                ...prev,
                email: auth.currentUser.email || '',
            }));
        }
    };
    fetchUserData();
}, []);

  return (
    <div className="login-container">
      <div className="login-form-section">
        <form className="login-form" onSubmit={handleSubmit}>
          <h1>Welcome back!</h1>
          <p>Login below or sign up if you don't have an account.</p>

          {/* Error Message */}
          {errorMessage && <div className="error-box">{errorMessage}</div>}

          <div className="input-group">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              name="email"
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              name="password"
            />
          </div>

          <button type="submit" className="login-button">
            {isSignUp ? 'Sign Up' : 'Log In'}
          </button>

          <div className="link-row">
            <a href="#">Forgot password?</a>
            <a onClick={() => setIsSignUp(!isSignUp)}>{isSignUp ? 'Log In' : 'Sign Up'}</a>
          </div>
        </form>
      </div>

      <div className="quote-section">
        <div className="quote-box">
          <p>
            The future belongs to those who <span className="blue bold">believe</span> in the{' '}
            <span className="blue bold">beauty of their dreams.</span>
            <br />– Eleanor Roosevelt
          </p>
        </div>
      </div>
    </div>
  );
}; 

export default Login;
export { auth, app, db, storage};
