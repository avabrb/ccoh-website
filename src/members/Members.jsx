import { useState, useEffect } from 'react';
import { db, auth } from '../login/Login';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { FaFilter } from 'react-icons/fa';
import Select from 'react-select';
import './Members.css';
import '../exec-comm/exec-comm.css'; 

const Members = () => {
  const [members, setMembers] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [flippedCards, setFlippedCards] = useState([]);

  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedTitles, setSelectedTitles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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

  const uniqueCountries = [...new Set(members.map(m => m.country).filter(Boolean))];
  const uniqueTitles = [...new Set(members.map(m => m.title).filter(Boolean))];

  const filteredMembers = members.filter(member => {
    const matchesCountry = selectedCountries.length === 0 || selectedCountries.includes(member.country);
    const matchesTitle = selectedTitles.length === 0 || selectedTitles.includes(member.title);
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      member.firstName?.toLowerCase().includes(query) ||
      member.lastName?.toLowerCase().includes(query) ||
      member.country?.toLowerCase().includes(query) ||
      member.title?.toLowerCase().includes(query);

    return matchesCountry && matchesTitle && matchesSearch;
  });

  const toggleFilter = (value, setter, currentState) => {
    if (currentState.includes(value)) {
      setter(currentState.filter(item => item !== value));
    } else {
      setter([...currentState, value]);
    }
  };

  const clearFilters = () => {
    setSelectedCountries([]);
    setSelectedTitles([]);
    setSearchQuery('');
  };

  return (
    <div className="exec-committee">
      <h2 className="section-title">
        Meet the <span className="highlight">Members</span> of the Consular Corps of Houston
      </h2>

      <p>
        Click each profile for more information.
      </p>

      {isActive && (
        <>
          <div className="top-bar">
            <input
              type="text"
              placeholder="Search by name, country, or title"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="inline-search"
            />
            <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
              <FaFilter />
            </button>
          </div>

          {showFilters && (
            <div className="filter-menu">
              <div className="filter-group">
                <strong>Filter by Country:</strong>
                <Select
                  isMulti
                  options={uniqueCountries.map(country => ({ value: country, label: country }))}
                  value={selectedCountries.map(c => ({ value: c, label: c }))}
                  onChange={(selected) => setSelectedCountries(selected.map(s => s.value))}
                  className="country-select"
                  placeholder="Select countries..."
                />
              </div>

              <div className="filter-group">
                <strong>Filter by Title:</strong>
                {uniqueTitles.map(title => (
                  <label key={title} className="filter-label">
                    <input
                      type="checkbox"
                      checked={selectedTitles.includes(title)}
                      onChange={() => toggleFilter(title, setSelectedTitles, selectedTitles)}
                    />
                    {title}
                  </label>
                ))}
              </div>

              <button className="clear-button" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </>
      )}

      <div className="exec-comm-grid">
        {filteredMembers.map((member) => (
          <div
            className="members-card"
            key={member.id}
            onClick={() =>
              setFlippedCards((prev) =>
                prev.includes(member.id)
                  ? prev.filter((id) => id !== member.id)
                  : [...prev, member.id]
              )
            }
          >
            <div className={`card-inner ${flippedCards.includes(member.id) ? 'flipped' : ''}`}>
              <div className="card-front">
                <img
                  src={member.profileImage || '/default-profile.png'}
                  alt={`${member.firstName} ${member.lastName}`}
                  className="member-photo"
                />
                <h3>
                  {(isSignedIn && isActive && member.showFullName)
                    ? `${member.firstName} ${member.lastName}`
                    : `${member.firstName} ${member.lastName?.charAt(0)}.`}
                </h3>
                <p><strong>{member.title}</strong></p>
              </div>
              <div className="card-back">
                {isSignedIn && isActive ? (
                  <>
                    <h3>
                      {member.showFullName 
                        ? `${member.firstName} ${member.lastName}`
                        : `${member.firstName} ${member.lastName?.charAt(0)}.`}
                    </h3>
                    {member.showCountry && <p>{member.country}</p>}
                    {member.showEmail && <p>{member.email}</p>}
                    {member.showPhone && <p>{member.phoneNumber}</p>}
                    {member.showSocialMedia && member.socialMedia && <p>{member.socialMedia}</p>}
                    {member.showWebsites && member.websites && <p>{member.websites}</p>}
                    {member.showBiography && member.biography && <p className="member-biography">{member.biography}</p>}
                    {!member.showCountry && !member.showEmail && !member.showPhone && 
                     !member.showSocialMedia && !member.showWebsites && !member.showBiography && 
                      <p>No additional information has been shared by this member.</p>}
                  </>
                ) : (
                  <>
                    <h3>{member.firstName} {member.lastName?.charAt(0)}.</h3>
                    <p>You must be an active member to see details. Contact the administrator if you believe this is a mistake.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

};

export default Members;
