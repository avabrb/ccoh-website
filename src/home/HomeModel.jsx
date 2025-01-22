const API_KEY = '1'
const CALENDAR_ID = '2'

// input later with environmental variables 
// i have both key and calendar id

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
        return data.items.map((event) => ({
            id: event.id,
            title: event.summary, 
            date: event.start.date
        }))

    } catch (error) {
        console.error(error)
        // display to user (later)
    }
}

export const homeLinks = {
    buttons: {
        joinUs: '/login',
        seeEvents: '/program'
    }
}

export const homeImages = [
    'logo-removebg.png',
    'logo.png'
]

export default getUpcomingEvents

