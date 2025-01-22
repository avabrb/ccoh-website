import { useEffect, useState } from "react";
import { getUpcomingEvents, homeImages, homeLinks } from "./HomeModel";

const useHomeModel = () => {
    const [events, setEvents] = useState([])
    // should we set a loading screen in case the fetch is super slow?

    useEffect(() => {
        async function loadEvents() {
            const events = await getUpcomingEvents()
            setEvents(events)
        }

        loadEvents()
    }, [])

    return {
        events, 
        buttons: homeLinks,
        images: homeImages
    }
}

export default useHomeModel