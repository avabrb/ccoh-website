import React from 'react';
import useHomeModel from './HomeVM';
import HomeView from './HomeView';
import "./Home.css"


export default function Home() {
    const { events, images } = useHomeModel()

    return <HomeView events={events}/>
}