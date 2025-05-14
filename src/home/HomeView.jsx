import Slider from "react-slick"
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import React, { useState } from "react";
import WhoIcon from '/who.png';
import HowIcon from '/how.png';
import WhenIcon from '/when.png';


import { homeImages } from "./HomeModel"

const Highlight = ({ children }) => {
    return <span className="highlight">{children}</span>;
};  



const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const highlightText = (text = "", keywords = [], color = "#005dFF", fontWeight = "bold") => {
    if (typeof text !== "string" || !Array.isArray(keywords) || keywords.length === 0) {
        return text;
    }

    // Escape each keyword to avoid special character issues
    const escapedKeywords = keywords.map(keyword => escapeRegExp(keyword));

    // Filter out keywords that are not in the text (exact match)
    const filteredKeywords = escapedKeywords.filter(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase().replace(/\\/g, ""))
    );
    
    if (filteredKeywords.length === 0) return text;

    // Split the text using only the existing keywords (escaped)
    const parts = text.split(new RegExp(`(${filteredKeywords.join('|')})`, 'gi'));

    return parts.map((part, index) => 
        filteredKeywords.some(keyword => keyword.toLowerCase().replace(/\\/g, "") === part.toLowerCase()) ? (
            <span key={index} style={{ color: color, fontWeight: fontWeight }}>{part}</span>
        ) : (
            part
        )
    );
};

// Directly in HomeView
const Accordion = ({ title, children }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const contentRef = React.useRef(null);

    return (
        <div className="accordion-container">
            <div 
                className="accordion-header" 
                onClick={() => setIsOpen(!isOpen)}
            >
                <div>{title}</div>
                <div>{isOpen ? "✕" : "＋"}</div>
            </div>
            <div 
                className="accordion-content" 
                style={{ 
                    height: isOpen ? `${contentRef.current?.scrollHeight}px` : "0px",
                    overflow: "hidden",
                    transition: "height 0.4s ease"
                }}
                ref={contentRef}
            >
                <div style={{ padding: "10px 0" }}>
                    {children}
                </div>
            </div>
        </div>
    );
};


const HomeView = ({ events, images }) => {
    // const images = images

    const sliderSettings ={
        dots: true,
        infinite: true,
        speed: 500,             // Fast transition speed
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,         // Enable autoplay
        autoplaySpeed: 8000,    // Change slides every 1 second (1000ms)
        pauseOnHover: false,    // Do not pause on hover (ensures it keeps autoplaying)
        pauseOnFocus: false,    // Do not pause on focus
        cssEase: "cubic-bezier(0.47, 0, 0.745, 0.715)",      // Makes the transition smoother
        waitForAnimate: true,
        adaptiveHeight: true,
    }

    const whoWeAre = [
        {
            id: 1,
            boldText: "We provide services to official country representatives, facilitating their integration and connections.",
            text: "We have a rich event-driven program, which promotes friendly relations among members and with official entities, the private sector, and the vibrant local communities of Houston and Texas."
        },
        {
            id: 2,
            boldText: "We contribute to maintaining Houston’s status as a thriving international hub.",
            text: "Home to about 90 official representatives from foreign countries, Houston, the most diverse city, boasts the third-largest consular presence in the United States. It is a global crossroad where cultures, ideas, and nations converge."
        }, 
        {
            id: 3,
            boldText: "Our history is deeply intertwined with that of the city of Houston itself.",
            text: "Established nearly a century ago, its origins trace back to the creation of the World Trade Department by the Houston Chamber of Commerce. This initiative played a pivotal role in establishing Houston’s first consulate—the Consulate of Mexico—in 1919."
        },
        {
            id: 4,
            boldText: "Our members are diverse, with Consuls General and Honorary Consuls coming from all around the world.",
            text: "Today, the CCH is composed of approximately 50% Consuls General and 50% Honorary Consuls, with a balanced representation from across the globe: Europe (38%), Americas (26%), Asia & Oceania (20%), Africa (16%)."
        }
    ]

    const becomeMember= [
        {
            title: "WHO?",
            text: "Eligible Members are all consular officers (career diplomats and honorary consular officers) and emeriti consular officers. All the consular officers serving in the Greater Houston region, accredited by their respective governments to the United States, and holding an Exequatur (or equivalent document) issued by the United States Government are eligible Members."
        },
        {
            title: "HOW?",
            elements: [
                "Complete the membership application form.",
                "Pay the annual membership fee of $200."
            ]
        },
        {
            title: "WHEN?",
            elements: [
                "Membership Campaign: Opens on December 1st of the previous year.",
                "Deadline: Finalize your membership before February 15th each year.",
                "Annual Meeting in February."
            ]
        }
    ]

    const organizeEvents = [
        {
            id: 1,
            text: "MEET the leaders who inspire Houston’s greatness.",
        },
        {
            id: 2,
            text: "EXPLORE the places that define Houston's vision.",
        },
        {
            id: 3,
            text: "CELEBRATE the traditions that unite Houston's international community.",
        },
        {
            id: 4,
            text: "ENJOY the experiences that make Houston unforgettable."
        }
    ]

    const formatDateTime = (dateTime) => {
        const options = { weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
        return new Date(dateTime).toLocaleString(undefined, options);
    };

    return (
        <div className="main-content">
            <h1 className="title">
                The <span className="effect">Consular Corps of Houston</span>: A Dynamic, Diverse, and Global Community
            </h1>

            {/* scrolling images section */}
            <div className="scroll-images">
                <Slider {...sliderSettings}>
                    {/* for some reason this only works by passing homeimages but should work by passing images */}
                    {homeImages.map((image, index) => (
                        <div key={index}>
                            <img src={image} className="carousel-image" />
                        </div>
                    ))}
                </Slider>
            </div>
            
            <div className="subsection">
                <h2 id="who-are-we" style={{color: "black"}}>Who are we?</h2>

                <div className="content">
                    <p className="general">The Consular Corps of Houston (CCH) is a <Highlight>non-profit organization</Highlight> dedicated to supporting its members in their official functions under the Vienna Convention on Consular Relations of 1963.</p>

                    <div className="info-grid">
                        {whoWeAre.map((section) => (
                            <div key={section.id} className="info-section">
                                <p className="bold-section">
                                    {highlightText(
                                        section.boldText || "", // Fallback to empty string
                                        ["official country representatives", "thriving international hub", "history", "city of Houston", "Consuls General", "Honorary Consuls", "all around the world"]
                                    )}
                                </p>

                                <p className="text-section">{highlightText(
                                        section.text,
                                        ["rich event-driven program", "official entities", "private sector", "local communities", 
                                        "90 official representatives", "diverse", "third-largest consular presence in the United States", 
                                        "a century ago", "Houston’s first consulate—the Consulate of Mexico—", "50% Consuls General and 50% Honorary Consuls", 
                                        "Europe", "38%", "Americas", "26%", "Asia & Oceania", "20%", "Africa", "16%", "(", ")"
                                        ], 
                                        "#000", 
                                        "500"
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>
            
            </div>

            <div className="subsection-2">
                <h2 id="become-member"><Highlight>Become a member</Highlight> of the Consular Corps of Houston organization</h2>

                <div className="member-content">
                    <div className="member-image">
                        <img src="sunset.jpg" alt="Houston sunset" />
                    </div>

                    <div className="member-grid">
                        <Accordion title={<div className="accordion-title"><img src={WhoIcon} alt="Who Icon" className="icon" /> WHO?</div>}>
                            {highlightText(becomeMember.find((section) => section.title === "WHO?").text, ["all consular officers", "emeriti consular officers"], "#000")}
                        </Accordion>

                        <Accordion title={<div className="accordion-title"><img src={HowIcon} alt="How Icon" className="icon" /> HOW?</div>}>
                            <ul>
                                {becomeMember[1].elements.map((elem, index) => (
                                    <li key={index}>{highlightText(elem, ["application form", "$200"], "#000")}</li>
                                ))}
                            </ul>
                        </Accordion>

                        <Accordion title={<div className="accordion-title"><img src={WhenIcon} alt="When Icon" className="icon" /> WHEN?</div>}>
                        <ul>
                            {becomeMember[2].elements.map((elem, index) => (
                                <li key={index}>{highlightText(elem, ["December 1st", "February 15th", "Annual Meeting"], "#000")}</li>
                            ))}
                        </ul>
                        </Accordion>
                    </div>
                </div>

                <div className="member-footer">
                    <p>Already a member or want to become one?</p>
                    <a href="/login" className="join-button">Join us!</a>
                </div>
            </div>

            <div class="subsection-3">
                <h2 id="organize-events">What kind of events do we organize?</h2>

                <div class="event-content">
                    <div class="event-grid">
                        <div class="event-info">
                            <p class="id-section">01</p>
                            <p class="event-section"><strong class="meet">MEET</strong> the leaders who inspire Houston’s greatness.</p>
                        </div>
                        <div class="event-info">
                            <p class="id-section">02</p>
                            <p class="event-section"><strong class="explore">EXPLORE</strong> the places that define Houston’s vision.</p>
                        </div>
                        <div class="event-info">
                            <p class="id-section">03</p>
                            <p class="event-section"><strong class="celebrate">CELEBRATE</strong> the traditions that unite Houston’s international community.</p>
                        </div>
                        <div class="event-info">
                            <p class="id-section">04</p>
                            <p class="event-section"><strong class="enjoy">ENJOY</strong> the experiences that make Houston unforgettable.</p>
                        </div>
                    </div>
                </div>
            </div>


            <div className="subsection-4">
                <h2 id="upcoming-events">Look at our upcoming events!</h2>

                {events.length === 0 ? (
                    <p>No upcoming events found.</p>
                ) : (
                    <div className="calendar-grid">
                        {events.slice(0, 4).map((event, index) => (
                            <div key={event.id} 
                            className={`calendar-row ${index % 2 === 0 ? "row-left" : "row-right"}`}>
                                {/* <div className="calendar-content"> */}
                                    {/* <h3>{event.title}</h3> */}
                                    <div className="calendar-bubble">
                                        <h3>{event.title} {event.recurring ? "(Recurring)" : ""}</h3>    
                                    </div>
                                    
                                    <div className="calendar-details">
                                        <p>
                                            {event.date
                                            ? new Date(event.date).toLocaleString("en-US", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                timeZone: "America/Chicago", // Use the time zone from the raw data
                                            })
                                            : "Date not available"}   
                                        </p>
                                        


                                        {/* <p>{formatDateTime(event.date)}</p> */}
                                        {/* <p>{event.date ? new Date(event.date).toLocaleString() : "Date not available"}</p> */}
                                        <a href={event.link} target="_blank" rel="noopener noreferrer">
                                            Click here for more information
                                        </a>

                                    </div>
                    

                                </div>
                            // </div>
                        ))}
                    </div>
                )}

                {events.length > 4 && (
                    <div className="event-footer">
                        <p>Check out all our exciting upcoming events!</p>
                        <a href="/program" className="join-button">Join us!</a>
                    </div>
                )}
                
            </div>
        </div>
    )
}

export default HomeView
