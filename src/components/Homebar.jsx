import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './Homebar.css'
import { auth, handleSignOut } from '../login/Login'
import logo from '/logo.png'

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
        {link: '/home', title: 'Home'},
        {link: '/exec-comm', title: 'Executive Committee'},
        {link: '/members', title: 'Members'},
        {link: '/program', title: 'Program'},
        {link: '/national-days', title: 'National Days'},
    ]

    return (
        <nav className='home-bar'>
            <div className='logo' onClick={() => navigateTo('/')}>
                <img src='logo-removebg.png' alt='logo'/>
            </div>

            <button className='menu-toggle' onClick={toggleMenu}>☰</button>

            <ul className={`nav-links ${isMenu ? 'open' : ''}`}>
                {barSegments.map((segment, index) => (
                    <li key={index} onClick={() => navigateTo(segment.link)}>
                        {segment.title}
                    </li>
                ))}
                {!auth.currentUser && (
                    <li onClick={() => navigateTo('/login')}>Login</li>
                )}
                {auth.currentUser && (
                    <>
                        <li onClick={() => navigateTo('/profile')}>Profile</li>
                        <li onClick={handleSignOut} style={{ color: 'red', cursor: 'pointer' }}>
                            Sign Out
                        </li>
                    </>
                )}
            </ul>
        </nav>
    )
}