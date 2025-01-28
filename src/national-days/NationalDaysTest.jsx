import React from 'react'
import "./NationalDays.css"
/* Line that causes problems: */
import data from "./example.JSON" 

const DaysModel = () => {
    return (
      <div className="page">
        <h1>Explore the nationasl and official celebration days of all countries with Consular offices in Houston.</h1>
        <h1>{data}</h1>
      </div>
    );
  };


const renderEvents = () => {
    return <p>Testing Render</p>;
  };
  
export default DaysModel;