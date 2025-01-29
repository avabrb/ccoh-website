import React from 'react'
import DaysModel from './NationalDaysVM'
import "./NationalDays.css"
import MovingPhotos from './NationalDaysPhotos'

export default function NationalDays() {
    return (
        <div>
        <MovingPhotos />
        <DaysModel />
        </div>
    )
}
