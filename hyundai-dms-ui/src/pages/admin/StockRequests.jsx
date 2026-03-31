import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import {
  getAllStockRequests,
  approveStockRequest,
  rejectStockRequest,
  rejectApprovedRequest,
  deliverStockRequest,
  getAllInvoices,
} from '../../services/stockRequestService';
import DataTable from '../../components/DataTable';

const formatDate = (dateStr) => {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const STATUS_STYLES = {
  PENDING:    { background: '#FFF8E1', color: '#E65100' },
  APPROVED:   { background: '#E8F5E9', color: '#166534' },
  REJECTED:   { background: '#FEE2E2', color: '#991B1B' },
  DISPATCHED: { background: '#E3F2FD', color: '#1565C0' },
  DELIVERED:  { background: '#E8F5E9', color: '#14532D' },
};

// ── Simple Dropdown Menu Component ─────────────────────
const DropdownMenu = ({ actions, row, disabled }) => {
  const [open, setOpen] = useState(false);

  const handleAction = (action) => {
    setOpen(false);
    if (!action.disabled?.(row)) {
      action.onClick(row);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled}
        style={{
          background: 'transparent',
          border: '1px solid #D1D5DB',
          borderRadius: '6px',
          padding: '6px 10px',
          fontSize: '18px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: '#6B7280',
          lineHeight: 1,
        }}
        title="Actions"
      >
        ⋮
      </button>
      
      {open && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 399 }} 
            onClick={() => setOpen(false)} 
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            background: 'white',
            border: '1px solid #E4E4E7',
            borderRadius: '8px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            minWidth: '180px',
            zIndex: 400,
            overflow: 'hidden',
          }}>
            {actions
              .filter(action => !action.hidden?.(row))
              .map((action, idx) => {
                const isDisabled = action.disabled?.(row) || disabled;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAction(action)}
                    disabled={isDisabled}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '10px 14px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: idx < actions.filter(a => !a.hidden?.(row)).length - 1 ? '1px solid #F4F4F5' : 'none',
                      fontSize: '13px',
                      color: isDisabled ? '#9CA3AF' : '#374151',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{action.icon}</span>
                    <span style={{ fontWeight: 500 }}>{action.label}</span>
                  </button>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
};

// ── Approve Modal ──────────────────────────────────────
const ApproveModal = ({ request, onConfirm, onCancel, loading }) => {
  const [approvedQty, setApprovedQty] = useState(request?.requestedQuantity || 1);
  const [useAll, setUseAll] = useState(true);

  const max = request?.requestedQuantity || 1;

  const handleConfirm = () => {
    const qty = useAll ? max : Number(approvedQty);
    if (!qty || qty <= 0 || qty > max) return;
    onConfirm(qty);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 400, padding: '20px',
    }}>
      <div style={{
        background: 'white', borderRadius: '12px', width: '100%',
        maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        animation: 'slideUp 0.2s ease',
      }}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #E4E4E7',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Approve Stock Request
            </h3>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0' }}>
              #{request?.id} — {request?.dealer?.name}
            </p>
          </div>
          <button onClick={onCancel} style={{
            background: 'none', border: 'none', fontSize: '22px',
            color: '#6B7280', cursor: 'pointer', lineHeight: 1,
          }}>✕</button>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{
            background: '#F9FAFB', borderRadius: '8px', padding: '14px 16px',
            marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
          }}>
            {[
              { label: 'Variant',    value: request?.variant?.variantName },
              { label: 'Colour',     value: request?.colour?.colourName },
              { label: 'Requested',  value: `${request?.requestedQuantity} unit(s)` },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginTop: '2px' }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '10px' }}>
              Quantity to Approve
            </label>

            <label style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 14px', border: `2px solid ${useAll ? '#4A2C8F' : '#E4E4E7'}`,
              borderRadius: '8px', cursor: 'pointer', marginBottom: '8px',
              background: useAll ? '#F0EBF9' : 'white', transition: 'all 0.15s',
            }}>
              <input
                type="radio" name="qtyMode" checked={useAll}
                onChange={() => { setUseAll(true); setApprovedQty(max); }}
                style={{ accentColor: '#4A2C8F' }}
              />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                  Approve All — {max} unit(s)
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Full requested quantity</div>
              </div>
            </label>

            <label style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 14px', border: `2px solid ${!useAll ? '#4A2C8F' : '#E4E4E7'}`,
              borderRadius: '8px', cursor: 'pointer',
              background: !useAll ? '#F0EBF9' : 'white', transition: 'all 0.15s',
            }}>
              <input
                type="radio" name="qtyMode" checked={!useAll}
                onChange={() => { setUseAll(false); setApprovedQty(1); }}
                style={{ accentColor: '#4A2C8F' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
                  Partial Quantity
                </div>
                <input
                  type="number"
                  value={!useAll ? approvedQty : ''}
                  min={1}
                  max={max - 1}
                  disabled={useAll}
                  onChange={(e) => setApprovedQty(Math.min(Math.max(1, Number(e.target.value)), max - 1))}
                  placeholder={`1 – ${max - 1}`}
                  style={{
                    padding: '8px 12px', border: '1.5px solid #D1D5DB',
                    borderRadius: '6px', fontSize: '14px', width: '120px',
                    background: useAll ? '#F3F4F6' : 'white', outline: 'none',
                  }}
                />
                {!useAll && approvedQty && (
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                    Remaining {max - Number(approvedQty)} unit(s) will stay as a new PENDING request
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        <div style={{
          padding: '16px 24px', borderTop: '1px solid #E4E4E7',
          display: 'flex', justifyContent: 'flex-end', gap: '10px',
        }}>
          <button onClick={onCancel} style={{
            padding: '9px 18px', background: 'transparent',
            border: '1.5px solid #D1D5DB', borderRadius: '6px',
            fontSize: '14px', fontWeight: 600, color: '#374151', cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || (!useAll && (!approvedQty || approvedQty <= 0))}
            style={{
              padding: '9px 20px', background: '#4A2C8F', color: 'white',
              border: 'none', borderRadius: '6px', fontSize: '14px',
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Approving...' : `Approve ${useAll ? max : (approvedQty || '?')} unit(s)`}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Reject-Approved Confirmation Modal ────────────────
const RejectApprovedModal = ({ request, onConfirm, onCancel, loading }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 400, padding: '20px',
  }}>
    <div style={{
      background: 'white', borderRadius: '12px', width: '100%',
      maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #E4E4E7' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#991B1B', margin: 0 }}>
          ⚠ Reject Approved Request
        </h3>
      </div>
      <div style={{ padding: '20px 24px' }}>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>
          You are about to reject an <strong>already approved</strong> stock request (#{request?.id}).
          The associated supply invoice will be voided and inventory will <strong>not</strong> be updated.
        </p>
        <div style={{
          background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px',
          padding: '12px 14px', marginTop: '14px', fontSize: '13px', color: '#991B1B',
        }}>
          This action cannot be undone.
        </div>
      </div>
      <div style={{
        padding: '16px 24px', borderTop: '1px solid #E4E4E7',
        display: 'flex', justifyContent: 'flex-end', gap: '10px',
      }}>
        <button onClick={onCancel} style={{
          padding: '9px 18px', background: 'transparent',
          border: '1.5px solid #D1D5DB', borderRadius: '6px',
          fontSize: '14px', fontWeight: 600, color: '#374151', cursor: 'pointer',
        }}>
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          style={{
            padding: '9px 20px', background: '#991B1B', color: 'white',
            border: 'none', borderRadius: '6px', fontSize: '14px',
            fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Rejecting...' : 'Yes, Reject It'}
        </button>
      </div>
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────
const AdminStockRequests = () => {
  const [activeTab, setActiveTab] = useState('requests');

  const [requests, setRequests]             = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [actionError, setActionError]       = useState('');
  const [actionLoading, setActionLoading]   = useState(null);

  const [approveModal, setApproveModal]           = useState(null);
  const [rejectApprovedModal, setRejectApprovedModal] = useState(null);

  const [invoices, setInvoices]             = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  useEffect(() => { fetchRequests(); }, []);
  useEffect(() => { if (activeTab === 'invoices') fetchInvoices(); }, [activeTab]);

  const fetchRequests = async () => {
    setRequestsLoading(true);
    setActionError('');
    try {
      const res = await getAllStockRequests();
      if (Array.isArray(res.data)) setRequests(res.data);
    } catch (err) {
      setActionError(err.response?.data || 'Failed to load requests.');
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchInvoices = async () => {
    setInvoicesLoading(true);
    try {
      const res = await getAllInvoices();
      if (Array.isArray(res.data)) setInvoices(res.data);
    } catch (err) {
      setActionError(err.response?.data || 'Failed to load invoices.');
    } finally {
      setInvoicesLoading(false);
    }
  };

  const handleApproveSubmit = async (approvedQty) => {
    const row = approveModal;
    setActionError('');
    setActionLoading(row.id + '_approve');
    try {
      await approveStockRequest(row.id, approvedQty);
      setApproveModal(null);
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data || 'Failed to approve request.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (row) => {
    setActionError('');
    setActionLoading(row.id + '_reject');
    try {
      await rejectStockRequest(row.id);
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data || 'Failed to reject request.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeliver = async (row) => {
    setActionError('');
    setActionLoading(row.id + '_deliver');
    try {
      await deliverStockRequest(row.id);
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data || 'Failed to mark as delivered.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectApprovedSubmit = async () => {
    const row = rejectApprovedModal;
    setActionError('');
    setActionLoading(row.id + '_rejectApproved');
    try {
      await rejectApprovedRequest(row.id);
      setRejectApprovedModal(null);
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data || 'Failed to reject approved request.');
    } finally {
      setActionLoading(null);
    }
  };

  const printAdminInvoice = (invoice) => {
    const req = invoice.stockRequest;
    const approvedQty = req?.approvedQuantity ?? req?.requestedQuantity ?? '--';
    const html = `<!DOCTYPE html><html><head><title>Supply Invoice ${invoice.invoiceNumber}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 48px; color: #111; }
      h1 { color: #4A2C8F; } .label { font-size: 11px; text-transform: uppercase; color: #6B7280; }
      .val { font-size: 15px; font-weight: 600; margin-bottom: 14px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 24px 0; }
      .footer { margin-top: 48px; border-top: 1px solid #e4e4e7; padding-top: 16px; font-size: 12px; color: #6B7280; }
      @media print { body { padding: 24px; } }
    </style></head><body>
    <h1>Hyundai DMS — Supply Invoice</h1>
    <p style="color:#6B7280">Issued by: Hyundai Headquarters</p>
    <div class="grid">
      <div><div class="label">Invoice Number</div><div class="val">${invoice.invoiceNumber}</div></div>
      <div><div class="label">Invoice Date</div><div class="val">${new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}</div></div>
      <div><div class="label">Dealer</div><div class="val">${invoice.dealer?.name} (${invoice.dealer?.dealerCode})</div></div>
      <div><div class="label">Status</div><div class="val">${invoice.status}</div></div>
      <div><div class="label">Variant</div><div class="val">${req?.variant?.variantName || '--'}</div></div>
      <div><div class="label">Colour</div><div class="val">${req?.colour?.colourName} — ${req?.colour?.colourCode}</div></div>
      <div><div class="label">Approved Quantity</div><div class="val">${approvedQty} units</div></div>
    </div>
    <div class="footer">This is a system-generated document. Hyundai Dealer Management System.</div>
    </body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  const requestColumns = [
    { 
      key: 'dealerName',  
      header: 'Dealer',   
      sortable: true, 
      render: (_, row) => row.dealer?.name || '--',
      width: '180px',
    },
    { 
      key: 'carName',     
      header: 'Car',       
      sortable: true, 
      render: (_, row) => row.variant?.car?.modelName || '--',
      width: '140px',
    },
    { 
      key: 'variantName', 
      header: 'Variant',   
      sortable: true, 
      render: (_, row) => row.variant?.variantName || '--',
      width: '160px',
    },
    { 
      key: 'colourName',  
      header: 'Colour',    
      render: (_, row) => row.colour?.colourName || '--',
      width: '120px',
    },
    {
      key: 'requestedQuantity',
      header: 'Requested',
      sortable: true,
      align: 'center',
      width: '90px',
    },
    {
      key: 'approvedQuantity',
      header: 'Approved',
      align: 'center',
      width: '90px',
      render: (val, row) => {
        if (row.status === 'PENDING') return <span style={{ color: '#9CA3AF' }}>—</span>;
        return (
          <span style={{ fontWeight: 700, color: '#166534' }}>
            {val ?? row.requestedQuantity}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      align: 'center',
      width: '110px',
      render: (val) => {
        const style = STATUS_STYLES[val] || { background: '#F5F5F5', color: '#757575' };
        return (
          <span style={{ ...style, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
            {val}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      width: '80px',
      render: (_, row) => (
        <DropdownMenu
          actions={requestRowActions}
          row={row}
          disabled={!!actionLoading}
        />
      ),
    },
  ];

  const requestFilters = [
    {
      key: 'status', label: 'Status', type: 'select',
      options: [
        { label: 'Pending',    value: 'PENDING' },
        { label: 'Approved',   value: 'APPROVED' },
        { label: 'Rejected',   value: 'REJECTED' },
        { label: 'Delivered',  value: 'DELIVERED' },
      ],
    },
  ];

  const requestRowActions = [
    {
      label: 'Approve',
      icon: '✅',
      variant: 'success',
      hidden: (row) => row.status !== 'PENDING',
      disabled: (row) => actionLoading === row.id + '_approve',
      onClick: (row) => setApproveModal(row),
    },
    {
      label: 'Reject',
      icon: '❌',
      variant: 'danger',
      hidden: (row) => row.status !== 'PENDING',
      disabled: (row) => actionLoading === row.id + '_reject',
      onClick: handleReject,
    },
    {
      label: 'Mark Delivered',
      icon: '📦',
      variant: 'primary',
      hidden: (row) => row.status !== 'APPROVED',
      disabled: (row) => actionLoading === row.id + '_deliver',
      onClick: handleDeliver,
    },
    {
      label: 'Reject Approved',
      icon: '⛔',
      variant: 'danger',
      hidden: (row) => row.status !== 'APPROVED',
      disabled: (row) => actionLoading === row.id + '_rejectApproved',
      onClick: (row) => setRejectApprovedModal(row),
    },
    {
      label: 'Print Invoice',
      icon: '🧾',
      variant: 'ghost',
      hidden: (row) => row.status !== 'DELIVERED',
      onClick: async (row) => {
        try {
          const res = await getAllInvoices();
          const invoice = res.data?.find((inv) => inv.stockRequest?.id === row.id);
          if (invoice) printAdminInvoice(invoice);
          else setActionError('Invoice not found for this request.');
        } catch {
          setActionError('Failed to fetch invoice.');
        }
      },
    },
  ];

  const invoiceColumns = [
    {
      key: 'invoiceNumber', header: 'Invoice Number', sortable: true,
      render: (val) => (
        <code style={{ fontFamily: 'monospace', fontSize: '12px', background: '#F0EBF9', color: '#4A2C8F', padding: '3px 8px', borderRadius: '4px' }}>
          {val}
        </code>
      ),
    },
    { key: 'dealerName', header: 'Dealer', sortable: true, render: (_, row) => row.dealer?.name || '--' },
    { 
      key: 'status', header: 'Status', sortable: true, align: 'center',
      render: (val) => {
        const colorMap = {
          GENERATED: { background: '#E8F5E9', color: '#166534' },
          DELIVERED:  { background: '#DCFCE7', color: '#14532D' },
          VOIDED:     { background: '#FEE2E2', color: '#991B1B' },
        };
        const s = colorMap[val] || { background: '#F3F4F6', color: '#374151' };
        return (
          <span style={{ ...s, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
            {val}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      width: '80px',
      render: (_, row) => (
        <DropdownMenu
          actions={invoiceRowActions}
          row={row}
          disabled={false}
        />
      ),
    },
  ];

  const invoiceRowActions = [
    { label: 'Print Invoice', icon: '🖨', variant: 'ghost', onClick: (row) => printAdminInvoice(row) },
  ];

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
            Stock Requests
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>
            Review dealer stock requests and manage supply invoices.
          </p>
        </div>

        {actionError && (
          <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', color: '#991B1B', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}>
            {actionError}
            <button onClick={() => setActionError('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#991B1B' }}>✕</button>
          </div>
        )}

        <div style={{ display: 'flex', borderBottom: '2px solid #E4E4E7' }}>
          {[
            { key: 'requests', label: `Requests${pendingCount > 0 ? ` (${pendingCount} pending)` : ''}` },
            { key: 'invoices', label: 'Supply Invoices' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '12px 24px', fontSize: '14px', fontWeight: 600,
                color: activeTab === tab.key ? '#4A2C8F' : '#6B7280',
                background: 'transparent', border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #4A2C8F' : '2px solid transparent',
                marginBottom: '-2px', cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ 
          overflowX: 'auto', 
          borderRadius: '8px', 
          border: '1px solid #E4E4E7',
          background: 'white',
        }}>
          {activeTab === 'requests' && (
            <DataTable
              title="All Stock Requests"
              subtitle="Approve, reject, or confirm delivery of dealer requests"
              columns={requestColumns}
              data={requests}
              loading={requestsLoading}
              filters={requestFilters}
              rowActions={[]}
              defaultPageSize={10}
              pageSizeOptions={[10, 25, 50]}
              emptyMessage="No stock requests found."
            />
          )}

          {activeTab === 'invoices' && (
            <DataTable
              title="Supply Invoices"
              subtitle="All generated supply invoices"
              columns={invoiceColumns}
              data={invoices}
              loading={invoicesLoading}
              rowActions={[]}
              defaultPageSize={10}
              pageSizeOptions={[10, 25, 50]}
              emptyMessage="No invoices generated yet."
            />
          )}
        </div>

        {approveModal && (
          <ApproveModal
            request={approveModal}
            onConfirm={handleApproveSubmit}
            onCancel={() => setApproveModal(null)}
            loading={actionLoading === approveModal.id + '_approve'}
          />
        )}

        {rejectApprovedModal && (
          <RejectApprovedModal
            request={rejectApprovedModal}
            onConfirm={handleRejectApprovedSubmit}
            onCancel={() => setRejectApprovedModal(null)}
            loading={actionLoading === rejectApprovedModal.id + '_rejectApproved'}
          />
        )}

      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminStockRequests;