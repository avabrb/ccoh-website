import "./program.css";

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../login/Login.jsx'; // your existing Firebase setup
import PhotoUploader from "./photo-upload.jsx";
import PhotoFeed from "./photo-feed.jsx"; 
import './program.css';

const CALENDAR_ID = import.meta.env.VITE_CALENDAR_ID
const API_KEY = import.meta.env.VITE_API_KEY;

const Highlight = ({ children }) => {
    return <span className="highlight">{children}</span>;
};  

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [cannotSelectEvent, setCannotSelectEvent] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      const url = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}&timeMin=${new Date().toISOString()}&singleEvents=true&orderBy=startTime`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        const formatted = data.items.map((event) => ({
          title: event.summary,
          date: event.start.date || event.start.dateTime,
          extendedProps: {
            description: event.description || 'No details available.',
          },
        }));
        setEvents(formatted);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (info) => {
    if (user) {
        setSelectedEvent({
        title: info.event.title,
        description: info.event.extendedProps.description,
        location: info.event.extendedProps.location,
        start: info.event.start,
        end: info.event.end,
      });
    } else {
        setCannotSelectEvent({
        title: info.event.title,
        start: info.event.start,
        end: info.event.end,
        additional_information: "Please log in to see event location and more details.",
      });
    }
  };

    return (
    <div className="events-page">
        <h1 className="page-title">Check out the <Highlight>upcoming events</Highlight> this month</h1>

        <div className="calendar-wrapper">
        <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={events}
            eventClick={handleEventClick}
        />
        </div>

        {selectedEvent && (
        <div className="event-detail-modal">
            <div className="event-detail-content">
            <h2>{selectedEvent.title}</h2>
            {selectedEvent.start && (
                <p><strong>Start:</strong> {new Date(selectedEvent.start).toLocaleString()}</p>
            )}
            {selectedEvent.end && (
                <p><strong>End:</strong> {new Date(selectedEvent.end).toLocaleString()}</p>
            )}
            {selectedEvent.location && (
                <p><strong>Location:</strong> {selectedEvent.location}</p>
            )}
            <p><strong>Description:</strong> {selectedEvent.description}</p>
            <button onClick={() => setSelectedEvent(null)}>Close</button>
            </div>
        </div>
        )}

        {cannotSelectEvent && (
        <div className="event-detail-modal">
            <div className="event-detail-content">
            <h2>{cannotSelectEvent.title}</h2>
            {cannotSelectEvent.start && (
                <p><strong>Start:</strong> {new Date(cannotSelectEvent.start).toLocaleString()}</p>
            )}
            {cannotSelectEvent.end && (
                <p><strong>End:</strong> {new Date(cannotSelectEvent.end).toLocaleString()}</p>
            )}
            <p>{cannotSelectEvent.additional_information}</p>
            <button onClick={() => setCannotSelectEvent(null)}>Close</button>
            </div>
        </div>
        )}

        <h1 className="section-title">Photos from <Highlight>past events</Highlight> :</h1>

        <div className="photo-grid">
          <PhotoFeed />
        </div>
        <div className="photo-uploader">
          <PhotoUploader user={user} />
        </div>
    </div>
    );
};

export default EventsPage;
