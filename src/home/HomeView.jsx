import Slider from "react-slick"
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { homeImages } from "./HomeModel"

const Highlight = ({ children }) => {
    return <span className="highlight">{children}</span>;
  };  

const HomeView = ({ events, images }) => {
    // const images = images

    const sliderSettings ={
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
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
            text: "Eligible Members are consular officers (career diplomats and honorary consular officers) and emeriti consular officers. All the consular officers serving in the Greater Houston region, accredited by their respective governments to the United States, and holding an Exequatur (or equivalent document) issued by the United States Government are eligible Members."
        },
        {
            title: "HOW?",
            text: (
                <ul>
                    <li>Complete the membership application form.</li>
                    <li>Pay the annual membership fee of $200.</li>
                </ul>
            )
        },
        {
            title: "WHEN?",
            text: (
                <ul>
                    <li>Membership Campaign: Opens on December 1st of the previous year.</li>
                    <li>Deadline: Finalize your membership before February 15th each year.</li>
                    <li>Annual Meeting in February.</li>
                </ul>
            )
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
            <h1 className="title">The <Highlight> Consular Corps of Houston </Highlight>: A Dynamic, Diverse, and Global Community</h1>

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
                                <p className="bold-section">{section.boldText}</p>
                                <p className="text-section">{section.text}</p>

                            </div>
                        ))}
                    </div>

                </div>
            
            </div>

            <div className="subsection-2">
                <h2 id="become-member">Become a member of the Consular Corps of Houston</h2>

                <div className="member-content">
                    <div className="member-image">
                        <img src="houstonsunset.jpg" alt="Houston sunset"/>
                    </div>

                    <div className="member-grid">
                        {becomeMember.map((section) => (
                            <div key={section.title} className="member-info">
                                <p className="question-section">{section.title}</p>
                                <p className="answer-section">{section.text}</p>

                            </div>
                        ))}
                    </div>

                    <div className="member-footer">
                        <p>Already a member or want to become one?</p>
                        {/* <button className="join-button">Join us!</button> */}
                        <a href="/login" className="join-button">Join us!</a>
                    </div>

                </div>
            
            </div>

            
            <div className="subsection-3">
                <h2 id="organize-events">What kind of events do we organize?</h2>

                <div className="event-content">
                    <div className="event-grid">
                        {organizeEvents.map((section) => (
                            <div key={section.title} className="event-info">
                                <p className="id-section">{section.id}</p>
                                <p className="event-section">{section.text}</p>
                            </div>
                        ))}
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
