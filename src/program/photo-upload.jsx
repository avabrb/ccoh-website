import { useState, useEffect } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../login/Login.jsx';
import { v4 as uuidv4 } from 'uuid';
import "./program.css";

function logDebug(msg, ...args) {
  console.log(`[PhotoUploader][${new Date().toISOString()}] ${msg}`, ...args);
}

// Global lock to ensure single upload at a time across the page
if (typeof window !== "undefined" && window.__PHOTO_UPLOAD_LOCK__ === undefined) {
  window.__PHOTO_UPLOAD_LOCK__ = false;
}

const PhotoUploader = ({ user }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const id = Math.random().toString(36).substr(2, 5);
    logDebug("PhotoUploader mounted with id:", id);
    return () => logDebug("PhotoUploader unmounted with id:", id);
  }, []);

  useEffect(() => {
    logDebug("file state changed:", file);
  }, [file]);

  useEffect(() => {
    if (file && !uploading) {
      logDebug("Upload button rendered for file:", file.name);
    }
  }, [file, uploading]);

  const handleUpload = async () => {
    if (uploading || window.__PHOTO_UPLOAD_LOCK__) {
      logDebug("Upload prevented: already uploading or lock is set.");
      return;
    }
    setUploading(true);
    window.__PHOTO_UPLOAD_LOCK__ = true;
    logDebug("Upload lock set.");

    if (!file || !user) {
      logDebug("No file or user, exiting early.");
      setUploading(false);
      window.__PHOTO_UPLOAD_LOCK__ = false;
      return;
    }

    try {
      const uploadId = uuidv4();
      const filename = `${uploadId}-${file.name}`;
      const storageRef = ref(storage, `photo-feed-images/${filename}`);
      logDebug("Uploading to:", filename);

      await uploadBytes(storageRef, file);
      logDebug("Upload complete - getting download URL");

      const downloadURL = await getDownloadURL(storageRef);
      logDebug("Got download URL:", downloadURL);

      await addDoc(collection(db, 'photo-feed'), {
        url: downloadURL,
        name: filename,
        uploadedAt: serverTimestamp(),
        uploader: user.uid,
        uploadId,
        debugClientId: uuidv4(), // Add this
      });

      logDebug("Firestore document added successfully");
      setFile(null);

    } catch (error) {
      logDebug("Upload error:", error);
    } finally {
      setUploading(false);
      window.__PHOTO_UPLOAD_LOCK__ = false;
      logDebug("Upload lock released. uploading:", uploading, "lock:", window.__PHOTO_UPLOAD_LOCK__);
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
            logDebug("File selected:", selectedFile.name);
            setFile(selectedFile);
            e.target.value = '';
          } else {
            logDebug("No file selected in onChange!");
          }
        }}
        style={{ display: 'none' }}
      />

      <label htmlFor="fileInput" className="custom-file-button">
        {file ? file.name : "Choose a Photo"}
      </label>

      <p className="space"></p>

      {file && !uploading && (
        <button
          onClick={handleUpload}
          disabled={uploading || window.__PHOTO_UPLOAD_LOCK__}
        >
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </button>
      )}
    </div>
  );
};

export default PhotoUploader;
