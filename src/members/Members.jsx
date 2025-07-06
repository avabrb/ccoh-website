import React, { useState, useEffect } from 'react';
import { db, auth } from '../login/Login';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import './Members.css';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      const user = auth.currentUser;

      if (user) {
        setIsSignedIn(true);
        const currentUserDoc = await getDoc(doc(db, 'users-ccoh', user.uid));
        const currentUserData = currentUserDoc.exists() ? currentUserDoc.data() : null;
        setIsActive(currentUserData?.activeStatus || false);
      }

      const membersSnapshot = await getDocs(collection(db, 'users-ccoh'));
      const membersList = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembers(membersList);
    };

    fetchMembers();
  }, []);
  
  return (
    <div className="members-page">
        <h1>Member Directory</h1>
        <ul className="member-list">
            {members.map(member => {
            const showFull = isSignedIn && isActive;
            const name = showFull
                ? `${member.firstName} ${member.lastName}`
                : `${member.firstName} ${member.lastName?.charAt(0) || ''}.`;

            return (
                <li key={member.id} className="members-card">
                <img
                    src={member.profileImage || '/default-profile.png'}
                    alt={`${member.firstName}'s profile`}
                    className="member-avatar"
                />
                <div className="member-info">
                    <strong>{name}</strong>
                    {showFull && (
                    <>
                        <div>{member.title}</div>
                        <div>{member.country}</div>
                        <div>{member.email}</div>
                        {/* <div>{formatPhone(member.phoneNumber)}</div> */}
                        <div>{member.phoneNumber}</div>
                    </>
                    )}
                </div>
                </li>
            );
            })}
        </ul>
        </div>
  );
};

export default Members;
