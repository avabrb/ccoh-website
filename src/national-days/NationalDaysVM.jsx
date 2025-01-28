/* currently just testing on NationalDaysTest.jsx -- do not look here*/
import React from 'react'
import datesData from "./NationalDays.json"
import "./NationalDays.css"

const DaysModel = () => {
    return (
      <div className="page">
        <h1>Explore the <Highlight> national and official celebration days </Highlight> of all countries with Consular offices in Houston.</h1>
        {renderEvents()}
      </div>
    );
  };

  const Highlight = ({ children }) => {
    return <span className="highlight">{children}</span>;
  };  

  const renderEvents = () => {
    console.log(datesData); // Debugging
    if (!datesData || typeof datesData !== "object") {
      return <p>No data available</p>; // Handle undefined or invalid data
    }
    return Object.entries(datesData).map(([month, data]) => (
      <MonthSection key={month} month={month} data={data} />
    ));
  };
  
  const MonthSection = ({ month, data }) => {
    return (
      <Accordion title={month}>
        {data.map((event, index) => (
          <CountryRow
            key={index}
            date={event.date}
            country={event.country}
            flag={event.flag}
            event={event.event}
          />
        ))}
      </Accordion>
    );
  };
  
  const Accordion = ({ title, children }) => {
    const [isOpen, setIsOpen] = React.useState(false); // Ensure React is imported
    return (
      <div className="month-block">
        <div className="title-open" onClick={() => setIsOpen(!isOpen)}>
          <span>{title}</span>
          <span>{isOpen ? "x" : "+"}</span>
        </div>
        {isOpen && <div className="section">{children}</div>}
      </div>
    );
  };
  
  const CountryRow = ({ date, country, flag, event }) => {
    return (
      <div className="month-box">
        <div className="date-country">
          <p className="date">{date}</p>
          <p className="country">{country}</p>
        </div>
        <div className="flag-event">
          <p className="flag">{flag}</p>
          <p className="event">{event}</p>
        </div>
      </div>
    );
  };

export default DaysModel;

