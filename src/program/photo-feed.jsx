import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from '../login/Login.jsx';
import './program.css';

const PhotoFeed = () => {
  const [columns, setColumns] = useState([[], [], []]);

  useEffect(() => {
    const q = query(collection(db, "photo-feed"), orderBy("uploadedAt", "desc"), limit(99));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const imageList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Distribute into 3 columns
      const newColumns = [[], [], []];
      imageList.forEach((img, idx) => {
        newColumns[idx % 3].push(img); // round-robin distribution
      });
      setColumns(newColumns);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="masonry-flow">
      {columns.map((column, colIdx) => (
        <div className="masonry-column" key={colIdx}>
          {column.map((img, i) => (
            <div className="photo-tile" key={img.id || i}>
              <img src={img.url} alt={`event-${i}`} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PhotoFeed;


