import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from '../login/Login.jsx';
import './program.css';

const PhotoFeed = () => {
  const [images, setImages] = useState([]);
  const [users,  setUsers]  = useState({});

  useEffect(() => {
    // 1) listen to photo-feed, ordered by newest
    const qImages = query(
      collection(db, "photo-feed"),
      orderBy("uploadedAt", "desc")
    );
    const unsubImages = onSnapshot(qImages, snap =>
      setImages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    // 2) listen to all users to resolve uploader info
    const unsubUsers = onSnapshot(
      collection(db, "users-ccoh"),
      snap => {
        const map = {};
        snap.forEach(d => { map[d.id] = d.data(); });
        setUsers(map);
      }
    );

    return () => {
      unsubImages();
      unsubUsers();
    };
  }, []);

  // 3) split into 3 columns
  const numCols = 3;
  const cols = Array.from({ length: numCols }, () => []);
  images.forEach((img, idx) => {
    cols[idx % numCols].push(img);
  });

  return (
    <div className="masonry-flow">
      {cols.map((columnImages, ci) => (
        <div key={ci} className="masonry-column">
          {columnImages.map(img => (
            <div key={img.id} className="photo-tile">
              <img
                src={img.url}
                alt={img.name || 'event photo'}
              />
              <div className="photo-meta">
                <div>
                  <strong>Posted:</strong>{" "}
                  {img.uploadedAt?.toDate
                    ? img.uploadedAt.toDate().toLocaleDateString()
                    : 'Unknown'}
                </div>
                <div>
                  <strong>By:</strong>{" "}
                  {users[img.uploader]?.firstName
                    ? `${users[img.uploader].firstName} ${users[img.uploader].lastName}`
                    : users[img.uploader]?.email || 'Unknown'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PhotoFeed;
