import TopBar from '@/components/TopBar';

export default function AdminUsers() {
  return (
    <>
      <TopBar
        title="Users"
        subtitle="Manage all platform users"
      />
      <div style={{ padding: 28 }}>
        <div style={{
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: 28,
        }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>URLs Submitted</th>
                  <th>Credits</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Alex Morgan', email: 'alex@indexflow.io', plan: 'Pro', urls: 487, credits: 4820, joined: 'Jan 15, 2024', active: true },
                  { name: 'Sarah Chen', email: 'sarah@acme.co', plan: 'Agency', urls: 2100, credits: 7850, joined: 'Feb 3, 2024', active: true },
                  { name: 'Mike Torres', email: 'mike@startup.io', plan: 'Starter', urls: 89, credits: 411, joined: 'Mar 10, 2024', active: true },
                  { name: 'Emma Davis', email: 'emma@blog.net', plan: 'Starter', urls: 34, credits: 0, joined: 'Apr 22, 2024', active: false },
                  { name: 'James Lee', email: 'james@seo.agency', plan: 'Agency', urls: 5240, credits: 3200, joined: 'Jan 28, 2024', active: true },
                  { name: 'Priya Kapoor', email: 'priya@content.in', plan: 'Pro', urls: 920, credits: 1080, joined: 'Mar 5, 2024', active: true },
                ].map((u) => (
                  <tr key={u.email}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'var(--gradient-brand)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
                        }}>
                          {u.name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-paused">{u.plan}</span></td>
                    <td style={{ fontWeight: 600 }}>{u.urls.toLocaleString()}</td>
                    <td>
                      <span style={{ color: u.credits < 100 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                        {u.credits.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{u.joined}</td>
                    <td>
                      <span className={`badge ${u.active ? 'badge-completed' : 'badge-failed'}`}>
                        {u.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}>View</button>
                        <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }}>Impersonate</button>
                        {u.active && (
                          <button className="btn btn-danger" style={{ fontSize: 11, padding: '4px 8px' }}>Disable</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
