import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js'; // adjust path as needed
import './exec-comm.css'; // optional CSS

const ExecCommittee = () => {
  const [members, setMembers] = useState([]);
  
  const Highlight = ({ children }) => {
      return <span className="highlight">{children}</span>;
  };  

  const [flippedCards, setFlippedCards] = useState([]);

  const handleFlip = (id) => {
    setFlippedCards(prev =>
      prev.includes(id)
        ? prev.filter(cardId => cardId !== id)
        : [...prev, id]
    );
  };


  useEffect(() => {
    const fetchExecComm = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'exec-comm'));
        const execMembers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMembers(execMembers);
      } catch (error) {
        console.error("Error fetching exec-comm data:", error);
      }
    };

    fetchExecComm();
  }, []);
  return (
    <div className="exec-committee">
      <h2 class="section-title">
        Meet the <span class="highlight">Executive Committee Officers</span> of the Consular Corps of Houston.
      </h2>

      <p>
        Click each profile for more information.
      </p>

      <div className="exec-comm-grid">
        {members.map((member) => (
          <div
            className="members-card"
            key={member.id}
            onClick={() => handleFlip(member.id)}
          >
            <div
              className={`card-inner ${
                flippedCards.includes(member.id) ? 'flipped' : ''
              }`}
            >
              <div className="card-front">
                <img
                  src={member.photoURL}
                  alt={`${member.firstName} ${member.lastName}`}
                  className="member-photo"
                />
                <h3>
                  {member.firstName} {member.lastName}
                </h3>
                <p>
                  <strong>Position:</strong> {member.position}
                </p>
              </div>
              <div className="card-back">
                <h3>
                  {member.firstName} {member.lastName}
                </h3>
                <p>{member.description || 'No description available.'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
);
}

export default ExecCommittee;
