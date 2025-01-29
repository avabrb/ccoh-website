import React from 'react'
import "./NationalDays.css"
import image1 from "./Photo_Move_1.png"
import image2 from "./Photo_Move_2.png"

export default function MovingPhotos() {
  return (
    <div className="photo-container">
      <img src={image1} alt="Moving" className="moving-photo" />
      <img src={image2} alt="Moving" className="moving-photo" />
    </div>
  );
}

