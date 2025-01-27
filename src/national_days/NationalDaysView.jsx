import React from 'react';
import "./NationalDays.css"
import "./nationalDays.JSON"

const Accordion = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    return (
      <div className="rounded-lg border mb-4">
        <div
          className="bg-blue-500 text-white p-3 cursor-pointer flex justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{title}</span>
          <span>{isOpen ? "-" : "+"}</span>
        </div>
        {isOpen && <div className="p-4">{children}</div>}
      </div>
    );
  };
  
  export default Accordion;

