import { useState } from 'react';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../login/Login.jsx';
import "./program.css";

const PhotoUploader = ({ user }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file || !user) return;

    const storageRef = ref(storage, `photo-feed-images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploading(true);

    uploadTask.on(
      'state_changed',
      null,
      (err) => {
        console.error("Upload error:", err);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, 'photo-feed'), {
          url: downloadURL,
          name: file.name,
          uploadedAt: serverTimestamp(),
        });
        setFile(null);
        setUploading(false);
        alert("Upload successful!");
      }
    );
  };
  if (!user) return (
    <div className="no-upload">
        <p>Sign in to upload your photos!</p>
    </div>
  )
  return (
    <div className="photo-uploader">
        <input
            type="file"
            id="fileInput"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ display: 'none' }}
        />
        <label htmlFor="fileInput" className="custom-file-button">
            {file ? file.name : "Choose a Photo"}
        </label>
        <p className="space"></p>
        <button disabled={!file || uploading} onClick={handleUpload}>
            {uploading ? 'Uploading...' : 'Upload Photo'}
        </button>
    </div>
  );
};

export default PhotoUploader;