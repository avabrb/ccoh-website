import React from 'react'
import "./NationalDays.css"
/* Line that causes problems: 
import data from "./example.json" */

const DaysModel = () => {
    return (
      <div className="page">
        <h1>Explore the national and official celebration days of all countries with Consular offices in Houston.</h1>
        {renderEvents}
      </div>
    );
  };


const renderEvents = () => {
    return <p>Testing Render</p>;
  };
  
export default DaysModel;