import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../login/Login.jsx';
import './ProgramImagesManager.css';

export default function ProgramImagesManager() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    return onSnapshot(
      collection(db, 'photo-feed'),
      snap => setImages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  const handleDelete = async img => {
    // 1) delete storage file
    const storageRef = ref(storage, `photo-feed-images/${img.name}`);
    await deleteObject(storageRef).catch(console.error);
    // 2) delete Firestore doc
    await deleteDoc(doc(db, 'photo-feed', img.id));
  };

  return (
    <div>
      <h2>Program Page Images</h2>
      <div className="images-grid">
        {images.map(img => (
          <div key={img.id} className="image-card">
            <img src={img.url} width={150} />
            <button
              className="btn btn-danger image-delete-btn"
              onClick={() => handleDelete(img)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
