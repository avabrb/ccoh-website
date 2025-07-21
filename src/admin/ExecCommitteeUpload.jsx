// ExecCommitteeManager.jsx

import React, { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase.js';

export default function ExecCommitteeManager() {
  const [members, setMembers]       = useState([]);
  const [editingId, setEditingId]   = useState(null);
  const [adding, setAdding]         = useState(false);
  const [form, setForm]             = useState({
    firstName:   '',
    lastName:    '',
    position:    '',
    description: ''
  });

  // 1) Listen to changes in the 'exec-comm' collection
  useEffect(() => {
    return onSnapshot(
      collection(db, 'exec-comm'),
      snap => setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  // 2) Start editing an existing member
  const startEdit = member => {
    setEditingId(member.id);
    setAdding(false);
    setForm({
      firstName:   member.firstName   || '',
      lastName:    member.lastName    || '',
      position:    member.position    || '',
      description: member.description || ''
    });
  };

  // 3) Save updates to Firestore
  const save = async id => {
    try {
      const ref = doc(db, 'exec-comm', id);
      await updateDoc(ref, {
        firstName:   form.firstName,
        lastName:    form.lastName,
        position:    form.position,
        description: form.description
      });
      setEditingId(null);
    } catch (err) {
      console.error('Error saving exec-comm member:', err);
      alert('Failed to save changes');
    }
  };

  // 4) Delete a member via your deleteUser cloud function
  const remove = async (id, name) => {
    if (!window.confirm(
      `Are you sure you want to delete exec committee member "${name}"? This cannot be undone.`
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
          body: JSON.stringify({ uid: id }),
        }
      );

      if (!resp.ok) {
        throw new Error(await resp.text());
      }

      alert("Exec committee member deleted successfully.");
    } catch (e) {
      console.error('Error deleting exec-comm member:', e);
      alert("Error deleting member: " + e.message);
    }
  };

  // 5) Create a new member
  const createMember = async () => {
    if (!form.firstName || !form.lastName || !form.position) {
      alert('First name, last name & position are required');
      return;
    }
    try {
      await addDoc(collection(db, 'exec-comm'), {
        firstName:   form.firstName,
        lastName:    form.lastName,
        position:    form.position,
        description: form.description
      });
      setAdding(false);
      setForm({ firstName: '', lastName: '', position: '', description: '' });
    } catch (err) {
      console.error('Error adding exec-comm member:', err);
      alert('Failed to add member');
    }
  };

  return (
    <div>
      <h2>Manage Executive Committee</h2>

      {/* Add Member Button */}
      <button
        className="btn btn-primary"
        onClick={() => {
          setAdding(true);
          setEditingId(null);
          setForm({ firstName: '', lastName: '', position: '', description: '' });
        }}
        disabled={adding || editingId !== null}
        style={{ marginBottom: '12px' }}
      >
        Add Member
      </button>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Inline row for adding */}
            {adding && (
              <tr>
                <td>
                  <input
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    placeholder="First"
                  />
                  <input
                    value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    placeholder="Last"
                  />
                </td>
                <td>
                  <input
                    value={form.position}
                    onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                    placeholder="Position"
                  />
                </td>
                <td>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Description"
                  />
                </td>
                <td>
                  <button className="btn btn-success" onClick={createMember}>Save</button>
                  <button className="btn btn-danger" onClick={() => setAdding(false)}>Cancel</button>
                </td>
              </tr>
            )}

            {/* Existing members */}
            {members.map(m => (
              <tr key={m.id}>
                <td>
                  {editingId === m.id ? (
                    <>
                      <input
                        value={form.firstName}
                        onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                        placeholder="First"
                      />
                      <input
                        value={form.lastName}
                        onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                        placeholder="Last"
                      />
                    </>
                  ) : (
                    `${m.firstName} ${m.lastName}`
                  )}
                </td>
                <td>
                  {editingId === m.id ? (
                    <input
                      value={form.position}
                      onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                      placeholder="Position"
                    />
                  ) : (
                    m.position
                  )}
                </td>
                <td>
                  {editingId === m.id ? (
                    <textarea
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Description"
                    />
                  ) : (
                    m.description || '—'
                  )}
                </td>
                <td className="action-buttons">
                  {editingId === m.id ? (
                    <>
                      <button className="btn btn-success" onClick={() => save(m.id)}>Save</button>
                      <button className="btn btn-danger" onClick={() => setEditingId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-primary" onClick={() => startEdit(m)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => remove(m.id, `${m.firstName} ${m.lastName}`)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
