import { useState, useEffect } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../login/Login.jsx';
import { v4 as uuidv4 } from 'uuid';
import "./program.css";

// Global lock to ensure single upload at a time across the page
if (typeof window !== "undefined" && window.__PHOTO_UPLOAD_LOCK__ === undefined) {
  window.__PHOTO_UPLOAD_LOCK__ = false;
}

// Count instances for debugging
if (typeof window !== "undefined" && window.__PHOTO_UPLOADER_INSTANCE_COUNT__ === undefined) {
  window.__PHOTO_UPLOADER_INSTANCE_COUNT__ = 0;
}

const PhotoUploader = ({ user }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    window.__PHOTO_UPLOADER_INSTANCE_COUNT__ += 1;
    console.log("PhotoUploader MOUNTED. Instance count:", window.__PHOTO_UPLOADER_INSTANCE_COUNT__);

    return () => {
      console.log("PhotoUploader UNMOUNTED - clearing file");
      setFile(null);
    };
  }, []);

  const handleUpload = async () => {
    console.log("HANDLE UPLOAD CALLED");

    if (window.__PHOTO_UPLOAD_LOCK__) {
      console.log("Global lock active - skipping upload.");
      return;
    }
    window.__PHOTO_UPLOAD_LOCK__ = true;

    if (!file || !user) {
      console.log("No file or user, exiting early.");
      window.__PHOTO_UPLOAD_LOCK__ = false;
      return;
    }

    console.log("Starting upload...");
    setUploading(true);

    try {
      const uploadId = uuidv4();
      const filename = `${uploadId}-${file.name}`;
      const storageRef = ref(storage, `photo-feed-images/${filename}`);
      console.log("Uploading to:", filename);

      await uploadBytes(storageRef, file);
      console.log("Upload complete - getting download URL");

      const downloadURL = await getDownloadURL(storageRef);
      console.log("Got download URL:", downloadURL);

      await addDoc(collection(db, 'photo-feed'), {
        url: downloadURL,
        name: filename,
        uploadedAt: serverTimestamp(),
        uploader: user.uid,
        uploadId
      });

      console.log("Firestore document added successfully");
      setFile(null);

    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      window.__PHOTO_UPLOAD_LOCK__ = false;
      console.log("Upload lock released");
    }
  };

  if (!user) {
    return (
      <div className="no-upload">
        <p>Sign in to upload your photos!</p>
      </div>
    );
  }

  return (
    <div className="photo-uploader">
      <input
        type="file"
        id="fileInput"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            console.log("File selected:", selectedFile.name);
            setFile(selectedFile);
            e.target.value = '';
          } else {
            console.log("No file selected in onChange!");
          }
        }}
        style={{ display: 'none' }}
      />

      <label htmlFor="fileInput" className="custom-file-button">
        {file ? file.name : "Choose a Photo"}
      </label>

      <p className="space"></p>

      {file && !window.__PHOTO_UPLOAD_LOCK__ && !uploading && (
        <button onClick={handleUpload}>
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </button>
      )}
    </div>
  );
};

export default PhotoUploader;
