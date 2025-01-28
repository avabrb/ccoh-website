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
        }))

        console.log("Mapped Events:", events)

    } catch (error) {
        console.error(error)
        // display to user (later)
        return []
    }
}

export const homeImages = [
    'logo-removebg.png',
    'logo.png'
]

export default getUpcomingEvents

