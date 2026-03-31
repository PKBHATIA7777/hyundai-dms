/**
 * DataTable.jsx
 * ─────────────────────────────────────────────────────────────
 * Production-grade reusable table component for Hyundai DMS
 *
 * Props:
 *   columns        Array<ColumnDef>   — Column definitions (required)
 *   data           Array<object>      — Row data (required)
 *   loading        boolean            — Show skeleton loader
 *   title          string             — Optional table heading
 *   subtitle       string             — Optional sub-heading
 *   rowActions     Array<ActionDef>   — Per-row action buttons
 *   bulkActions    Array<ActionDef>   — Actions on selected rows
 *   filters        Array<FilterDef>   — Dropdown / range filter definitions
 *   serverSide     boolean            — Disable client-side sort/filter/page
 *   onServerChange function           — Called with { page, pageSize, sort, filters, search }
 *   totalRows      number             — Total rows (required when serverSide=true)
 *   pageSizeOptions Array<number>     — Defaults: [10, 25, 50, 100]
 *   defaultPageSize number            — Defaults: 10
 *   selectable     boolean            — Enable row checkboxes
 *   stickyHeader   boolean            — Stick header on scroll
 *   emptyMessage   string             — Custom empty state text
 *   onRowClick     function           — Click handler for an entire row
 *
 * ColumnDef:
 *   key            string             — Matches field in data object (required)
 *   header         string             — Display label (required)
 *   sortable       boolean            — Allow sorting on this column
 *   filterable     boolean            — Show inline search filter
 *   render         function(value, row) → ReactNode  — Custom cell renderer
 *   width          string             — CSS width, e.g. "120px" or "10%"
 *   align          "left"|"center"|"right"
 *   hidden         boolean            — Hide column by default
 *
 * FilterDef:
 *   key            string             — Matches field in data object
 *   label          string             — Dropdown label
 *   type           "select"|"multiselect"|"date-range"|"number-range"
 *   options        Array<{label, value}>   — For select / multiselect
 *
 * ActionDef:
 *   label          string
 *   icon           string             — Emoji / symbol
 *   variant        "primary"|"danger"|"success"|"ghost"
 *   onClick        function(row)  /  function(selectedRows) for bulk
 *   hidden         function(row) → boolean   — Conditionally hide the action
 *   disabled       function(row) → boolean
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

/* ── CSS-in-JS styles ─────────────────────────────────────── */
const STYLES = `
  .dt-root {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #111827;
    --dt-purple:       #4A2C8F;
    --dt-purple-light: #6B3FB5;
    --dt-purple-soft:  #F0EBF9;
    --dt-purple-border:#C4AEED;
    --dt-white:        #FFFFFF;
    --dt-grey-light:   #F7F7F8;
    --dt-grey-mid:     #E4E4E7;
    --dt-grey-text:    #6B7280;
    --dt-text-dark:    #111827;
    --dt-text-mid:     #374151;
    --dt-success:      #166534;
    --dt-success-bg:   #DCFCE7;
    --dt-error:        #991B1B;
    --dt-error-bg:     #FEE2E2;
    --dt-warning:      #92400E;
    --dt-warning-bg:   #FEF3C7;
    --dt-radius:       10px;
    --dt-radius-sm:    6px;
    --dt-shadow:       0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
    --dt-shadow-md:    0 4px 12px rgba(0,0,0,0.10);
    --dt-transition:   all 0.18s ease;
  }

  /* Card wrapper */
  .dt-card {
    background: var(--dt-white);
    border-radius: var(--dt-radius);
    box-shadow: var(--dt-shadow);
    border: 1px solid var(--dt-grey-mid);
    overflow: hidden;
  }

  /* ── Toolbar ──────────────────────────────────────────────── */
  .dt-toolbar {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--dt-grey-mid);
    background: var(--dt-white);
  }

  .dt-toolbar-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }

  .dt-title-block h3 {
    font-size: 16px;
    font-weight: 700;
    color: var(--dt-text-dark);
    margin: 0 0 2px;
  }

  .dt-title-block p {
    font-size: 12px;
    color: var(--dt-grey-text);
    margin: 0;
  }

  .dt-toolbar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  /* Search */
  .dt-search-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .dt-search-icon {
    position: absolute;
    left: 10px;
    font-size: 14px;
    color: var(--dt-grey-text);
    pointer-events: none;
  }

  .dt-search {
    padding: 8px 10px 8px 32px;
    border: 1.5px solid var(--dt-grey-mid);
    border-radius: var(--dt-radius-sm);
    font-size: 13px;
    background: var(--dt-grey-light);
    color: var(--dt-text-dark);
    width: 230px;
    transition: var(--dt-transition);
    outline: none;
  }

  .dt-search:focus {
    border-color: var(--dt-purple);
    background: var(--dt-white);
    box-shadow: 0 0 0 3px rgba(74,44,143,0.08);
  }

  .dt-search-clear {
    position: absolute;
    right: 8px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: var(--dt-grey-text);
    padding: 0;
    line-height: 1;
    transition: var(--dt-transition);
  }

  .dt-search-clear:hover { color: var(--dt-error); }

  /* Buttons */
  .dt-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 8px 14px;
    border-radius: var(--dt-radius-sm);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: var(--dt-transition);
    white-space: nowrap;
  }

  .dt-btn-primary {
    background: var(--dt-purple);
    color: var(--dt-white);
  }
  .dt-btn-primary:hover { background: #3b2270; }

  .dt-btn-ghost {
    background: transparent;
    color: var(--dt-grey-text);
    border: 1.5px solid var(--dt-grey-mid);
  }
  .dt-btn-ghost:hover { border-color: var(--dt-purple-border); color: var(--dt-purple); }

  .dt-btn-danger {
    background: var(--dt-error-bg);
    color: var(--dt-error);
    border: 1px solid #fca5a5;
  }
  .dt-btn-danger:hover { background: var(--dt-error); color: #fff; }

  .dt-btn-success {
    background: var(--dt-success-bg);
    color: var(--dt-success);
    border: 1px solid #86efac;
  }
  .dt-btn-success:hover { background: var(--dt-success); color: #fff; }

  .dt-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* Column visibility toggle */
  .dt-col-toggle {
    position: relative;
  }

  .dt-col-toggle-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 6px);
    background: var(--dt-white);
    border: 1px solid var(--dt-grey-mid);
    border-radius: var(--dt-radius-sm);
    box-shadow: var(--dt-shadow-md);
    padding: 8px 0;
    min-width: 180px;
    z-index: 50;
    animation: dtFadeIn 0.15s ease;
  }

  .dt-col-toggle-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    font-size: 13px;
    cursor: pointer;
    transition: var(--dt-transition);
    color: var(--dt-text-dark);
  }

  .dt-col-toggle-item:hover { background: var(--dt-purple-soft); }

  .dt-col-toggle-item input[type="checkbox"] {
    accent-color: var(--dt-purple);
    cursor: pointer;
  }

  /* ── Filter Bar ───────────────────────────────────────────── */
  .dt-filter-bar {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    flex-wrap: wrap;
    padding: 12px 20px;
    border-bottom: 1px solid var(--dt-grey-mid);
    background: #fafafa;
  }

  .dt-filter-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .dt-filter-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--dt-grey-text);
  }

  .dt-filter-select,
  .dt-filter-input {
    padding: 7px 10px;
    border: 1.5px solid var(--dt-grey-mid);
    border-radius: var(--dt-radius-sm);
    font-size: 13px;
    background: var(--dt-white);
    color: var(--dt-text-dark);
    outline: none;
    transition: var(--dt-transition);
    min-width: 130px;
  }

  .dt-filter-select:focus,
  .dt-filter-input:focus {
    border-color: var(--dt-purple);
    box-shadow: 0 0 0 3px rgba(74,44,143,0.08);
  }

  /* Multiselect dropdown */
  .dt-multiselect {
    position: relative;
  }

  .dt-multiselect-trigger {
    padding: 7px 10px;
    border: 1.5px solid var(--dt-grey-mid);
    border-radius: var(--dt-radius-sm);
    font-size: 13px;
    background: var(--dt-white);
    color: var(--dt-text-dark);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    min-width: 130px;
    white-space: nowrap;
    transition: var(--dt-transition);
  }

  .dt-multiselect-trigger:focus,
  .dt-multiselect-trigger.open {
    border-color: var(--dt-purple);
    box-shadow: 0 0 0 3px rgba(74,44,143,0.08);
  }

  .dt-multiselect-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    background: var(--dt-white);
    border: 1px solid var(--dt-grey-mid);
    border-radius: var(--dt-radius-sm);
    box-shadow: var(--dt-shadow-md);
    min-width: 180px;
    max-height: 220px;
    overflow-y: auto;
    z-index: 40;
    animation: dtFadeIn 0.15s ease;
  }

  .dt-multiselect-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    font-size: 13px;
    cursor: pointer;
    transition: var(--dt-transition);
  }

  .dt-multiselect-option:hover { background: var(--dt-purple-soft); }

  .dt-multiselect-option input[type="checkbox"] {
    accent-color: var(--dt-purple);
    cursor: pointer;
  }

  /* Active filter chips */
  .dt-active-filters {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    padding: 8px 20px;
    border-bottom: 1px solid var(--dt-grey-mid);
    background: var(--dt-purple-soft);
  }

  .dt-active-filter-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--dt-purple);
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  .dt-filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    background: var(--dt-white);
    border: 1.5px solid var(--dt-purple-border);
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    color: var(--dt-purple);
    cursor: default;
  }

  .dt-filter-chip-remove {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 13px;
    color: var(--dt-purple);
    padding: 0;
    line-height: 1;
    opacity: 0.7;
    transition: var(--dt-transition);
  }

  .dt-filter-chip-remove:hover { opacity: 1; color: var(--dt-error); }

  .dt-clear-all {
    font-size: 12px;
    font-weight: 600;
    color: var(--dt-error);
    background: none;
    border: none;
    cursor: pointer;
    padding: 3px 6px;
    border-radius: 4px;
    transition: var(--dt-transition);
    margin-left: 4px;
  }

  .dt-clear-all:hover { background: var(--dt-error-bg); }

  /* ── Bulk actions bar ─────────────────────────────────────── */
  .dt-bulk-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    background: #EDE9FE;
    border-bottom: 1px solid var(--dt-purple-border);
    animation: dtSlideDown 0.18s ease;
  }

  .dt-bulk-count {
    font-size: 13px;
    font-weight: 700;
    color: var(--dt-purple);
    flex: 1;
  }

  /* ── Table ────────────────────────────────────────────────── */
  .dt-table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .dt-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 500px;
  }

  .dt-sticky-header .dt-th {
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .dt-th {
    background: var(--dt-grey-light);
    color: var(--dt-text-mid);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    padding: 12px 16px;
    text-align: left;
    border-bottom: 2px solid var(--dt-grey-mid);
    white-space: nowrap;
    user-select: none;
  }

  .dt-th.sortable { cursor: pointer; }
  .dt-th.sortable:hover { background: #ebebed; color: var(--dt-purple); }

  .dt-th-inner {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .dt-sort-icon {
    font-size: 11px;
    opacity: 0.5;
    transition: var(--dt-transition);
  }

  .dt-th.sortable:hover .dt-sort-icon,
  .dt-th.sort-active .dt-sort-icon { opacity: 1; color: var(--dt-purple); }

  .dt-th.sort-active { color: var(--dt-purple); }

  .dt-th.align-center { text-align: center; }
  .dt-th.align-right  { text-align: right; }

  .dt-td {
    padding: 13px 16px;
    border-bottom: 1px solid var(--dt-grey-mid);
    font-size: 13px;
    color: var(--dt-text-dark);
    vertical-align: middle;
    transition: background 0.12s;
  }

  .dt-td.align-center { text-align: center; }
  .dt-td.align-right  { text-align: right; }

  .dt-tr:last-child .dt-td { border-bottom: none; }

  .dt-tr:hover .dt-td { background: var(--dt-purple-soft); }

  .dt-tr.selected .dt-td { background: #EDE9FE; }

  .dt-tr.clickable { cursor: pointer; }

  /* Checkbox column */
  .dt-th-check, .dt-td-check {
    padding: 12px 8px 12px 16px;
    width: 40px;
    text-align: center;
  }

  .dt-th-check input, .dt-td-check input {
    accent-color: var(--dt-purple);
    cursor: pointer;
    width: 15px;
    height: 15px;
  }

  /* Row actions */
  .dt-row-actions {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: nowrap;
  }

  .dt-row-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    white-space: nowrap;
    transition: var(--dt-transition);
  }

  .dt-row-action-btn.primary { background: var(--dt-purple-soft); color: var(--dt-purple); }
  .dt-row-action-btn.primary:hover { background: var(--dt-purple); color: #fff; }

  .dt-row-action-btn.danger { background: var(--dt-error-bg); color: var(--dt-error); }
  .dt-row-action-btn.danger:hover { background: var(--dt-error); color: #fff; }

  .dt-row-action-btn.success { background: var(--dt-success-bg); color: var(--dt-success); }
  .dt-row-action-btn.success:hover { background: var(--dt-success); color: #fff; }

  .dt-row-action-btn.ghost {
    background: var(--dt-grey-light);
    color: var(--dt-grey-text);
    border: 1px solid var(--dt-grey-mid);
  }
  .dt-row-action-btn.ghost:hover { background: var(--dt-grey-mid); color: var(--dt-text-dark); }

  .dt-row-action-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Skeleton loader */
  .dt-skeleton-row .dt-td {
    padding: 16px;
  }

  .dt-skeleton-cell {
    height: 12px;
    border-radius: 4px;
    background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
    background-size: 200% 100%;
    animation: dtShimmer 1.4s infinite;
  }

  /* ── Empty State ──────────────────────────────────────────── */
  .dt-empty {
    text-align: center;
    padding: 60px 24px;
    color: var(--dt-grey-text);
  }

  .dt-empty-icon { font-size: 36px; opacity: 0.35; margin-bottom: 12px; }
  .dt-empty h4 {
    font-size: 15px;
    font-weight: 600;
    color: var(--dt-text-mid);
    margin: 0 0 6px;
  }
  .dt-empty p { font-size: 13px; margin: 0; }

  /* ── Footer / Pagination ──────────────────────────────────── */
  .dt-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-top: 1px solid var(--dt-grey-mid);
    flex-wrap: wrap;
    gap: 10px;
    background: var(--dt-white);
  }

  .dt-footer-info {
    font-size: 12px;
    color: var(--dt-grey-text);
    white-space: nowrap;
  }

  .dt-footer-info strong { color: var(--dt-text-dark); }

  .dt-page-size-select {
    padding: 5px 8px;
    border: 1.5px solid var(--dt-grey-mid);
    border-radius: var(--dt-radius-sm);
    font-size: 12px;
    color: var(--dt-text-dark);
    background: var(--dt-white);
    cursor: pointer;
    outline: none;
    transition: var(--dt-transition);
  }

  .dt-page-size-select:focus { border-color: var(--dt-purple); }

  .dt-pagination {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .dt-page-btn {
    min-width: 32px;
    height: 32px;
    padding: 0 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--dt-radius-sm);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border: 1.5px solid var(--dt-grey-mid);
    background: var(--dt-white);
    color: var(--dt-text-mid);
    transition: var(--dt-transition);
  }

  .dt-page-btn:hover:not(:disabled) {
    border-color: var(--dt-purple);
    color: var(--dt-purple);
    background: var(--dt-purple-soft);
  }

  .dt-page-btn.active {
    background: var(--dt-purple);
    color: #fff;
    border-color: var(--dt-purple);
  }

  .dt-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .dt-page-ellipsis {
    font-size: 13px;
    color: var(--dt-grey-text);
    padding: 0 4px;
    user-select: none;
  }

  /* ── Animations ───────────────────────────────────────────── */
  @keyframes dtShimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @keyframes dtFadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes dtSlideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Responsive ───────────────────────────────────────────── */
  @media (max-width: 768px) {
    .dt-search { width: 160px; }

    .dt-footer {
      flex-direction: column;
      align-items: flex-start;
    }

    .dt-pagination { flex-wrap: wrap; }

    .dt-filter-bar { flex-direction: column; align-items: stretch; }

    .dt-filter-select,
    .dt-filter-input,
    .dt-multiselect-trigger { width: 100%; box-sizing: border-box; }

    .dt-toolbar-top { flex-direction: column; align-items: flex-start; }

    .dt-toolbar-actions { width: 100%; justify-content: flex-start; }
  }

  @media (max-width: 480px) {
    .dt-th, .dt-td { padding: 10px 10px; font-size: 12px; }
    .dt-btn { padding: 7px 10px; font-size: 11px; }
  }
`;

/* ─────────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────────── */

/** Multiselect filter dropdown */
const MultiSelectFilter = ({ filterDef, values, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (val) => {
    const next = values.includes(val)
      ? values.filter((v) => v !== val)
      : [...values, val];
    onChange(next);
  };

  const label =
    values.length === 0
      ? `All ${filterDef.label}`
      : values.length === 1
      ? filterDef.options.find((o) => o.value === values[0])?.label || values[0]
      : `${values.length} selected`;

  return (
    <div className="dt-multiselect" ref={ref}>
      <button
        type="button"
        className={`dt-multiselect-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((p) => !p)}
      >
        <span>{label}</span>
        <span style={{ fontSize: 10, opacity: 0.6 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="dt-multiselect-dropdown">
          {filterDef.options.map((opt) => (
            <label key={opt.value} className="dt-multiselect-option">
              <input
                type="checkbox"
                checked={values.includes(opt.value)}
                onChange={() => toggle(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

/** Page number array builder with ellipsis */
const buildPages = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  const addPage = (n) => { if (!pages.includes(n)) pages.push(n); };
  addPage(1);
  if (current > 4) pages.push('…left');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    addPage(i);
  }
  if (current < total - 3) pages.push('…right');
  addPage(total);
  return pages;
};

/* ─────────────────────────────────────────────────────────────
   Main DataTable component
───────────────────────────────────────────────────────────── */
const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  title,
  subtitle,
  rowActions = [],
  bulkActions = [],
  filters = [],
  serverSide = false,
  onServerChange,
  totalRows,
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 10,
  selectable = false,
  stickyHeader = false,
  emptyMessage = 'No records found.',
  onRowClick,
}) => {
  /* ── state ── */
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeFilters, setActiveFilters] = useState(() =>
    Object.fromEntries(
      filters.map((f) => [
        f.key,
        f.type === 'multiselect'
          ? []
          : f.type === 'date-range' || f.type === 'number-range'
          ? { from: '', to: '' }
          : '',
      ])
    )
  );
  const [colVisibility, setColVisibility] = useState(() =>
    Object.fromEntries(columns.map((c) => [c.key, !c.hidden]))
  );
  const [showColMenu, setShowColMenu] = useState(false);
  const colMenuRef = useRef(null);

  /* ── close col menu on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target))
        setShowColMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── reset page on search / filter change ── */
  useEffect(() => { setPage(1); }, [search, activeFilters]);

  /* ── server-side: call parent on change ── */
  useEffect(() => {
    if (!serverSide || !onServerChange) return;
    onServerChange({ page, pageSize, sort: { key: sortKey, dir: sortDir }, filters: activeFilters, search });
  }, [page, pageSize, sortKey, sortDir, activeFilters, search, serverSide, onServerChange]);

  /* ── derived data (client-side only) ── */
  const processedData = useMemo(() => {
    if (serverSide) return data;

    let rows = [...data];

    // global search across all visible text fields
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((row) =>
        columns.some((col) => {
          if (!colVisibility[col.key]) return false;
          const val = row[col.key];
          return val !== null && val !== undefined
            ? String(val).toLowerCase().includes(q)
            : false;
        })
      );
    }

    // per-filter
    filters.forEach((f) => {
      const val = activeFilters[f.key];
      if (!val || (Array.isArray(val) && val.length === 0)) return;

      if (f.type === 'select') {
        rows = rows.filter((r) => String(r[f.key]) === String(val));
      } else if (f.type === 'multiselect') {
        rows = rows.filter((r) => val.includes(String(r[f.key])));
      } else if (f.type === 'date-range') {
        const { from, to } = val;
        if (from) rows = rows.filter((r) => r[f.key] >= from);
        if (to)   rows = rows.filter((r) => r[f.key] <= to);
      } else if (f.type === 'number-range') {
        const { from, to } = val;
        if (from !== '') rows = rows.filter((r) => Number(r[f.key]) >= Number(from));
        if (to   !== '') rows = rows.filter((r) => Number(r[f.key]) <= Number(to));
      }
    });

    // sort
    if (sortKey) {
      rows.sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        let cmp;
        if (av === null || av === undefined) cmp = 1;
        else if (bv === null || bv === undefined) cmp = -1;
        else if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
        else cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return rows;
  }, [data, search, activeFilters, sortKey, sortDir, columns, colVisibility, filters, serverSide]);

  const totalFilteredRows = serverSide ? (totalRows ?? data.length) : processedData.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredRows / pageSize));

  const pagedData = useMemo(() => {
    if (serverSide) return data;
    const start = (page - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, page, pageSize, serverSide, data]);

  const visibleColumns = columns.filter((c) => colVisibility[c.key]);
  const hasActions = rowActions.length > 0;
  const hasBulkActions = selectable && bulkActions.length > 0;

  /* ── helpers ── */
  const handleSort = useCallback((key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  }, [sortKey]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(pagedData.map((r, i) => r.id ?? i)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (row, idx) => {
    const id = row.id ?? idx;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedRows = pagedData.filter((r, i) => selectedIds.has(r.id ?? i));
  const allPageSelected =
    pagedData.length > 0 &&
    pagedData.every((r, i) => selectedIds.has(r.id ?? i));

  const setFilter = (key, val) =>
    setActiveFilters((prev) => ({ ...prev, [key]: val }));

  const removeFilter = (key) => {
    const f = filters.find((f) => f.key === key);
    const empty = f?.type === 'multiselect'
      ? []
      : f?.type === 'date-range' || f?.type === 'number-range'
      ? { from: '', to: '' }
      : '';
    setFilter(key, empty);
  };

  const hasActiveFilters = filters.some((f) => {
    const val = activeFilters[f.key];
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'object' && val !== null) return val.from !== '' || val.to !== '';
    return val !== '' && val !== null && val !== undefined;
  });

  const clearAllFilters = () => {
    setActiveFilters(
      Object.fromEntries(
        filters.map((f) => [
          f.key,
          f.type === 'multiselect' ? [] : f.type === 'date-range' || f.type === 'number-range' ? { from: '', to: '' } : '',
        ])
      )
    );
    setSearch('');
  };

  const getFilterChipLabel = (f) => {
    const val = activeFilters[f.key];
    if (!val || (Array.isArray(val) && val.length === 0)) return null;
    if (typeof val === 'object' && !Array.isArray(val)) {
      if (val.from && val.to) return `${f.label}: ${val.from} – ${val.to}`;
      if (val.from) return `${f.label}: ≥ ${val.from}`;
      if (val.to)   return `${f.label}: ≤ ${val.to}`;
      return null;
    }
    if (Array.isArray(val)) {
      if (val.length === 0) return null;
      const labels = val
        .slice(0, 2)
        .map((v) => f.options?.find((o) => o.value === v)?.label || v)
        .join(', ');
      return `${f.label}: ${labels}${val.length > 2 ? ` +${val.length - 2}` : ''}`;
    }
    const optLabel = f.options?.find((o) => o.value === val)?.label;
    return `${f.label}: ${optLabel || val}`;
  };

  const pageNumbers = buildPages(page, totalPages);

  const startRow = totalFilteredRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow   = Math.min(page * pageSize, totalFilteredRows);

  /* ── render ── */
  return (
    <>
      {/* Inject styles once */}
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="dt-root dt-card">

        {/* ─── Toolbar ─── */}
        <div className="dt-toolbar">
          <div className="dt-toolbar-top">
            {(title || subtitle) && (
              <div className="dt-title-block">
                {title && <h3>{title}</h3>}
                {subtitle && <p>{subtitle}</p>}
              </div>
            )}

            <div className="dt-toolbar-actions">
              {/* Global Search */}
              <div className="dt-search-wrap">
                <span className="dt-search-icon">🔍</span>
                <input
                  type="text"
                  className="dt-search"
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button className="dt-search-clear" onClick={() => setSearch('')}>
                    ✕
                  </button>
                )}
              </div>

              {/* Column visibility */}
              {columns.length > 0 && (
                <div className="dt-col-toggle" ref={colMenuRef}>
                  <button
                    className="dt-btn dt-btn-ghost"
                    onClick={() => setShowColMenu((p) => !p)}
                    title="Show/hide columns"
                  >
                    ⚙ Columns
                  </button>
                  {showColMenu && (
                    <div className="dt-col-toggle-menu">
                      {columns.map((c) => (
                        <label key={c.key} className="dt-col-toggle-item">
                          <input
                            type="checkbox"
                            checked={!!colVisibility[c.key]}
                            onChange={(e) =>
                              setColVisibility((prev) => ({
                                ...prev,
                                [c.key]: e.target.checked,
                              }))
                            }
                          />
                          {c.header}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Filter Bar ─── */}
        {filters.length > 0 && (
          <div className="dt-filter-bar">
            {filters.map((f) => (
              <div key={f.key} className="dt-filter-group">
                <span className="dt-filter-label">{f.label}</span>

                {f.type === 'select' && (
                  <select
                    className="dt-filter-select"
                    value={activeFilters[f.key] || ''}
                    onChange={(e) => setFilter(f.key, e.target.value)}
                  >
                    <option value="">All</option>
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                )}

                {f.type === 'multiselect' && (
                  <MultiSelectFilter
                    filterDef={f}
                    values={activeFilters[f.key] || []}
                    onChange={(val) => setFilter(f.key, val)}
                  />
                )}

                {f.type === 'date-range' && (
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    <input
                      type="date"
                      className="dt-filter-input"
                      style={{ minWidth: 130 }}
                      value={activeFilters[f.key]?.from || ''}
                      onChange={(e) =>
                        setFilter(f.key, { ...activeFilters[f.key], from: e.target.value })
                      }
                    />
                    <span style={{ fontSize: 12, color: 'var(--dt-grey-text)' }}>–</span>
                    <input
                      type="date"
                      className="dt-filter-input"
                      style={{ minWidth: 130 }}
                      value={activeFilters[f.key]?.to || ''}
                      onChange={(e) =>
                        setFilter(f.key, { ...activeFilters[f.key], to: e.target.value })
                      }
                    />
                  </div>
                )}

                {f.type === 'number-range' && (
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    <input
                      type="number"
                      className="dt-filter-input"
                      placeholder="Min"
                      style={{ width: 80 }}
                      value={activeFilters[f.key]?.from ?? ''}
                      onChange={(e) =>
                        setFilter(f.key, { ...activeFilters[f.key], from: e.target.value })
                      }
                    />
                    <span style={{ fontSize: 12, color: 'var(--dt-grey-text)' }}>–</span>
                    <input
                      type="number"
                      className="dt-filter-input"
                      placeholder="Max"
                      style={{ width: 80 }}
                      value={activeFilters[f.key]?.to ?? ''}
                      onChange={(e) =>
                        setFilter(f.key, { ...activeFilters[f.key], to: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>
            ))}

            {hasActiveFilters && (
              <button className="dt-btn dt-btn-ghost" style={{ marginLeft: 'auto' }} onClick={clearAllFilters}>
                ✕ Clear Filters
              </button>
            )}
          </div>
        )}

        {/* ─── Active filter chips ─── */}
        {(hasActiveFilters || search) && (
          <div className="dt-active-filters">
            <span className="dt-active-filter-label">Active:</span>
            {search && (
              <span className="dt-filter-chip">
                Search: "{search}"
                <button className="dt-filter-chip-remove" onClick={() => setSearch('')}>✕</button>
              </span>
            )}
            {filters.map((f) => {
              const lbl = getFilterChipLabel(f);
              if (!lbl) return null;
              return (
                <span key={f.key} className="dt-filter-chip">
                  {lbl}
                  <button className="dt-filter-chip-remove" onClick={() => removeFilter(f.key)}>✕</button>
                </span>
              );
            })}
            <button className="dt-clear-all" onClick={clearAllFilters}>Clear all</button>
          </div>
        )}

        {/* ─── Bulk actions bar ─── */}
        {hasBulkActions && selectedIds.size > 0 && (
          <div className="dt-bulk-bar">
            <span className="dt-bulk-count">{selectedIds.size} row{selectedIds.size > 1 ? 's' : ''} selected</span>
            {bulkActions.map((action, i) => (
              <button
                key={i}
                className={`dt-btn dt-btn-${action.variant || 'ghost'}`}
                onClick={() => action.onClick(selectedRows)}
              >
                {action.icon && <span>{action.icon}</span>}
                {action.label}
              </button>
            ))}
            <button
              className="dt-btn dt-btn-ghost"
              onClick={() => setSelectedIds(new Set())}
            >
              Deselect
            </button>
          </div>
        )}

        {/* ─── Table ─── */}
        <div className="dt-table-wrapper">
          <table className={`dt-table ${stickyHeader ? 'dt-sticky-header' : ''}`}>
            <thead>
              <tr>
                {selectable && (
                  <th className="dt-th dt-th-check">
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      onChange={handleSelectAll}
                      title="Select all on this page"
                    />
                  </th>
                )}
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    className={[
                      'dt-th',
                      col.sortable ? 'sortable' : '',
                      sortKey === col.key ? 'sort-active' : '',
                      col.align ? `align-${col.align}` : '',
                    ].join(' ')}
                    style={{ width: col.width }}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <div className="dt-th-inner">
                      {col.header}
                      {col.sortable && (
                        <span className="dt-sort-icon">
                          {sortKey === col.key
                            ? sortDir === 'asc' ? '↑' : '↓'
                            : '↕'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {hasActions && (
                  <th className="dt-th" style={{ width: 120, textAlign: 'right' }}>
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                // Skeleton rows
                Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, ri) => (
                  <tr key={ri} className="dt-skeleton-row">
                    {selectable && <td className="dt-td dt-td-check"><div className="dt-skeleton-cell" style={{ width: 15, height: 15, borderRadius: 3 }} /></td>}
                    {visibleColumns.map((col) => (
                      <td key={col.key} className="dt-td">
                        <div className="dt-skeleton-cell" style={{ width: `${40 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                    {hasActions && (
                      <td className="dt-td">
                        <div className="dt-skeleton-cell" style={{ width: 80, height: 22, borderRadius: 20, marginLeft: 'auto' }} />
                      </td>
                    )}
                  </tr>
                ))
              ) : pagedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0)}
                  >
                    <div className="dt-empty">
                      <div className="dt-empty-icon">📋</div>
                      <h4>No results</h4>
                      <p>{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedData.map((row, rowIdx) => {
                  const rowId = row.id ?? rowIdx;
                  const isSelected = selectedIds.has(rowId);
                  return (
                    <tr
                      key={rowId}
                      className={[
                        'dt-tr',
                        isSelected ? 'selected' : '',
                        onRowClick ? 'clickable' : '',
                      ].join(' ')}
                      onClick={() => onRowClick && onRowClick(row)}
                    >
                      {selectable && (
                        <td
                          className="dt-td dt-td-check"
                          onClick={(e) => { e.stopPropagation(); handleSelectRow(row, rowIdx); }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(row, rowIdx)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                      )}
                      {visibleColumns.map((col) => (
                        <td
                          key={col.key}
                          className={['dt-td', col.align ? `align-${col.align}` : ''].join(' ')}
                        >
                          {col.render
                            ? col.render(row[col.key], row)
                            : row[col.key] !== null && row[col.key] !== undefined
                            ? String(row[col.key])
                            : <span style={{ color: 'var(--dt-grey-text)' }}>—</span>}
                        </td>
                      ))}
                      {hasActions && (
                        <td className="dt-td align-right" onClick={(e) => e.stopPropagation()}>
                          <div className="dt-row-actions" style={{ justifyContent: 'flex-end' }}>
                            {rowActions.map((action, ai) => {
                              if (action.hidden && action.hidden(row)) return null;
                              return (
                                <button
                                  key={ai}
                                  className={`dt-row-action-btn ${action.variant || 'primary'}`}
                                  onClick={() => action.onClick(row)}
                                  disabled={action.disabled ? action.disabled(row) : false}
                                  title={action.label}
                                >
                                  {action.icon && <span>{action.icon}</span>}
                                  {action.label}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Footer / Pagination ─── */}
        {!loading && (
          <div className="dt-footer">
            {/* Row info + page size */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span className="dt-footer-info">
                {totalFilteredRows === 0
                  ? 'No records'
                  : <>Showing <strong>{startRow}–{endRow}</strong> of <strong>{totalFilteredRows}</strong> records</>}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--dt-grey-text)' }}>Per page:</span>
                <select
                  className="dt-page-size-select"
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                >
                  {pageSizeOptions.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="dt-pagination">
                <button
                  className="dt-page-btn"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  title="First page"
                >
                  «
                </button>
                <button
                  className="dt-page-btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  title="Previous page"
                >
                  ‹
                </button>

                {pageNumbers.map((p, i) =>
                  typeof p === 'string' ? (
                    <span key={p + i} className="dt-page-ellipsis">…</span>
                  ) : (
                    <button
                      key={p}
                      className={`dt-page-btn ${p === page ? 'active' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  className="dt-page-btn"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  title="Next page"
                >
                  ›
                </button>
                <button
                  className="dt-page-btn"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  title="Last page"
                >
                  »
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default DataTable;


/* ─────────────────────────────────────────────────────────────
   USAGE EXAMPLE (copy this into any page when ready to use)
───────────────────────────────────────────────────────────────

import DataTable from '../../components/DataTable';

// ── 1. Define columns ──────────────────────────────────────
const columns = [
  {
    key: 'id',
    header: 'ID',
    sortable: true,
    width: '60px',
    render: (val) => <code style={{ fontSize: 11 }}>#{val}</code>,
  },
  {
    key: 'name',
    header: 'Dealer Name',
    sortable: true,
  },
  {
    key: 'city',
    header: 'City',
    sortable: true,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    align: 'center',
    render: (val) => (
      <span style={{
        background: val === 'ACTIVE' ? '#DCFCE7' : '#FEE2E2',
        color: val === 'ACTIVE' ? '#166534' : '#991B1B',
        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      }}>
        {val}
      </span>
    ),
  },
];

// ── 2. Define multi-filters ─────────────────────────────────
const filters = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'ACTIVE' },
      { label: 'Inactive', value: 'INACTIVE' },
    ],
  },
  {
    key: 'city',
    label: 'City',
    type: 'multiselect',
    options: [
      { label: 'Chennai', value: 'Chennai' },
      { label: 'Mumbai',  value: 'Mumbai'  },
      { label: 'Delhi',   value: 'Delhi'   },
    ],
  },
];

// ── 3. Define row actions ───────────────────────────────────
const rowActions = [
  {
    label: 'Edit',
    icon: '✏',
    variant: 'primary',
    onClick: (row) => console.log('Edit', row),
  },
  {
    label: 'Deactivate',
    icon: '🚫',
    variant: 'danger',
    hidden: (row) => row.status !== 'ACTIVE',
    onClick: (row) => console.log('Deactivate', row),
  },
];

// ── 4. Define bulk actions ──────────────────────────────────
const bulkActions = [
  {
    label: 'Export Selected',
    icon: '⬇',
    variant: 'ghost',
    onClick: (rows) => console.log('Export', rows),
  },
];

// ── 5. Use in JSX ───────────────────────────────────────────
<DataTable
  title="Dealer Management"
  subtitle="All registered dealerships"
  columns={columns}
  data={dealers}
  loading={loading}
  filters={filters}
  rowActions={rowActions}
  bulkActions={bulkActions}
  selectable
  stickyHeader
  defaultPageSize={25}
  pageSizeOptions={[10, 25, 50, 100]}
  onRowClick={(row) => navigate(`/admin/dealers/${row.id}`)}
/>

// ── 6. Server-side mode ─────────────────────────────────────
<DataTable
  serverSide
  totalRows={totalFromAPI}
  data={currentPageData}
  columns={columns}
  filters={filters}
  onServerChange={({ page, pageSize, sort, filters, search }) => {
    fetchData({ page, pageSize, sort, filters, search });
  }}
/>

─────────────────────────────────────────────────────────────*/