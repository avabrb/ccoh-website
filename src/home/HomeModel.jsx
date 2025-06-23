import { useState, useEffect } from "react";

const API_KEY = import.meta.env.VITE_API_KEY
const CALENDAR_ID = import.meta.env.VITE_CALENDAR_ID

export async function getUpcomingEvents () {
    try {
        const response = await fetch (
            `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}&timeMin=${new Date().toISOString()}&singleEvents=true&orderBy=startTime`
        )

        if (!response.ok) {
            throw new Error('failed to fetch events')
            // show user in some way after
        }

        const data = await response.json()
        console.log("API Response:", data);
        console.log("Raw Event Data:", data.items);

        return data.items.map((event) => ({
            id: event.id,
            title: event.summary || "no title", 
            date: event.start?.dateTime || event.start?.date || null,
            link: event.htmlLink || "#",
            recurring: !!event.recurringEventId,
            colorId: event.colorId,
        }))

        console.log("Mapped Events:", events)

    } catch (error) {
        console.error(error)
        // display to user (later)
        return []
    }
}


export function useHomeImages() {
    const [loadedImages, setLoadedImages] = useState([]);
  
    useEffect(() => {
      const tryLoadImages = async () => {
        const promises = [];
  
        for (let i = 1; i <= 15; i++) {
          const path = `/images/slider/slidepic${i}.png`;
  
          const p = new Promise((resolve) => {
            const img = new Image();
            img.src = path;
            img.onload = () => resolve(path);
            img.onerror = () => resolve(null);
          });
  
          promises.push(p);
        }
  
        const results = await Promise.all(promises);
        const validImages = results.filter((path) => path !== null);
        setLoadedImages(validImages);
      };
  
      tryLoadImages();
    }, []);
  
    return loadedImages;
}

export default getUpcomingEvents;



