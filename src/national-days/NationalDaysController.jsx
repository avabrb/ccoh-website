import React from "react";
import DaysModel from './NationalDaysVM'
import "./NationalDays.css"
import TopBanner from "./NationalDaysPhotos";

export default function NationalDays() {
    return (
        <div>
        <TopBanner />
        <DaysModel />
        </div>
    )
}
