import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/circuithubLogo2.png';

/**
 * AutoRedirect Component
 * Automatically redirects authenticated users to their role-appropriate dashboard
 * from public pages (login, landing, register)
 */
export const AutoRedirect = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // List of public routes where authenticated users should be redirected FROM
  const publicRoutes = ['/', '/login', '/register', '/features', '/FAQs', '/ContactUs', '/HowItWorks'];
  
  useEffect(() => {
    // Only redirect if:
    // 1. Not loading (authentication check complete)
    // 2. User is authenticated
    // 3. Currently on a public route
    if (!loading && currentUser && userRole) {
      const isOnPublicRoute = publicRoutes.includes(location.pathname);
      
      if (isOnPublicRoute) {
        console.log('🔄 Auto-redirecting authenticated user. Role:', userRole);
        
        // Role-based redirection
        switch (userRole) {
          case 'admin':
            navigate('/admin-dashboard', { replace: true });
            break;
          case 'teacher':
            navigate('/t-dashboard', { replace: true });
            break;
          case 'lab_assistant':
            navigate('/admin-dashboard', { replace: true }); // Lab assistants share admin dashboard
            break;
          case 'student':
          default:
            navigate('/dashboard', { replace: true });
            break;
        }
      }
    }
  }, [currentUser, userRole, loading, location.pathname, navigate]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          position: 'relative',
          width: '120px',
          height: '120px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Spinning border */}
          <div style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            border: '4px solid #e0e0e0',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          {/* Logo */}
          <img 
            src={logo} 
            alt="CircuitHub Logo" 
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'contain',
              zIndex: 1
            }}
          />
        </div>
        <h2 style={{
          marginTop: '24px',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#2c3e50',
          marginBottom: '8px'
        }}>
          WildCats CircuitHub
        </h2>
        <p style={{
          marginTop: '8px',
          fontSize: '16px',
          color: '#666'
        }}>
          Loading CircuitHub...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Render children if not redirecting
  return children;
};

/**
 * PublicRoute Component
 * Wrapper for public routes that should redirect authenticated users
 */
export const PublicRoute = ({ children }) => {
  return <AutoRedirect>{children}</AutoRedirect>;
};
