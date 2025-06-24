import { useState, useEffect } from 'react';
import { db, auth } from '../login/Login';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { FaFilter } from 'react-icons/fa';
import Select from 'react-select';
import './Members.css';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

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
    <div className="members-page">
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

      <ul className="member-list">
        {filteredMembers.map(member => {
          const showFull = isSignedIn && isActive;
          const name = showFull
            ? `${member.firstName} ${member.lastName}`
            : `${member.firstName} ${member.lastName?.charAt(0) || ''}.`;

          return (
            <li key={member.id} className="member-card">
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
