import { useState } from 'react'
import { useNavigate } from 'react-router-dom';

export function HomeBar() {
    const navigate = useNavigate()
    const navigateTo = (link) => {
        // how to navigate to another page?
        navigate(link)
    }

    const barSegments = [
        {link: '/', title: 'Logo'},
        {link: '/home', title: 'Home'},
        {link: '/exec-comm', title: 'Executive Committee'},
        {link: '/members', title: 'Members'},
        {link: '/program', title: 'Program'},
        {link: '/national-days', title: 'National Days'},
        {link: '/login', title: 'Login'}                        
    ]

    return (
        <nav className='home-bar'>
            <ul>
                {barSegments.map((segment, index) => (
                    <li key={index} onClick={() => navigateTo(segment.link)}>
                        {segment.title}
                    </li>
                ))}
            </ul>
        </nav>
    )
}