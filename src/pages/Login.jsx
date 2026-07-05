import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { KeyRound, Mail, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect authenticated users to the home dashboard
  const token = Cookies.get('jwt_token');
  if (token) {
    return <Navigate to="/" replace />;
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && result?.data?.token) {
        Cookies.set('jwt_token', result.data.token);
        navigate('/');
      } else {
        // Display error message from response or default to required message
        setErrorMessage(result?.message || 'Invalid email or password');
      }
    } catch (err) {
      setErrorMessage('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-viewport">
      <div className="login-card-container">
        <div className="login-branding">
          <h1 className="login-title">Go Business</h1>
          <p className="login-tagline">Sign in to open your referral dashboard.</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="login-form-element">
          {errorMessage && (
            <div className="login-alert-error" role="alert">
              <AlertCircle size={16} className="error-alert-icon" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="login-form-field">
            <label htmlFor="email-address-input" className="field-label">
              Email
            </label>
            <div className="field-input-control">
              <Mail className="field-prefix-icon" size={16} />
              <input
                id="email-address-input"
                type="text"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-text-input"
              />
            </div>
          </div>

          <div className="login-form-field">
            <label htmlFor="password-field-input" className="field-label">
              Password
            </label>
            <div className="field-input-control">
              <KeyRound className="field-prefix-icon" size={16} />
              <input
                id="password-field-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-text-input"
              />
            </div>
          </div>

          <button
            type="submit"
            className="login-submit-button"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="button-spinner-icon" />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
