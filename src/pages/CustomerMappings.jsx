import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Search, Link as LinkIcon, Users, CheckCircle, AlertCircle } from 'lucide-react'

function CustomerMappings() {
  const [searchTerm, setSearchTerm] = useState('')

  const stats = useQuery(api.customer_mappings.getAutoMatchStats)
  const allMatches = useQuery(api.customer_mappings.getAutoDetectedMatches)

  const loading = stats === undefined || allMatches === undefined

  const filteredMatches = (allMatches || []).filter(match => {
    if (!searchTerm) return true

    const term = searchTerm.toLowerCase()
    return (
      match.splynx_customer?.splynx_id?.toLowerCase().includes(term) ||
      match.splynx_customer?.login?.toLowerCase().includes(term) ||
      match.splynx_customer?.name?.toLowerCase().includes(term) ||
      match.uisp_client?.custom_id?.toLowerCase().includes(term) ||
      match.uisp_client?.first_name?.toLowerCase().includes(term) ||
      match.uisp_client?.last_name?.toLowerCase().includes(term) ||
      match.uisp_client?.email?.toLowerCase().includes(term)
    )
  })

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="customer-mappings-page">
      <div className="page-header">
        <h1 className="page-title">Auto-Detected Customer Matches</h1>
        <p className="page-description">Customers automatically matched by login ↔ custom_id</p>
      </div>

      {stats && (
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Matched Customers</span>
              <div className="stat-icon success">
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="stat-value">{stats?.matchedCustomers || 0}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Splynx Customers</span>
              <div className="stat-icon primary">
                <Users size={20} />
              </div>
            </div>
            <div className="stat-value">{stats?.totalSplynxCustomers || 0}</div>
            <div className="stat-footer">
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {stats?.unmatchedSplynxCustomers || 0} unmatched
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">UISP Clients</span>
              <div className="stat-icon primary">
                <LinkIcon size={20} />
              </div>
            </div>
            <div className="stat-value">{stats?.totalUispClients || 0}</div>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '250px' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)'
                }}
              />
              <input
                type="text"
                className="search-input"
                placeholder="Search by name, login, ID, notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '40px', width: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>
          Auto-Detected Matches ({filteredMatches.length})
        </h2>

        {filteredMatches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <AlertCircle size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {allMatches?.length === 0
                ? 'No auto-detected matches found. Make sure customer logins in Splynx match custom IDs in UISP.'
                : 'No matches match your search.'
              }
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Splynx ID</th>
                  <th>Splynx Login</th>
                  <th>Splynx Name</th>
                  <th style={{ textAlign: 'center' }}>Match</th>
                  <th>UISP Custom ID</th>
                  <th>UISP Name</th>
                  <th>UISP Email</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatches.map((match, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                      {match.splynx_customer?.splynx_id || 'N/A'}
                    </td>
                    <td>
                      <span style={{ fontWeight: '600', color: 'var(--success-color)' }}>
                        {match.splynx_customer?.login || 'N/A'}
                      </span>
                    </td>
                    <td>
                      {match.splynx_customer?.name || 'N/A'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <CheckCircle size={16} style={{ color: 'var(--success-color)' }} />
                        <LinkIcon size={14} style={{ color: 'var(--primary-color)' }} />
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: '600', color: 'var(--success-color)' }}>
                        {match.uisp_client?.custom_id || 'N/A'}
                      </span>
                    </td>
                    <td>
                      {match.uisp_client
                        ? `${match.uisp_client.first_name || ''} ${match.uisp_client.last_name || ''}`.trim() || 'N/A'
                        : 'N/A'
                      }
                    </td>
                    <td>
                      {match.uisp_client?.email || 'N/A'}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: 'var(--success-color)',
                          color: 'white'
                        }}
                      >
                        Matched
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerMappings
