import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { splynxAPI } from '../services/api'
import { RefreshCw, Search, Users, CheckCircle, XCircle, Filter } from 'lucide-react'

function SplynxCustomers() {
  const [syncing, setSyncing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, active, inactive

  const stats = useQuery(api.splynx_customers.getSplynxCustomerStats)
  const allCustomers = useQuery(api.splynx_customers.getSplynxCustomers, {
    limit: 500,
    offset: 0
  })

  const loading = stats === undefined || allCustomers === undefined

  // Client-side filtering based on status
  const customers = (allCustomers || []).filter(customer => {
    if (statusFilter === 'active') {
      return customer.status === 'active';
    } else if (statusFilter === 'inactive') {
      return customer.status === 'inactive';
    }
    return true; // 'all'
  })

  const handleSync = async () => {
    try {
      setSyncing(true)
      const result = await splynxAPI.syncCustomers()

      alert(`Splynx customers synced successfully! ${result.data.total} customers synced.`)
    } catch (err) {
      alert('Failed to sync: ' + (err.response?.data?.message || err.message))
    } finally {
      setSyncing(false)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleDateString()
  }

  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm) return true

    const term = searchTerm.toLowerCase()
    return (
      customer.login?.toLowerCase().includes(term) ||
      customer.name?.toLowerCase().includes(term) ||
      customer.email?.toLowerCase().includes(term) ||
      customer.phone?.includes(term) ||
      customer.splynx_id?.toString().includes(term)
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
    <div className="splynx-customers-page">
      <div className="page-header">
        <h1 className="page-title">Splynx Customers</h1>
        <p className="page-description">View customer information from Splynx</p>
      </div>

      {stats && (
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Total Customers</span>
              <div className="stat-icon primary">
                <Users size={20} />
              </div>
            </div>
            <div className="stat-value">{stats?.totalCustomers || 0}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Active</span>
              <div className="stat-icon success">
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="stat-value">{stats?.activeCustomers || 0}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Inactive</span>
              <div className="stat-icon error">
                <XCircle size={20} />
              </div>
            </div>
            <div className="stat-value">{stats?.inactiveCustomers || 0}</div>
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
                placeholder="Search by name, email, login, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '40px', width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-input"
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Customers</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="button button-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} className={syncing ? 'spinning' : ''} />
            {syncing ? 'Syncing...' : 'Sync from Splynx'}
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>
          Customers ({filteredCustomers.length})
        </h2>

        {filteredCustomers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {customers.length === 0
                ? 'No customers synced yet. Click "Sync from Splynx" to fetch customers.'
                : 'No customers match your search.'
              }
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Login</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Billing Type</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Last Synced</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id}>
                    <td style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                      {customer.splynx_id}
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      {customer.login || 'N/A'}
                    </td>
                    <td>{customer.name || 'N/A'}</td>
                    <td>{customer.email || 'N/A'}</td>
                    <td>{customer.phone || 'N/A'}</td>
                    <td>{customer.city || 'N/A'}</td>
                    <td>{customer.billing_type || 'N/A'}</td>
                    <td>{customer.category || 'N/A'}</td>
                    <td>
                      {customer.status === 'active' ? (
                        <span className="badge badge-success">Active</span>
                      ) : customer.status === 'inactive' ? (
                        <span className="badge badge-error">Inactive</span>
                      ) : (
                        <span className="badge">{customer.status || 'Unknown'}</span>
                      )}
                    </td>
                    <td>{formatDate(customer.synced_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinning {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default SplynxCustomers
