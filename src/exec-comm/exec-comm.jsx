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

      <div className="exec-comm-grid">
        {members.map((member) => (
          <div
            className="member-card"
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
                  alt={`${member.FirstName} ${member.LastName}`}
                  className="member-photo"
                />
                <h3>
                  {member.FirstName} {member.LastName}
                </h3>
                <p>
                  <strong>Position:</strong> {member.Position}
                </p>
              </div>
              <div className="card-back">
                <h3>
                  {member.FirstName} {member.LastName}
                </h3>
                <p>{member.Description || 'No description available.'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
);
}

export default ExecCommittee;
