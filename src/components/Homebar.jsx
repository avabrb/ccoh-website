import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Homebar.css';
import { auth, db, handleSignOut } from '../login/Login';
import { doc, getDoc } from 'firebase/firestore';

export function HomeBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenu, setMenu] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchAdminStatus = async () => {
            if (auth.currentUser) {
                const userDoc = doc(db, 'users-ccoh', auth.currentUser.uid);
                const docSnap = await getDoc(userDoc);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setIsAdmin(userData.admin || false);
                }
            }
        };

        fetchAdminStatus();
    }, []);

    const navigateTo = (link) => {
        navigate(link);
        setMenu(false);
    };

    const toggleMenu = () => {
        setMenu(!isMenu);
    };

    const barSegments = [
        { link: '/home', title: 'Home' },
        { link: '/exec-comm', title: 'Executive Committee' },
        { link: '/members', title: 'Members' },
        { link: '/program', title: 'Program' },
        { link: '/national-days', title: 'National Days' },
    ];

    return (
        <nav className="home-bar">
            <div className="logo" onClick={() => navigateTo('/')}>
                <img src="logo-removebg.png" alt="logo" />
            </div>

            <button className="menu-toggle" onClick={toggleMenu}>☰</button>

            <ul className={`nav-links ${isMenu ? 'open' : ''}`}>
                {barSegments.map((segment, index) => (
                    <li
                        key={index}
                        onClick={() => navigateTo(segment.link)}
                        className={location.pathname === segment.link ? 'nav-active' : ''}
                    >
                        {segment.title}
                    </li>
                ))}
                {!auth.currentUser && (
                    <li onClick={() => navigateTo('/login')}>Login</li>
                )}
                {auth.currentUser && (
                    <>
                        <li onClick={() => navigateTo('/profile')}>Profile</li>
                        {isAdmin && <li onClick={() => navigateTo('/admin')}>Admin</li>}
                        <li onClick={handleSignOut} style={{ color: 'red', cursor: 'pointer' }}>
                            Sign Out
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}