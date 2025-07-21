import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { getAuth } from "firebase/auth";

export default function MemberUpload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [importResults, setImportResults] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setStatus("You must be logged in to upload members.");
        return;
      }

      await user.getIdToken(true); // force refresh
      const token = await user.getIdToken();
      setIdToken(token);
    };

    fetchToken();
  }, []);

  const handleFile = e => {
    setFile(e.target.files[0]);
    setStatus(null);
  };

  const handleImport = () => {
    if (!file) {
      alert('Please select a CSV file first.');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async ({ data, errors }) => {
        if (errors.length) {
          console.error('CSV parse errors:', errors);
          setStatus('CSV parse error – check your columns.');
          return;
        }

        // Shape rows for the Cloud Function
        const members = data.map(row => ({
          country:           row.country,
          email:             row.email,
          firstName:         row.firstName,
          lastName:          row.lastName,
          isProfileComplete: row.isProfileComplete === 'true',
          phoneNumber:       row.phoneNumber,
          status:            row.status,
          title:             row.title
        }));

        try {
          const resp = await fetch(
            'https://us-central1-website-f9d19.cloudfunctions.net/bulkCreateUsers',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
              },
              body: JSON.stringify({ members })
            }
          );

          if (!resp.ok) throw new Error(await resp.text());
          const { results } = await resp.json();

          setImportResults(results);

          const successCount = results.filter(r => r.success).length;
          const failCount    = results.length - successCount;
          setStatus(
            `${successCount} imported; ${failCount} failed.`
          );

        } catch (err) {
          console.error('Import error:', err);
          setStatus('Import failed – see console for details.');
        }
      }
    });
  };

  return (
    <div>
      <h2>Import Members & Create Authentication (CSV)</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleFile}
      />
      <button onClick={handleImport} disabled={!file}>
        Upload & Provision Users
      </button>
      {status && <p>{status}</p>}
      {importResults && (
        <div style={{ marginTop: 16 }}>
          <h4>Import Details:</h4>
          <ul>
            {importResults.map((r, i) =>
              r.success ? (
                <li key={i} style={{ color: 'green' }}>
                  {r.email} imported successfully.
                </li>
              ) : (
                <li key={i} style={{ color: 'red' }}>
                  {r.email}: {r.error}
                </li>
              )
            )}
          </ul>
        </div>
      )}
      <p>Import users here with the appropriate fields. Users will be sent a link to 
        set their passwords to the emails provided. 
        CSV columns must be exactly (order does not matter but case does):</p>
      <pre>
country,email,firstName,lastName,isProfileComplete,phoneNumber,status,title
      </pre>
    </div>
  );
}
