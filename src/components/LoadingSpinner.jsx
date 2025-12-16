import logo from '../assets/circuithubLogo2.png';

/**
 * LoadingSpinner Component
 * Reusable loading spinner used throughout the application
 */
export const LoadingSpinner = ({ message = "Loading..." }) => {
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
        {message}
      </p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
