import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Search, Link as LinkIcon, Users, CheckCircle, XCircle } from 'lucide-react'

function CustomerMappings() {
  const [searchTerm, setSearchTerm] = useState('')

  const stats = useQuery(api.customer_mappings.getMappingStats)
  const allMappings = useQuery(api.customer_mappings.getCustomerMappings)

  const loading = stats === undefined || allMappings === undefined

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleDateString()
  }

  const filteredMappings = (allMappings || []).filter(mapping => {
    if (!searchTerm) return true

    const term = searchTerm.toLowerCase()
    return (
      mapping.splynx_customer_id?.toLowerCase().includes(term) ||
      mapping.splynx_customer?.login?.toLowerCase().includes(term) ||
      mapping.splynx_customer?.name?.toLowerCase().includes(term) ||
      mapping.uisp_client?.custom_id?.toLowerCase().includes(term) ||
      mapping.uisp_client?.first_name?.toLowerCase().includes(term) ||
      mapping.uisp_client?.last_name?.toLowerCase().includes(term) ||
      mapping.notes?.toLowerCase().includes(term)
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
        <h1 className="page-title">Customer Mappings</h1>
        <p className="page-description">View mappings between Splynx customers and UISP clients</p>
      </div>

      {stats && (
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Total Mappings</span>
              <div className="stat-icon primary">
                <LinkIcon size={20} />
              </div>
            </div>
            <div className="stat-value">{stats?.totalMappings || 0}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Splynx Customers</span>
              <div className="stat-icon success">
                <Users size={20} />
              </div>
            </div>
            <div className="stat-value">{stats?.totalSplynxCustomers || 0}</div>
            <div className="stat-footer">
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {stats?.unmappedSplynxCustomers || 0} unmapped
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">UISP Clients</span>
              <div className="stat-icon success">
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="stat-value">{stats?.totalUispClients || 0}</div>
            <div className="stat-footer">
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {stats?.unmappedUispClients || 0} unmapped
              </span>
            </div>
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
          Mappings ({filteredMappings.length})
        </h2>

        {filteredMappings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {allMappings.length === 0
                ? 'No customer mappings found. Mappings are created automatically when payments are processed.'
                : 'No mappings match your search.'
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
                  <th>↔</th>
                  <th>UISP ID</th>
                  <th>UISP Custom ID</th>
                  <th>UISP Name</th>
                  <th>Notes</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredMappings.map((mapping) => (
                  <tr key={mapping._id}>
                    <td style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                      {mapping.splynx_customer_id}
                    </td>
                    <td>
                      {mapping.splynx_customer ? (
                        <span style={{ fontWeight: '600' }}>
                          {mapping.splynx_customer.login}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--error-color)' }}>Not found</span>
                      )}
                    </td>
                    <td>
                      {mapping.splynx_customer?.name || 'N/A'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <LinkIcon size={16} style={{ color: 'var(--primary-color)' }} />
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      {mapping.uisp_client_id}
                    </td>
                    <td>
                      {mapping.uisp_client ? (
                        <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                          {mapping.uisp_client.custom_id || mapping.uisp_client.uisp_client_id}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--error-color)' }}>Not found</span>
                      )}
                    </td>
                    <td>
                      {mapping.uisp_client
                        ? `${mapping.uisp_client.first_name || ''} ${mapping.uisp_client.last_name || ''}`.trim() || 'N/A'
                        : 'N/A'
                      }
                    </td>
                    <td>
                      {mapping.notes || '-'}
                    </td>
                    <td>{formatDate(mapping.created_at)}</td>
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
