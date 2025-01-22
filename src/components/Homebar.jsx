import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './Homebar.css'

export function HomeBar() {
    const navigate = useNavigate()
    const [isMenu, setMenu] = useState("false")
    
    const navigateTo = (link) => {
        navigate(link)
        setMenu("false")
    }

    const toggleMenu = () => {
        setMenu(!isMenu)
    }

    const barSegments = [
        {link: '/', title: ''},
        {link: '/home', title: 'Home'},
        {link: '/exec-comm', title: 'Executive Committee'},
        {link: '/members', title: 'Members'},
        {link: '/program', title: 'Program'},
        {link: '/national-days', title: 'National Days'},
        {link: '/login', title: 'Login'}                        
    ]

    return (
        <nav className='home-bar'>
            <div className='logo' onClick={() => navigateTo('/')}>
                <img src = 'logo-removebg.png' alt='logo'/>
            </div>

            <button className='menu-toggle' onClick={toggleMenu}>☰</button>

            <ul className={`nav-links ${isMenu ? 'open' : ''}`}>
                {barSegments.map((segment, index) => (
                    <li key={index} onClick={() => navigateTo(segment.link)}>
                        {segment.title}
                    </li>
                ))}
            </ul>
        </nav>
    )
}