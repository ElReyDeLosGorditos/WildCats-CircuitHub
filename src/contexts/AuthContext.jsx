import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebaseconfig';
import { onAuthStateChanged } from 'firebase/auth';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get the ID token
          const idToken = await user.getIdToken();
          setToken(idToken);
          
          // Fetch user data from backend with retry logic for new registrations
          let userData = null;
          let attempts = 0;
          const maxAttempts = 3;
          
          while (!userData && attempts < maxAttempts) {
            try {
              const response = await api.users.getUserByUid(user.uid);
              userData = response.data;
            } catch (error) {
              if (error.response?.status === 404 && attempts < maxAttempts - 1) {
                // User might be newly created, wait a bit and retry
                console.log(`⏳ User not found in backend yet, retrying... (${attempts + 1}/${maxAttempts})`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
                attempts++;
              } else {
                throw error; // Re-throw if not 404 or max attempts reached
              }
            }
          }
          
          if (userData) {
            setCurrentUser(userData);
            setUserRole(userData.role);
            console.log('✅ User authenticated:', userData.email, 'Role:', userData.role);
          } else {
            console.error('❌ User not found in backend after retries');
            setCurrentUser(null);
            setUserRole(null);
            setToken(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setCurrentUser(null);
          setUserRole(null);
          setToken(null);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setToken(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Function to refresh token
  const refreshToken = async () => {
    if (auth.currentUser) {
      const idToken = await auth.currentUser.getIdToken(true);
      setToken(idToken);
      return idToken;
    }
    return null;
  };

  // Helper functions to check roles
  const isAdmin = () => userRole === 'admin';
  const isTeacher = () => userRole === 'teacher';
  const isLabAssistant = () => userRole === 'lab_assistant';
  const isStudent = () => userRole === 'student';
  const isStaff = () => ['admin', 'teacher', 'lab_assistant'].includes(userRole);

  const value = {
    currentUser,
    userRole,
    token,
    loading,
    refreshToken,
    isAdmin,
    isTeacher,
    isLabAssistant,
    isStudent,
    isStaff,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
