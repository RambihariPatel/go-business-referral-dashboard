import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { ArrowLeft, Loader, DollarSign, Calendar, Shield, User, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ReferralDetail = () => {
  const { id } = useParams();
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  // Format YYYY-MM-DD to YYYY/MM/DD
  const formatReferralDate = (dateString) => {
    if (!dateString) return '';
    return dateString.split('-').join('/');
  };

  // Format profit to USD en-US with no decimals
  const formatReferralProfit = (value) => {
    if (value === undefined || value === null) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    const loadReferralData = async () => {
      setLoading(true);
      setErrorText('');
      setReferral(null);
      const token = Cookies.get('jwt_token');

      try {
        const response = await fetch(`https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/referrals?id=${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('API error');
        }

        const json = await response.json();

        let match = null;
        if (json?.success && json?.data) {
          const payload = json.data;
          
          // Check response pattern 1: data is the single referral object
          if (payload.id && String(payload.id) === String(id)) {
            match = payload;
          }
          // Check response pattern 2: data has a referrals array
          else if (Array.isArray(payload.referrals)) {
            match = payload.referrals.find((item) => String(item.id) === String(id));
          }
          // Check response pattern 3: data has a referral object
          else if (payload.referral && String(payload.referral.id) === String(id)) {
            match = payload.referral;
          }
        }

        if (match) {
          setReferral(match);
        } else {
          setErrorText('Referral not found');
        }
      } catch (err) {
        setErrorText('Referral not found');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadReferralData();
    }
  }, [id]);

  return (
    <div className="app-layout-page">
      <Navbar />
      
      <main className="app-detail-main">
        <div className="detail-view-container">
          <div className="back-navigation">
            <Link to="/" className="btn-back-dashboard" aria-label="Back to dashboard">
              <ArrowLeft size={16} className="btn-back-arrow" />
              <span>← Back to dashboard</span>
            </Link>
          </div>

          {loading && (
            <div className="detail-status-section">
              <Loader className="spinner-icon-active" size={32} />
              <p>Fetching referral details...</p>
            </div>
          )}

          {!loading && errorText && (
            <div className="detail-status-section detail-error-view">
              <AlertCircle size={48} className="error-alert-badge" />
              <h1 className="error-not-found-heading">Referral not found</h1>
              <p className="error-not-found-msg">We could not retrieve the details for this referral ID.</p>
            </div>
          )}

          {!loading && !errorText && referral && (
            <div className="referral-detail-card">
              <div className="detail-card-header">
                <h1 className="detail-card-main-title">Referral Details</h1>
                <h2 className="detail-partner-name">{referral.name}</h2>
              </div>

              <div className="detail-card-body">
                <dl className="detail-definition-list">
                  <div className="detail-definition-row">
                    <dt className="detail-label-term">
                      <User size={16} />
                      <span>Referral ID</span>
                    </dt>
                    <dd className="detail-definition-desc">{referral.id}</dd>
                  </div>

                  <div className="detail-definition-row">
                    <dt className="detail-label-term">
                      <Shield size={16} />
                      <span>Service Name</span>
                    </dt>
                    <dd className="detail-definition-desc">{referral.serviceName}</dd>
                  </div>

                  <div className="detail-definition-row">
                    <dt className="detail-label-term">
                      <Calendar size={16} />
                      <span>Date</span>
                    </dt>
                    <dd className="detail-definition-desc">{formatReferralDate(referral.date)}</dd>
                  </div>

                  <div className="detail-definition-row">
                    <dt className="detail-label-term">
                      <DollarSign size={16} />
                      <span>Profit</span>
                    </dt>
                    <dd className="detail-definition-desc value-profit">
                      {formatReferralProfit(referral.profit)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReferralDetail;
