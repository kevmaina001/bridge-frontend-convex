import { Link } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import {
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Users,
  Link2,
  Activity
} from 'lucide-react'

function Dashboard() {
  const stats = useQuery(api.payments.getPaymentStats)
  const recentPayments = useQuery(api.payments.getPayments, {
    limit: 10,
    offset: 0
  })
  const mappingStats = useQuery(api.customer_mappings.getAutoMatchStats)
  const clientStats = useQuery(api.clients.getClientStats)

  const loading = stats === undefined || recentPayments === undefined || mappingStats === undefined

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusBadge = (status) => {
    const statusClasses = {
      success: 'badge badge-success',
      failed: 'badge badge-error',
      pending: 'badge badge-pending'
    }
    return <span className={statusClasses[status] || 'badge'}>{status}</span>
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  const successRate = stats?.totalPayments > 0
    ? ((stats.successfulPayments / stats.totalPayments) * 100).toFixed(1)
    : 0

  const matchRate = mappingStats?.totalSplynxCustomers > 0
    ? ((mappingStats.matchedCustomers / mappingStats.totalSplynxCustomers) * 100).toFixed(1)
    : 0

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">Real-time overview of your payment bridge system</p>
        </div>
        <div className="header-badges">
          <span className="status-badge status-online">
            <Activity size={14} />
            System Online
          </span>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="section-header">
        <h2 className="section-title">
          <DollarSign size={20} />
          Payment Statistics
        </h2>
        <span className="success-rate">Success Rate: {successRate}%</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-card-highlight">
          <div className="stat-header">
            <span className="stat-title">Total Payments</span>
            <div className="stat-icon primary">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-value">{stats?.totalPayments || 0}</div>
          <div className="stat-footer">
            <span className="stat-label">{formatCurrency(stats?.totalAmount)}</span>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-header">
            <span className="stat-title">Successful</span>
            <div className="stat-icon success">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="stat-value">{stats?.successfulPayments || 0}</div>
          <div className="stat-footer">
            <span className="stat-label">{formatCurrency(stats?.successfulAmount)}</span>
            <span className="stat-trend positive">+{successRate}%</span>
          </div>
        </div>

        <div className="stat-card stat-card-error">
          <div className="stat-header">
            <span className="stat-title">Failed</span>
            <div className="stat-icon error">
              <XCircle size={20} />
            </div>
          </div>
          <div className="stat-value">{stats?.failedPayments || 0}</div>
          <div className="stat-footer">
            <span className="stat-label">Requires attention</span>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-header">
            <span className="stat-title">Pending</span>
            <div className="stat-icon warning">
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-value">{stats?.pendingPayments || 0}</div>
          <div className="stat-footer">
            <span className="stat-label">In progress</span>
          </div>
        </div>
      </div>

      {/* System Stats */}
      <div className="section-header">
        <h2 className="section-title">
          <Link2 size={20} />
          System Status
        </h2>
        <Link to="/customer-mappings" className="section-link">View Mappings →</Link>
      </div>

      <div className="stats-grid stats-grid-3">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Matched Customers</span>
            <div className="stat-icon success">
              <Link2 size={20} />
            </div>
          </div>
          <div className="stat-value">{mappingStats?.matchedCustomers || 0}</div>
          <div className="stat-footer">
            <span className="stat-label">{mappingStats?.totalSplynxCustomers || 0} total</span>
            <span className="stat-trend positive">{matchRate}%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Splynx Customers</span>
            <div className="stat-icon primary">
              <Users size={20} />
            </div>
          </div>
          <div className="stat-value">{mappingStats?.totalSplynxCustomers || 0}</div>
          <div className="stat-footer">
            <span className="stat-label">{mappingStats?.unmatchedSplynxCustomers || 0} unmatched</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">UISP Clients</span>
            <div className="stat-icon primary">
              <Users size={20} />
            </div>
          </div>
          <div className="stat-value">{mappingStats?.totalUispClients || 0}</div>
          <div className="stat-footer">
            <span className="stat-label">Active clients</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="section-header">
        <h2 className="section-title">
          <Activity size={20} />
          Recent Activity
        </h2>
        <Link to="/payments" className="section-link">View All Payments →</Link>
      </div>

      <div className="card">
        {!recentPayments || recentPayments.length === 0 ? (
          <div className="empty-state">
            <Clock size={48} />
            <h3>No payments yet</h3>
            <p>Payments will appear here once webhooks start arriving from Splynx</p>
          </div>
        ) : (
          <div className="mobile-scroll">
            <table className="table table-modern">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th className="hide-mobile">Type</th>
                  <th>Status</th>
                  <th className="hide-mobile">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr key={payment._id}>
                    <td>
                      <code className="transaction-code">{payment.transaction_id}</code>
                    </td>
                    <td>
                      <Link
                        to={`/clients/${payment.client_id}`}
                        className="client-link"
                      >
                        {payment.client_id}
                      </Link>
                    </td>
                    <td className="amount-cell">{formatCurrency(payment.amount)}</td>
                    <td className="hide-mobile">{payment.payment_type || 'N/A'}</td>
                    <td>{getStatusBadge(payment.status)}</td>
                    <td className="hide-mobile date-cell">{formatDate(payment.created_at)}</td>
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

export default Dashboard
