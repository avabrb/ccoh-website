import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  writeBatch,
  doc,
  updateDoc,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../login/Login.jsx';
import './Admin.css';
import { getAuth } from "firebase/auth";
import { countries } from 'countries-list';

export default function MemberManager() {
  const [members, setMembers] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [editingUser, setEditingUser] = useState(null); // user object being edited or null
  const [editFields, setEditFields] = useState({});     // form fields for editing
  const auth = getAuth();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users-ccoh'), snap => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // toggle single row
  const toggleSelect = id => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  // select / deselect all
  const allIds = members.map(m => m.id);
  const isAllSelected = selected.size === members.length && members.length > 0;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allIds));
    }
  };

  // bulk actions
  const bulkUpdate = async action => {
    if (!selected.size) return;
    const batch = writeBatch(db);
    selected.forEach(id => {
      const ref = doc(db, 'users-ccoh', id);
      if (action === 'markPaid') {
        batch.update(ref, {
          membershipPayment: true,
          membershipPaymentAllowed: false,
          membershipPaymentDate: serverTimestamp(),
          membershipPaymentYear: new Date().getFullYear(),
          activeStatus: true
        });
      } else if (action === 'bypass') {
        batch.update(ref, { activeStatus: true });
      } else if (action === 'markUnpaid') {
        batch.update(ref, {
          membershipPayment: false,
          membershipPaymentAllowed: true,
          activeStatus: false,
          membershipPaymentDate: null,
          membershipPaymentYear: null
        });
      }
    });
    await batch.commit();
    setSelected(new Set());
  };

  // single‐row actions
  const rowAction = async (id, action) => {
    const ref = doc(db, 'users-ccoh', id);
    if (action === 'markPaid') {
      await updateDoc(ref, {
        membershipPayment: true,
        membershipPaymentAllowed: false,
        membershipPaymentDate: serverTimestamp(),
        membershipPaymentYear: new Date().getFullYear(),
        activeStatus: true
      });
    } else if (action === 'bypass') {
      await updateDoc(ref, { activeStatus: true });
    } else if (action === 'markUnpaid') {
      await updateDoc(ref, {
        membershipPayment: false,
        membershipPaymentAllowed: true,
        activeStatus: false,
        membershipPaymentDate: null,
        membershipPaymentYear: null
      });
    }
  };

  // delete user
const deleteUser = async (userId, userName) => {
    if (!window.confirm(
      `Are you sure you want to delete user "${userName}"? This cannot be undone.`
    )) return;

    try {
      const auth = getAuth();
      const idToken = await auth.currentUser.getIdToken(/* forceRefresh */ true);

      const resp = await fetch(
        "https://us-central1-website-f9d19.cloudfunctions.net/deleteUser",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`,
          },
          body: JSON.stringify({ uid: userId }),
        }
      );

      if (!resp.ok) {
        throw new Error(await resp.text());
      }

      alert("User deleted successfully.");
    } catch (e) {
      alert("Error deleting user: " + e.message);
    }
  };

  // edit user
  const editUser = async (userId, updatedFields) => {
    try {
      await updateDoc(doc(db, 'users-ccoh', userId), {
        firstName: updatedFields.firstName ?? '',
        lastName: updatedFields.lastName ?? '',
        title: updatedFields.title ?? '',
        status: updatedFields.status ?? '',
        country: updatedFields.country ?? '',
        paymentYear: updatedFields.paymentYear ?? '',
        email: updatedFields.email ?? '',
        phoneNumber: updatedFields.phoneNumber ?? '',
        socialMedia: updatedFields.socialMedia ?? '',
        websites: updatedFields.websites ?? '',
        biography: updatedFields.biography ?? '',
        profileImage: updatedFields.profileImage ?? '',
        showFullName: updatedFields.showFullName ?? false,
        showCountry: updatedFields.showCountry ?? false,
        showEmail: updatedFields.showEmail ?? false,
        showPhone: updatedFields.showPhone ?? false,
        showSocialMedia: updatedFields.showSocialMedia ?? false,
        showWebsites: updatedFields.showWebsites ?? false,
        showBiography: updatedFields.showBiography ?? false,
        membershipPaymentAllowed: updatedFields.membershipPaymentAllowed ?? false,
        membershipPayment: updatedFields.membershipPayment ?? false,
        membershipPaymentDate: updatedFields.membershipPaymentDate ?? '',
        membershipPaymentYear: updatedFields.membershipPaymentYear ?? '',
        activeStatus: updatedFields.activeStatus ?? false,
        isProfileComplete: updatedFields.isProfileComplete ?? false,
        isImported: true
      });
      alert('User updated successfully.');
      // Optionally refresh user list here
    } catch (error) {
      alert('Error updating user: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Manage Members</h2>

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => bulkUpdate('markPaid')} disabled={!selected.size}>
          Mark Payment Done
        </button>
        <button onClick={() => bulkUpdate('bypass')} disabled={!selected.size}>
          Bypass Payment (Activate)
        </button>
        <button onClick={() => bulkUpdate('markUnpaid')} disabled={!selected.size}>
          Mark Unpaid / Inactive
        </button>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Paid?</th>
              <th>Active?</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.has(m.id)}
                    onChange={() => toggleSelect(m.id)}
                  />
                </td>
                <td>{m.firstName} {m.lastName}</td>
                <td>{m.email}</td>
                {/* <td>{m.membershipPayment ? '✅' : '❌'}</td> */}
                <td>
                  <span className={`status-icon ${m.membershipPayment ? 'check' : 'cross'}`}></span>
                </td>
                {/* <td>{m.activeStatus ? '✅' : '❌'}</td> */}
                <td>
                  <span className={`status-icon ${m.activeStatus ? 'check' : 'cross'}`}></span>
                </td>
                <td>
                  <div className='action-buttons'>
                    <button className="btn btn-primary" onClick={() => rowAction(m.id, 'markPaid')}>Mark Paid</button>
                    <button className="btn btn-success" onClick={() => rowAction(m.id, 'bypass')}>Activate</button>
                    <button className="btn btn-primary" onClick={()=> rowAction(m.id, 'markUnpaid')}>Mark Unpaid</button>
                    <button className="btn btn-danger" onClick={() => deleteUser(m.id, `${m.firstName} ${m.lastName}`)}>Delete</button>
                    <button className="btn btn-primary" onClick={() => {
                      console.log('Editing:', m);
                      setEditingUser(m);
                      setEditFields({ ...m }); // prefill with current user data
                    }}>Edit</button>
                    <button
                    className="btn btn-secondary"
                    onClick={async () => {
                      try {
                        const resp = await fetch(
                          "https://us-central1-website-f9d19.cloudfunctions.net/resendPasswordLink",
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              "Authorization": `Bearer ${await auth.currentUser.getIdToken()}`
                            },
                            body: JSON.stringify({ email: m.email })    // or use m.email field
                          }
                        );
                        if (!resp.ok) throw new Error(await resp.text());
                        alert("Password setup link resent!");
                      } catch (e) {
                        alert("Error: " + e.message);
                      }
                    }}
                  >
                    Resend Link
                  </button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>



      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Member: {editingUser.firstName} {editingUser.lastName}</h3>
            <form className="modal-form" id="edit-member-form" onSubmit={async (e) => {
  e.preventDefault();
  await editUser(editingUser.id, editFields);
  setEditingUser(null);
}}>
  <section className="form-section">
    <h4>Profile Information</h4>
    <div className="profile-fields">
      <div className="form-group">
        <label htmlFor="firstName">First Name:</label>
        <input
          id="firstName"
          type="text"
          value={editFields.firstName || ''}
          onChange={e => setEditFields(f => ({ ...f, firstName: e.target.value }))}
          className="profile-input"
        />
      </div>
      <div className="form-group">
        <label htmlFor="lastName">Last Name:</label>
        <input
          id="lastName"
          type="text"
          value={editFields.lastName || ''}
          onChange={e => setEditFields(f => ({ ...f, lastName: e.target.value }))}
          className="profile-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="title">Title:</label>
        <select
          id="title"
          value={editFields.title || ''}
          onChange={e => setEditFields(f => ({ ...f, title: e.target.value }))}
          className="profile-input"
        >
          <option value="" disabled>Select Title</option>
          <option value="Consul General">Consul General</option>
          <option value="Honorary Consul">Honorary Consul</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="status">Status:</label>
        <select
          id="status"
          value={editFields.status || ''}
          onChange={e => setEditFields(f => ({ ...f, status: e.target.value }))}
          className="profile-input"
        >
          <option value="" disabled>Select Status</option>
          <option value="Current">Current</option>
          <option value="Emeritus">Emeritus</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="country">Country:</label>
        <select
          id="country"
          value={editFields.country || ''}
          onChange={e => setEditFields(f => ({ ...f, country: e.target.value }))}
          className="profile-input"
        >
          <option value="" disabled>Select Country</option>
          {Object.values(countries).map((country) => (
            <option key={country.name} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={editFields.email || ''}
          onChange={e => setEditFields(f => ({ ...f, email: e.target.value }))}
          className="profile-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="phoneNumber">Phone Number:</label>
        <input
          id="phoneNumber"
          type="tel"
          value={editFields.phoneNumber || ''}
          onChange={e => setEditFields(f => ({ ...f, phoneNumber: e.target.value }))}
          className="profile-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="socialMedia">Social Media:</label>
        <input
          id="socialMedia"
          type="text"
          value={editFields.socialMedia || ''}
          onChange={e => setEditFields(f => ({ ...f, socialMedia: e.target.value }))}
          className="profile-input"
          placeholder="@socialmedia on Facebook"
        />
      </div>

      <div className="form-group">
        <label htmlFor="websites">Websites:</label>
        <input
          id="websites"
          type="text"
          value={editFields.websites || ''}
          onChange={e => setEditFields(f => ({ ...f, websites: e.target.value }))}
          className="profile-input"
          placeholder="www.example.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="profileImage">Profile Image URL:</label>
        <input
          id="profileImage"
          type="text"
          value={editFields.profileImage || ''}
          onChange={e => setEditFields(f => ({ ...f, profileImage: e.target.value }))}
          className="profile-input"
        />
      </div>

      <div className="form-group full-width">
        <label htmlFor="biography">Biography:</label>
        <textarea
          id="biography"
          value={editFields.biography || ''}
          onChange={e => setEditFields(f => ({ ...f, biography: e.target.value }))}
          className="profile-input"
          style={{ minHeight: 60, resize: 'vertical' }}
        />
      </div>
    </div>
  </section>

  {/* Settings Sections */}
  <div className="settings-sections">
    <section className="settings-section">
      <h4>Member Status</h4>
      <div className="status-grid">
        <div className="checkbox-grid">
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={!!editFields.membershipPaymentAllowed}
              onChange={e => setEditFields(f => ({ ...f, membershipPaymentAllowed: e.target.checked }))}
            />
            Membership Payment Allowed
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={!!editFields.membershipPayment}
              onChange={e => setEditFields(f => ({ ...f, membershipPayment: e.target.checked }))}
            />
            Membership Payment
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={!!editFields.activeStatus}
              onChange={e => setEditFields(f => ({ ...f, activeStatus: e.target.checked }))}
            />
            Active Status
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={!!editFields.isProfileComplete}
              onChange={e => setEditFields(f => ({ ...f, isProfileComplete: e.target.checked }))}
            />
            Profile Complete
          </label>
        </div>
        <div className="payment-info">
          <div className="form-group">
            <label htmlFor="paymentYear">Payment Year:</label>
            <select
              id="paymentYear"
              value={editFields.membershipPaymentYear || ''}
              onChange={e => setEditFields(f => ({ ...f, membershipPaymentYear: e.target.value }))}
              className="profile-input"
            >
              <option value="">Select Year</option>
              <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
              <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
            </select>
          </div>
          <div className="form-group">
            <label>Last Payment:</label>
            <div className="payment-date">
              {editFields.membershipPaymentDate ? new Date(editFields.membershipPaymentDate.seconds * 1000).toLocaleDateString() : 'No payment recorded'}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="settings-section">
      <h4>Display Preferences</h4>
      <div className="checkbox-grid">
        <label className="checkbox-item">
          <input
            type="checkbox"
            checked={!!editFields.showFullName}
            onChange={e => setEditFields(f => ({ ...f, showFullName: e.target.checked }))}
          />
          Show Full Name
        </label>
        <label className="checkbox-item">
          <input
            type="checkbox"
            checked={!!editFields.showCountry}
            onChange={e => setEditFields(f => ({ ...f, showCountry: e.target.checked }))}
          />
          Show Country
        </label>
        <label className="checkbox-item">
          <input
            type="checkbox"
            checked={!!editFields.showEmail}
            onChange={e => setEditFields(f => ({ ...f, showEmail: e.target.checked }))}
          />
          Show Email
        </label>
        <label className="checkbox-item">
          <input
            type="checkbox"
            checked={!!editFields.showPhone}
            onChange={e => setEditFields(f => ({ ...f, showPhone: e.target.checked }))}
          />
          Show Phone
        </label>
        <label className="checkbox-item">
          <input
            type="checkbox"
            checked={!!editFields.showSocialMedia}
            onChange={e => setEditFields(f => ({ ...f, showSocialMedia: e.target.checked }))}
          />
          Show Social Media
        </label>
        <label className="checkbox-item">
          <input
            type="checkbox"
            checked={!!editFields.showWebsites}
            onChange={e => setEditFields(f => ({ ...f, showWebsites: e.target.checked }))}
          />
          Show Website(s)
        </label>
        <label className="checkbox-item">
          <input
            type="checkbox"
            checked={!!editFields.showBiography}
            onChange={e => setEditFields(f => ({ ...f, showBiography: e.target.checked }))}
          />
          Show Biography
        </label>
      </div>
    </section>
  </div>
</form>

<div className="modal-footer">
  <button className="btn btn-success" type="submit" form="edit-member-form">
    Save
  </button>
  <button
    className="btn btn-danger"
    type="button"
    onClick={() => setEditingUser(null)}
  >
    Cancel
  </button>
</div>
          </div>
        </div>
      )}
    </div>
  );
}
