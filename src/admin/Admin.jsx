import { useState } from 'react';
import ExecCommitteeUpload from './ExecCommitteeUpload.jsx';
import MemberUpload from './MemberUpload.jsx';
import MemberManager from './MemberManager.jsx';
import ProgramImagesManager from './ProgramImagesManager.jsx';

export default function AdminDashboard() {
  const [tab, setTab] = useState('members');

  return (
    <div>
      <nav>
        {['members','import-roles','exec','images'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            // style={{ fontWeight: tab===t?'bold':'normal' }}
            className={tab===t ? 'active' : ''}
          >
            {t === 'members' && 'Manage Members'}
            {t === 'import-roles' && 'Import Members'}
            {t === 'exec' && 'Exec Committee'}
            {t === 'images' && 'Program Images'}
          </button>
        ))}
      </nav>

      <main style={{ marginTop: 20 }}>
        {tab === 'members' && <MemberManager />}
        {tab === 'import-roles' && <MemberUpload />}
        {tab === 'exec' && (
          <>
            <ExecCommitteeUpload />
            {/* later: ExecCommitteeManager */}
          </>
        )}
        {tab === 'images' && <ProgramImagesManager />}
      </main>
    </div>
  );
}
