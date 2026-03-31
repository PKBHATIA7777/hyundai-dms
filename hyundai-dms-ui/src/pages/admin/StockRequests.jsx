import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import {
  getAllStockRequests,
  approveStockRequest,
  rejectStockRequest,
  getAllInvoices,
  dispatchStockRequest,
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
};

const AdminStockRequests = () => {
  const [activeTab, setActiveTab] = useState('requests');

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (activeTab === 'invoices') fetchInvoices();
  }, [activeTab]);

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

  const handleApprove = async (row) => {
    setActionError('');
    setActionLoading(row.id);
    try {
      await approveStockRequest(row.id);
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data || 'Failed to approve request.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (row) => {
    setActionError('');
    setActionLoading(row.id);
    try {
      await rejectStockRequest(row.id);
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data || 'Failed to reject request.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDispatch = async (row) => {
    setActionLoading(row.id);
    try {
      const res = await dispatchStockRequest(row.id);
      printAdminInvoice(res.data);
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data || 'Dispatch failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewInvoice = async (row) => {
    try {
      const res = await getAllInvoices();
      const invoice = res.data?.find((inv) => inv.stockRequest?.id === row.id);
      if (invoice) printAdminInvoice(invoice);
      else setActionError('Invoice not found for this request.');
    } catch {
      setActionError('Failed to fetch invoice.');
    }
  };

  const printAdminInvoice = (invoice) => {
    const req = invoice.stockRequest;
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
      <div><div class="label">Quantity</div><div class="val">${req?.requestedQuantity} units</div></div>
    </div>
    <div class="footer">This is a system-generated document. Hyundai Dealer Management System.</div>
    </body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  // ── Requests table columns ──
  const requestColumns = [
    {
      key: 'dealerName',
      header: 'Dealer',
      sortable: true,
      render: (_, row) => row.dealer?.name || '--',
    },
    {
      key: 'carName',
      header: 'Car',
      sortable: true,
      render: (_, row) => row.variant?.car?.modelName || '--',
    },
    {
      key: 'variantName',
      header: 'Variant',
      sortable: true,
      render: (_, row) => row.variant?.variantName || '--',
    },
    {
      key: 'colourName',
      header: 'Colour',
      render: (_, row) => row.colour?.colourName || '--',
    },
    {
      key: 'requestedQuantity',
      header: 'Qty',
      sortable: true,
      align: 'center',
      width: '70px',
    },
    {
      key: 'requestDate',
      header: 'Date',
      sortable: true,
      render: (val) => formatDate(val),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      align: 'center',
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
      key: 'notes',
      header: 'Notes',
      render: (val) => (
        <span style={{ fontSize: '12px', color: 'var(--grey-text)', fontStyle: 'italic', maxWidth: '180px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {val || '--'}
        </span>
      ),
    },
  ];

  // ── Requests filters ──
  const requestFilters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'PENDING' },
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Rejected', value: 'REJECTED' },
        { label: 'Dispatched', value: 'DISPATCHED' },
      ],
    },
  ];

  // ── Row actions — logic:
  //   Approve + Reject → only PENDING
  //   Dispatch        → only APPROVED
  //   View Invoice    → only DISPATCHED
  //   No edit/delete  → stock requests are immutable audit records
  const requestRowActions = [
    {
      label: 'Approve',
      icon: '✅',
      variant: 'success',
      hidden: (row) => row.status !== 'PENDING',
      disabled: (row) => actionLoading === row.id,
      onClick: handleApprove,
    },
    {
      label: 'Reject',
      icon: '❌',
      variant: 'danger',
      hidden: (row) => row.status !== 'PENDING',
      disabled: (row) => actionLoading === row.id,
      onClick: handleReject,
    },
    {
      label: 'Dispatch',
      icon: '🚚',
      variant: 'primary',
      hidden: (row) => row.status !== 'APPROVED',
      disabled: (row) => actionLoading === row.id,
      onClick: handleDispatch,
    },
    {
      label: 'Invoice',
      icon: '🧾',
      variant: 'ghost',
      hidden: (row) => row.status !== 'DISPATCHED',
      onClick: handleViewInvoice,
    },
  ];

  // ── Invoices table columns ──
  const invoiceColumns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice Number',
      sortable: true,
      render: (val) => (
        <code style={{ fontFamily: 'monospace', fontSize: '12px', background: 'var(--purple-soft)', color: 'var(--purple-dark)', padding: '3px 8px', borderRadius: '4px' }}>
          {val}
        </code>
      ),
    },
    {
      key: 'dealerName',
      header: 'Dealer',
      sortable: true,
      render: (_, row) => row.dealer?.name || '--',
    },
    {
      key: 'invoiceDate',
      header: 'Date',
      sortable: true,
      render: (val) => formatDate(val),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      align: 'center',
      render: (val) => (
        <span style={{ background: '#E8F5E9', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
          {val}
        </span>
      ),
    },
  ];

  // Invoice row actions: only Print — no edit/delete since invoices are financial records
  const invoiceRowActions = [
    {
      label: 'Print',
      icon: '🖨',
      variant: 'ghost',
      onClick: (row) => printAdminInvoice(row),
    },
  ];

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
            Stock Requests
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--grey-text)' }}>
            Review dealer stock requests and manage supply invoices.
          </p>
        </div>

        {actionError && (
          <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', color: 'var(--error)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
            {actionError}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--grey-mid)' }}>
          {[
            { key: 'requests', label: `Requests${pendingCount > 0 ? ` (${pendingCount} pending)` : ''}` },
            { key: 'invoices', label: 'Supply Invoices' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '12px 24px', fontSize: '14px', fontWeight: 600,
                color: activeTab === tab.key ? 'var(--purple-main)' : 'var(--grey-text)',
                background: 'transparent', border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid var(--purple-main)' : '2px solid transparent',
                marginBottom: '-2px', cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <DataTable
            title="All Stock Requests"
            subtitle="Approve, reject, or dispatch dealer requests"
            columns={requestColumns}
            data={requests}
            loading={requestsLoading}
            filters={requestFilters}
            rowActions={requestRowActions}
            defaultPageSize={10}
            pageSizeOptions={[10, 25, 50]}
            emptyMessage="No stock requests found."
          />
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <DataTable
            title="Supply Invoices"
            subtitle="All generated supply invoices"
            columns={invoiceColumns}
            data={invoices}
            loading={invoicesLoading}
            rowActions={invoiceRowActions}
            defaultPageSize={10}
            pageSizeOptions={[10, 25, 50]}
            emptyMessage="No invoices generated yet."
          />
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminStockRequests;