import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import axios from 'axios'
import {
  MessageSquare,
  Send,
  Users,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react'

function SendSMS() {
  const [selectedClients, setSelectedClients] = useState([])
  const [message, setMessage] = useState('')
  const [senderId, setSenderId] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const clients = useQuery(api.clients.getClients, { limit: 1000, offset: 0 })
  const loading = clients === undefined

  const characterCount = message.length
  const smsCount = Math.ceil(characterCount / 160)

  const handleClientToggle = (clientId) => {
    if (selectedClients.includes(clientId)) {
      setSelectedClients(selectedClients.filter(id => id !== clientId))
    } else {
      setSelectedClients([...selectedClients, clientId])
    }
  }

  const handleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([])
    } else {
      setSelectedClients(filteredClients.map(c => c.uisp_client_id))
    }
  }

  const handleSendSMS = async () => {
    if (selectedClients.length === 0) {
      setError('Please select at least one client')
      return
    }

    if (!message.trim()) {
      setError('Please enter a message')
      return
    }

    setS

ending(true)
    setError(null)
    setResult(null)

    try {
      const response = await axios.post('http://localhost:3000/api/sms/send-to-clients', {
        clientIds: selectedClients,
        message: message,
        senderId: senderId || undefined
      })

      setResult({
        success: true,
        message: response.data.message,
        data: response.data.data
      })

      // Clear form after successful send
      setSelectedClients([])
      setMessage('')
      setSenderId('')

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send SMS')
    } finally {
      setSending(false)
    }
  }

  const filteredClients = (clients || []).filter(client => {
    if (!searchTerm) return true

    const term = searchTerm.toLowerCase()
    return (
      client.custom_id?.toLowerCase().includes(term) ||
      client.first_name?.toLowerCase().includes(term) ||
      client.last_name?.toLowerCase().includes(term) ||
      client.phone?.toLowerCase().includes(term)
    )
  })

  const selectedClientsData = filteredClients.filter(c =>
    selectedClients.includes(c.uisp_client_id)
  )

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="send-sms-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Send SMS</h1>
          <p className="page-description">Send custom SMS messages to your clients</p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {result && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <div>
            <strong>Success!</strong>
            <p>{result.message}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <div>
            <strong>Error!</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px', alignItems: 'start' }}>
        {/* Client Selection */}
        <div className="card">
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Users size={20} />
              Select Recipients ({selectedClients.length} selected)
            </h2>

            <input
              type="text"
              className="search-input"
              placeholder="Search by name, ID, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', marginBottom: '12px' }}
            />

            <button
              onClick={handleSelectAll}
              className="button button-secondary"
              style={{ marginBottom: '16px', width: '100%' }}
            >
              {selectedClients.length === filteredClients.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredClients.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                No clients found
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredClients.map((client) => (
                  <label
                    key={client.uisp_client_id}
                    className="client-checkbox-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: selectedClients.includes(client.uisp_client_id)
                        ? 'var(--bg-primary)'
                        : 'transparent'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.uisp_client_id)}
                      onChange={() => handleClientToggle(client.uisp_client_id)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600' }}>
                        {client.first_name} {client.last_name}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {client.custom_id} • {client.phone || 'No phone'}
                      </div>
                    </div>
                    {!client.phone && (
                      <span className="badge badge-warning" style={{ fontSize: '10px' }}>
                        No Phone
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Composer */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <div className="card">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <MessageSquare size={20} />
              Compose Message
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Sender ID (Optional)
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., YourBrand"
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                maxLength={11}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Max 11 characters (alphanumeric)
              </span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Message
              </label>
              <textarea
                className="textarea-field"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span>{characterCount} characters</span>
                <span>{smsCount} SMS</span>
              </div>
            </div>

            {selectedClients.length > 0 && (
              <div className="sms-preview" style={{
                padding: '12px',
                background: 'var(--bg-primary)',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                  Preview
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Sending to {selectedClients.length} recipient{selectedClients.length > 1 ? 's' : ''}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Total SMS: {selectedClients.length * smsCount}
                </div>
              </div>
            )}

            <button
              onClick={handleSendSMS}
              disabled={sending || selectedClients.length === 0 || !message.trim()}
              className="button button-primary"
              style={{
                width: '100%',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: (sending || selectedClients.length === 0 || !message.trim()) ? 0.5 : 1,
                cursor: (sending || selectedClients.length === 0 || !message.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              {sending ? (
                <>
                  <Loader size={18} className="spinning" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send SMS
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SendSMS
