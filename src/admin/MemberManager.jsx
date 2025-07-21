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
        showEmail: updatedFields.showEmail ?? false,
        showPhone: updatedFields.showPhone ?? false,
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
        console.log('Modal should render for:', editingUser),
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Member: {editingUser.firstName} {editingUser.lastName}</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await editUser(editingUser.id, editFields);
                setEditingUser(null);
              }}
            >
              {/* Example for all fields */}
              <label>
                First Name:
                <input
                  value={editFields.firstName || ''}
                  onChange={e => setEditFields(f => ({ ...f, firstName: e.target.value }))}
                />
              </label>
              <label>
                Last Name:
                <input
                  value={editFields.lastName || ''}
                  onChange={e => setEditFields(f => ({ ...f, lastName: e.target.value }))}
                />
              </label>
              <label>
                Title:
                <input
                  value={editFields.title || ''}
                  onChange={e => setEditFields(f => ({ ...f, title: e.target.value }))}
                />
              </label>
              <label>
                Status:
                <input
                  value={editFields.status || ''}
                  onChange={e => setEditFields(f => ({ ...f, status: e.target.value }))}
                />
              </label>
              <label>
                Country:
                <input
                  value={editFields.country || ''}
                  onChange={e => setEditFields(f => ({ ...f, country: e.target.value }))}
                />
              </label>
              <label>
                Payment Year:
                <input
                  value={editFields.paymentYear || ''}
                  onChange={e => setEditFields(f => ({ ...f, paymentYear: e.target.value }))}
                />
              </label>
              <label>
                Email:
                <input
                  value={editFields.email || ''}
                  onChange={e => setEditFields(f => ({ ...f, email: e.target.value }))}
                />
              </label>
              <label>
                Phone Number:
                <input
                  value={editFields.phoneNumber || ''}
                  onChange={e => setEditFields(f => ({ ...f, phoneNumber: e.target.value }))}
                />
              </label>
              <label>
                Social Media:
                <input
                  value={editFields.socialMedia || ''}
                  onChange={e => setEditFields(f => ({ ...f, socialMedia: e.target.value }))}
                />
              </label>
              <label>
                Websites:
                <input
                  value={editFields.websites || ''}
                  onChange={e => setEditFields(f => ({ ...f, websites: e.target.value }))}
                />
              </label>
              <label>
                Biography:
                <textarea
                  value={editFields.biography || ''}
                  onChange={e => setEditFields(f => ({ ...f, biography: e.target.value }))}
                />
              </label>
              <label>
                Profile Image URL:
                <input
                  value={editFields.profileImage || ''}
                  onChange={e => setEditFields(f => ({ ...f, profileImage: e.target.value }))}
                />
              </label>
              <label>
                Show Email:
                <input
                  type="checkbox"
                  checked={!!editFields.showEmail}
                  onChange={e => setEditFields(f => ({ ...f, showEmail: e.target.checked }))}
                />
              </label>
              <label>
                Show Phone:
                <input
                  type="checkbox"
                  checked={!!editFields.showPhone}
                  onChange={e => setEditFields(f => ({ ...f, showPhone: e.target.checked }))}
                />
              </label>
              <label>
                Membership Payment Allowed:
                <input
                  type="checkbox"
                  checked={!!editFields.membershipPaymentAllowed}
                  onChange={e => setEditFields(f => ({ ...f, membershipPaymentAllowed: e.target.checked }))}
                />
              </label>
              <label>
                Membership Payment:
                <input
                  type="checkbox"
                  checked={!!editFields.membershipPayment}
                  onChange={e => setEditFields(f => ({ ...f, membershipPayment: e.target.checked }))}
                />
              </label>
              <label>
                Membership Payment Date:
                <input
                  value={editFields.membershipPaymentDate || ''}
                  onChange={e => setEditFields(f => ({ ...f, membershipPaymentDate: e.target.value }))}
                />
              </label>
              <label>
                Membership Payment Year:
                <input
                  value={editFields.membershipPaymentYear || ''}
                  onChange={e => setEditFields(f => ({ ...f, membershipPaymentYear: e.target.value }))}
                />
              </label>
              <label>
                Active Status:
                <input
                  type="checkbox"
                  checked={!!editFields.activeStatus}
                  onChange={e => setEditFields(f => ({ ...f, activeStatus: e.target.checked }))}
                />
              </label>
              <label>
                Is Profile Complete:
                <input
                  type="checkbox"
                  checked={!!editFields.isProfileComplete}
                  onChange={e => setEditFields(f => ({ ...f, isProfileComplete: e.target.checked }))}
                />
              </label>
              <div style={{ marginTop: 16 }}>
                <button className="btn btn-success" type="submit">Save</button>
                <button className="btn btn-danger" type="button" onClick={() => setEditingUser(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
