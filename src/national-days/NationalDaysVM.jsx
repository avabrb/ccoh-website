import React from 'react'
import datesData from "./NationalDays.json"
import "./NationalDays.css"
import Flag from 'react-country-flag';

const DaysModel = () => {
    return (
      <div className="page">
        <h1>Explore the <Highlight> national and official celebration days </Highlight> of all countries with Consular offices in Houston.</h1>
        {renderEvents()}
      </div>
    );
  };

  const toSuperscript = (dateStr) => {
    const superscripts = { s: 'ˢ', t: 'ᵗ', n: 'ⁿ', d: 'ᵈ', r: 'ʳ', h:'ʰ'};
    const match = dateStr.match(/^0?(\d+)(st|nd|rd|th)$/);
    if (!match) return dateStr;
  
    const [, num, suffix] = match;
    const supSuffix = suffix.split('').map(c => superscripts[c] || c).join('');
    return `${num}${supSuffix}`;
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
            month = {month}
            key={index}
            date={event.date}
            country={event.country}
            flag = {event.flag}
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
        <div 
        className={`title-open ${isOpen ? "active" : ""}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
          <span>{title}</span>
          <span>{isOpen ? "x" : "+"}</span>
        </div>
        {isOpen && <div className="section">{children}</div>}
      </div>
    );
  };
  
  const CountryRow = ({ date, country, flag, event, month }) => {
    return (
      <div className="month-box">
        <div class="left-side">
          <div className="date-country">
            <p className="date">{month}{" "}{toSuperscript(date)}</p>
            <p className="country">{country}</p>
          </div>
          <div className="flag-event">
            <div className="flag-wrapper">
              <Flag
                countryCode={flag}
                svg
                className="flag"
              />
            </div>
        </div>
          <p className="event">{event}</p>
        </div>
      </div>
    );
  };

export default DaysModel;

