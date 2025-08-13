import React, { useState, useEffect } from 'react';
import { db, auth, handleSignOut } from './Login'; 
import { deleteUser } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import "./Profile.css";
import { countries } from 'countries-list';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const Profile = () => {
    const [isEditing, setIsEditing] = useState(true);
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        title: '',
        status: '',
        country: '',
        paymentYear: '',
        email: '',
        phoneNumber: '',
        socialMedia: '',
        websites: '',
        biography: '',
        profileImage: '',
        showEmail: false,
        showPhone: false,
        membershipPaymentAllowed: true,
        membershipPayment: false,
        membershipPaymentDate: '',
        membershipPaymentYear: '',
        activeStatus: false,
        isProfileComplete: false,
        isImported: false,
        phoneDisplay: true, // New field to control phone number visibility
    });
    const [originalUserData, setOriginalUserData] = useState(null); // Store original data

    const navigate = useNavigate();
    const nextYear = new Date().getFullYear() + 1;

    useEffect(() => {
        const fetchUserData = async () => {
            const userId = auth.currentUser?.uid;
            if (!userId) return;
            const userDoc = doc(db, 'users-ccoh', userId);
            const docSnap = await getDoc(userDoc);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserData({
                    ...data,
                    title: data.title || 'Consul General', // Default value for title
                    status: data.status || 'Current',      // Default value for status
                    email: auth.currentUser.email,
                    isImported: !!data.isImported,
                });
                setOriginalUserData({
                    ...data,
                    title: data.title || 'Consul General',
                    status: data.status || 'Current',
                    email: auth.currentUser.email,
                }); // Save original data
                setIsProfileComplete(data.isProfileComplete || false);
                setIsEditing(!(data.isProfileComplete));
            } else {
                const defaultData = {
                    title: 'Consul General',
                    status: 'Current',
                    email: auth.currentUser.email,
                };
                setUserData(prev => ({ ...prev, ...defaultData }));
                setOriginalUserData(prev => ({ ...prev, ...defaultData })); // Save original data
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        const handleNavigation = (e) => {
            const shouldPreventNavigation = !isProfileComplete && isEditing;
            if (shouldPreventNavigation) {
                e.preventDefault();
                alert('You must complete your profile before leaving this page.');
            }
        };
        window.addEventListener('popstate', handleNavigation);
        return () => window.removeEventListener('popstate', handleNavigation);
    }, [isProfileComplete, isEditing]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            const shouldPreventNavigation = !isProfileComplete && isEditing;
            if (shouldPreventNavigation) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isProfileComplete, isEditing]);

    useEffect(() => {
        const cleanup = auth.onAuthStateChanged(async (user) => {
            if (!user && auth.currentUser === null) {
                try {
                    const userId = auth.currentUser?.uid;
                    if (userId) {
                        await deleteDoc(doc(db, 'users-ccoh', userId));
                    }
                } catch (error) {
                    console.error('error cleaning up user profile:', error);
                }
            }
        });
        return () => cleanup();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUserData(prev => ({ ...prev, profileImage: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCancel = () => {
        setUserData(originalUserData); // Reset to original data
        setIsEditing(false); // Exit editing mode
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = auth.currentUser.uid;
        try {
            const updatedUser = {
                ...userData,
                title: userData.title || 'Consul General', // Ensure default value for title
                status: userData.status || 'Current',      // Ensure default value for status
                isProfileComplete: true,
                email: auth.currentUser.email,
            };
            const userDoc = doc(db, 'users-ccoh', userId);
            await setDoc(userDoc, updatedUser);

            // Fetch updated user data from Firestore
            const docSnap = await getDoc(userDoc);
            if (docSnap.exists()) {
                const updatedData = docSnap.data();
                setUserData(updatedData); // Update local state
                setOriginalUserData(updatedData); // Update original data
            }

            alert('Profile updated successfully!');
            setIsEditing(false);
            setIsProfileComplete(true);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        }
    };

    const handleDeleteAccount = async () => {
        if (!auth.currentUser) {
            alert('No user is currently signed in.');
            return;
        }
        const confirmDelete = window.confirm(
            'Are you sure you want to delete your account? This action cannot be undone. You will have to register and be approved again.'
        );
        if (confirmDelete) {
            try {
                const userId = auth.currentUser.uid;
                await deleteDoc(doc(db, 'users-ccoh', userId));
                await deleteUser(auth.currentUser);
                alert('Your account has been successfully deleted.');
            } catch (error) {
                console.error('Error deleting account:', error);
                if (error.code === 'auth/requires-recent-login') {
                    alert('Please sign out and sign in again to delete your account.');
                } else {
                    alert('Failed to delete account: ' + error.message);
                }
            }
        }
    };

    const importedFields = ['firstName','lastName','title','status','country'];


    // --- UI ---
    return (
        <div className="profile-container">
            <div className="profile-header">
                <h2>User Profile</h2>
                {!isEditing && (
                    <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
                        Edit
                    </button>
                )}
            </div>
            <p className="required-fields-note">
                Fields marked with <span className="required-asterisk">*</span> are required.
            </p>
            <form className="profile-form" onSubmit={handleSubmit}>
                <div className="profile-image-section">
                    <label htmlFor="profileImage" className="profile-image-label">
                        <img
                            src={userData.profileImage || '/default-profile.png'}
                            alt="Profile"
                            className="profile-image"
                        />
                        {isEditing && (
                            <input
                                type="file"
                                id="profileImage"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="profile-image-input"
                            />
                        )}
                    </label>
                    <div className="profile-name">
                        {userData.firstName} {userData.lastName}
                    </div>
                    <div className="profile-email">{userData.email}</div>
                </div>
                <div className="profile-fields">
                    <div className="profile-field">
                        <label>
                            First Name <span className="required-asterisk">*</span>
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            value={userData.firstName || ''}
                            onChange={handleChange}
                            required
                            disabled={!isEditing || (userData.isImported && importedFields.includes('firstName'))}
                            className="profile-input"
                            placeholder="Enter your first name"
                        />
                    </div>
                    <div className="profile-field">
                        <label>
                            Last Name <span className="required-asterisk">*</span>
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={userData.lastName || ''}
                            onChange={handleChange}
                            required
                            disabled={!isEditing || (userData.isImported && importedFields.includes('lastName'))}
                            className="profile-input"
                            placeholder="Enter your last name"
                        />
                    </div>
                    <div className="profile-field">
                        <label>
                            Title <span className="required-asterisk">*</span>
                        </label>
                        <select
                            name="title"
                            value={userData.title || ''}
                            onChange={handleChange}
                            required
                            disabled={!isEditing || (userData.isImported && importedFields.includes('title'))}
                            className="profile-input"
                        >
                            <option value="" disabled>Select Title</option>
                            <option value="Consul General">Consul General</option>
                            <option value="Honorary Consul">Honorary Consul</option>
                        </select>
                    </div>
                    <div className="profile-field">
                        <label>
                            Status <span className="required-asterisk">*</span>
                        </label>
                        <select
                            name="status"
                            value={userData.status || ''}
                            onChange={handleChange}
                            required
                            disabled={!isEditing || (userData.isImported && importedFields.includes('status'))}
                            className="profile-input"
                        >
                            <option value="" disabled>Select Status</option>
                            <option value="Current">Current</option>
                            <option value="Emeritus">Emeritus</option>
                        </select>
                    </div>
                    <div className="profile-field">
                        <label>
                            Country Represented <span className="required-asterisk">*</span>
                        </label>
                        <select
                            name="country"
                            value={userData.country || ''}
                            onChange={handleChange}
                            required
                            disabled={!isEditing || (userData.isImported && importedFields.includes('country'))}
                            className="profile-input"
                        >
                            {/* <option value="">Pre-filled from registration</option> */}
                            {/* <option value="United States">United States</option>
                            <option value="Canada">Canada</option>
                            <option value="Mexico">Mexico</option> */}

                            <option value="" disabled>Select Country</option>
                            {Object.values(countries).map((country) => (
                                <option key={country.name} value={country.name}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="profile-field">
                        <label>Social Media</label>
                        <input
                            type="text"
                            name="socialMedia"
                            value={userData.socialMedia || ''}
                            onChange={handleChange}
                            disabled={!isEditing || (userData.isImported && importedFields.includes('socialMedia'))}
                            className="profile-input"
                            placeholder="@socialmedia on Facebook"
                        />
                    </div>
                    <div className="profile-field">
                        <label>Website(s)</label>
                        <input
                            type="text"
                            name="websites"
                            value={userData.websites || ''}
                            onChange={handleChange}
                            disabled={!isEditing || (userData.isImported && importedFields.includes('websites'))}
                            className="profile-input"
                            placeholder="www.websiteexample.com"
                        />
                    </div>
                    <div className="profile-field">
                        <label>Biography</label>
                        <textarea
                            name="biography"
                            value={userData.biography || ''}
                            onChange={handleChange}
                            disabled={!isEditing || (userData.isImported && importedFields.includes('biography'))}
                            className="profile-input"
                            placeholder="Here is my example biography...."
                            style={{ minHeight: 60, resize: 'vertical' }}
                        />
                    </div>
                    <div className="profile-field">
                        <label>
                            Payment Year <span className="required-asterisk">*</span>
                        </label>
                        <select
                            name="paymentYear"
                            value={userData.paymentYear || ''}
                            onChange={handleChange}
                            required
                            disabled={!isEditing || (userData.isImported && importedFields.includes('paymentYear'))}
                            className="profile-input"
                        >
                            <option value="">Select Year</option>
                            <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                            <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                        </select>
                    </div>
                    {/* <div className="profile-field">
                        <label>
                            Phone Number <span className="required-asterisk">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={userData.phoneNumber || ''}
                            onChange={handleChange}
                            required
                            disabled={!isEditing}
                            className="profile-input"
                            pattern="^\+?\d{1,3}?[-.\s]?(\(?\d{1,4}?\))?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$"
                            placeholder="(999) 999-9999"
                        />
                    </div> */}

                    <div className="profile-field">
                        <label className="profile-label-with-toggle">
                            <span>
                                Phone Number <span className="required-asterisk">*</span>
                            </span>
                            <label className="phone-hide-toggle">
                                <input
                                    type="checkbox"
                                    checked={!userData.phoneDisplay}
                                    onChange={(e) =>
                                        setUserData(prev => ({ ...prev, phoneDisplay: !e.target.checked }))
                                    }
                                    disabled={!isEditing}
                                />
                                Keep this information hidden from other members
                            </label>
                        </label>

                        <PhoneInput
                            defaultCountry="US"
                            value={userData.phoneNumber}
                            onChange={(value) => setUserData(prev => ({ ...prev, phoneNumber: value }))}
                            disabled={!isEditing || (userData.isImported && importedFields.includes('phoneNumber'))}
                            className="profile-input"
                        />
                    </div>


                    <div className="profile-field">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={userData.email || ''}
                            disabled
                            className="profile-input"
                        />
                    </div>
                </div>
                <div className="profile-actions">
                    {isEditing ? (
                        <>
                            <button type="submit" className="profile-save-btn">
                                Save Profile
                            </button>
                            <button
                                type="button"
                                className="profile-cancel-btn"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                        </>
                    ) : null}
                </div>
            </form>
            {/* <div className="profile-public-section">
                <div className="profile-public-title">
                    Display on my public profile (open to other Consular Corps members only):
                </div>
                <div className="profile-public-checkboxes">
                    <label className="profile-public-checkbox">
                        <input
                            type="checkbox"
                            name="showEmail"
                            checked={userData.showEmail}
                            onChange={e => setUserData(prev => ({ ...prev, showEmail: e.target.checked }))}
                            disabled={!isEditing}
                        />
                        {userData.email}
                    </label>
                    <label className="profile-public-checkbox">
                        <input
                            type="checkbox"
                            name="showPhone"
                            checked={userData.showPhone}
                            onChange={e => setUserData(prev => ({ ...prev, showPhone: e.target.checked }))}
                            disabled={!isEditing}
                        />
                        {userData.phoneNumber}
                    </label>
                </div>
            </div> */}
            <div className="profile-bottom-buttons">
                <button
                    className="profile-pay-btn"
                    onClick={() => navigate('/cart')}
                    disabled={!userData.membershipPaymentAllowed} // Disable button if membershipPaymentAllowed is false
                >
                    Pay Membership
                </button>
                <button onClick={handleSignOut} className="profile-signout-btn">
                    Sign Out
                </button>
                <button
                    onClick={handleDeleteAccount}
                    className="profile-delete-btn"
                >
                    Delete Account
                </button>
            </div>
        </div>
    );
};

export default Profile;
