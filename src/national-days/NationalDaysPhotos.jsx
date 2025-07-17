import "./NationalDays.css"
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js'; // adjust path as needed


export default function TopBanner() {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'national-days'));
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.imgURL) setImageUrl(data.imgURL);
        });
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchImage();
  }, []);

  if (!imageUrl) {
    return null; // or a loading spinner
  }

  return (
    <div
      className="top-banner"
      style={{ backgroundImage: `url(${imageUrl})` }}
    />
  );
}
