import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { 
  Search, 
  ArrowUpDown, 
  Copy, 
  Check, 
  Loader, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Percent,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Dashboard API state
  const [metrics, setMetrics] = useState([]);
  const [serviceSummary, setServiceSummary] = useState(null);
  const [referralMeta, setReferralMeta] = useState({ link: '', code: '' });
  const [referrals, setReferrals] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Copy state feedbacks
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Fetch referrals and metadata from the backend
  const fetchDashboardData = async (search, sort) => {
    setLoading(true);
    setErrorMsg('');
    const token = Cookies.get('jwt_token');

    try {
      let url = 'https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/referrals';
      const params = [];
      if (search) {
        params.push(`search=${encodeURIComponent(search)}`);
      }
      if (sort) {
        params.push(`sort=${sort}`);
      }
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const json = await response.json();

      if (response.ok && json.success) {
        // Works whether fields are nested inside json.data or flat beside it
        const payload = json.data || json;
        if (payload.metrics) setMetrics(payload.metrics);
        if (payload.serviceSummary) setServiceSummary(payload.serviceSummary);
        if (payload.referral) setReferralMeta(payload.referral);
        if (payload.referrals) {
          setReferrals(payload.referrals);
        } else {
          setReferrals([]);
        }
        // Reset to first page when data changes
        setCurrentPage(1);
      } else {
        setErrorMsg(json.message || `Error code: ${response.status}`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to connect to the referral service API.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced API updates for search input and sort change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchDashboardData(searchQuery, sortOrder);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, sortOrder]);

  // Copy handlers
  const handleCopyLink = () => {
    if (referralMeta.link) {
      navigator.clipboard.writeText(referralMeta.link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyCode = () => {
    if (referralMeta.code) {
      navigator.clipboard.writeText(referralMeta.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Format Helper Methods
  const formatReferralDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.split('-').join('/');
  };

  const formatProfitCurrency = (value) => {
    if (value === undefined || value === null) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Client-side pagination logic
  const itemsPerPage = 10;
  const totalEntries = referrals.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReferrals = referrals.slice(startIndex, startIndex + itemsPerPage);

  const displayFrom = totalEntries === 0 ? 0 : startIndex + 1;
  const displayTo = Math.min(currentPage * itemsPerPage, totalEntries);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Dynamic icon selector for metric cards
  const getMetricIcon = (metricId) => {
    const lowerId = String(metricId).toLowerCase();
    if (lowerId.includes('earning') || lowerId.includes('revenue') || lowerId.includes('profit')) {
      return <DollarSign size={20} className="metric-badge-icon" />;
    }
    if (lowerId.includes('active') || lowerId.includes('partner')) {
      return <TrendingUp size={20} className="metric-badge-icon" />;
    }
    if (lowerId.includes('rate') || lowerId.includes('percent')) {
      return <Percent size={20} className="metric-badge-icon" />;
    }
    return <Users size={20} className="metric-badge-icon" />;
  };

  return (
    <div className="app-layout-page">
      <Navbar />

      <main className="app-dashboard-main">
        <header className="dashboard-page-header">
          <h1 className="dashboard-title">Referral Dashboard</h1>
          <p className="dashboard-subtitle">
            Track your referrals, earnings, and partner activity in one place.
          </p>
        </header>

        {errorMsg && (
          <div className="dashboard-alert-error" role="alert">
            <AlertTriangle size={20} />
            <div className="error-alert-content">
              <strong>Data Fetch Failed:</strong>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Overview Section */}
        <section 
          className="dashboard-section" 
          role="region" 
          aria-label="Overview metrics"
        >
          <div className="section-header">
            <h2 className="section-title">Overview</h2>
          </div>
          
          <div className="overview-metrics-grid">
            {loading && metrics.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="metric-card skeleton-card">
                  <div className="skeleton-line title-skeleton" />
                  <div className="skeleton-line value-skeleton" />
                </div>
              ))
            ) : (
              metrics.map((metric) => (
                <div key={metric.id} className="metric-card">
                  <div className="metric-card-info">
                    <span className="metric-card-label">{metric.label}</span>
                    <span className="metric-card-value">{metric.value}</span>
                  </div>
                  <div className="metric-card-icon-container">
                    {getMetricIcon(metric.id)}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <div className="dashboard-grid-layout">
          {/* Service Summary Section */}
          <section 
            className="dashboard-section" 
            role="region" 
            aria-label="Service summary"
          >
            <div className="section-header">
              <h2 className="section-title">Service summary</h2>
            </div>

            <div className="service-summary-card">
              <div className="table-responsive-container">
                <table className="summary-data-table">
                  <thead>
                    <tr>
                      <th scope="col">Service</th>
                      <th scope="col">Your Referrals</th>
                      <th scope="col">Active Referrals</th>
                      <th scope="col">Total Ref. Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && !serviceSummary ? (
                      <tr>
                        <td colSpan="4">
                          <div className="table-loading-row">
                            <Loader size={16} className="spinner-icon-active" />
                            <span>Loading summaries...</span>
                          </div>
                        </td>
                      </tr>
                    ) : serviceSummary ? (
                      <tr>
                        <td data-label="Service">{serviceSummary.service}</td>
                        <td data-label="Your Referrals">{serviceSummary.yourReferrals}</td>
                        <td data-label="Active Referrals">{serviceSummary.activeReferrals}</td>
                        <td data-label="Total Ref. Earnings" className="cell-earnings-value">
                          {serviceSummary.totalRefEarnings}
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan="4" className="empty-table-cell">No summary data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Share Referral Section */}
          <section 
            className="dashboard-section" 
            role="region" 
            aria-label="Share referral"
          >
            <div className="section-header">
              <h2 className="section-title">Refer friends and earn more</h2>
            </div>

            <div className="share-referral-card">
              <div className="share-field-group">
                <div className="share-field-header">
                  <label htmlFor="share-referral-link-input" className="share-field-label">
                    Your Referral Link
                  </label>
                  {copiedLink && <span className="copy-success-indicator">Copied!</span>}
                </div>
                <div className="share-input-control">
                  <input
                    id="share-referral-link-input"
                    type="text"
                    readOnly
                    value={referralMeta.link || ''}
                    className="share-readonly-input"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="btn-share-copy"
                  >
                    {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              <div className="share-field-group">
                <div className="share-field-header">
                  <label htmlFor="share-referral-code-input" className="share-field-label">
                    Your Referral Code
                  </label>
                  {copiedCode && <span className="copy-success-indicator">Copied!</span>}
                </div>
                <div className="share-input-control">
                  <input
                    id="share-referral-code-input"
                    type="text"
                    readOnly
                    value={referralMeta.code || ''}
                    className="share-readonly-input"
                  />
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="btn-share-copy"
                  >
                    {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* All Referrals Section */}
        <section className="dashboard-section all-referrals-table-section">
          <div className="referrals-table-header-controls">
            <h2 className="section-title">All referrals</h2>
            
            <div className="table-filters-container">
              {/* Search Control */}
              <div className="search-filter-wrapper">
                <Search size={16} className="search-prefix-icon" />
                <input
                  type="text"
                  placeholder="Name or service…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-text-filter"
                  aria-label="Search referrals"
                />
              </div>

              {/* Sort Control */}
              <div className="sort-filter-wrapper">
                <label className="sort-control-label">
                  <span>Sort by date</span>
                  <div className="sort-select-container">
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="sort-dropdown-select"
                    >
                      <option value="desc">Newest first</option>
                      <option value="asc">Oldest first</option>
                    </select>
                    <ArrowUpDown size={14} className="sort-arrow-icon" />
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="referrals-table-container">
            <div className="table-responsive-container">
              <table className="referrals-data-table">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Service</th>
                    <th scope="col">Date</th>
                    <th scope="col">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && referrals.length === 0 ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="row-skeleton">
                        <td><div className="skeleton-line table-cell-skeleton" /></td>
                        <td><div className="skeleton-line table-cell-skeleton" /></td>
                        <td><div className="skeleton-line table-cell-skeleton" /></td>
                        <td><div className="skeleton-line table-cell-skeleton" /></td>
                      </tr>
                    ))
                  ) : referrals.length === 0 ? (
                    <tr className="empty-referrals-row">
                      <td>No matching entries</td>
                      <td>No matching entries</td>
                      <td>No matching entries</td>
                      <td>No matching entries</td>
                    </tr>
                  ) : (
                    paginatedReferrals.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => navigate(`/referral/${item.id}`)}
                        className="referrals-interactive-row"
                        title={`Click to view details for ${item.name}`}
                      >
                        <td data-label="Name" className="cell-partner-name">{item.name}</td>
                        <td data-label="Service">{item.serviceName}</td>
                        <td data-label="Date">{formatReferralDate(item.date)}</td>
                        <td data-label="Profit" className="cell-profit-value">
                          {formatProfitCurrency(item.profit)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {referrals.length > 0 && (
              <div className="table-pagination-footer">
                <span className="pagination-summary-text">
                  Showing {displayFrom}–{displayTo} of {totalEntries} entries
                </span>

                <div className="pagination-actions-container">
                  <button
                    type="button"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="btn-pagination-nav"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>

                  {totalPages > 1 && (
                    <div className="pagination-page-numbers">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`btn-page-number ${currentPage === pageNum ? 'active' : ''}`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="btn-pagination-nav"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
