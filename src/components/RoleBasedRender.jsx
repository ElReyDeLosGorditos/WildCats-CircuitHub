import { useAuth } from '../contexts/AuthContext';

/**
 * Component to conditionally render content based on user role
 * 
 * Usage:
 * <RoleBasedRender roles={['admin']}>
 *   <button>Admin Only Button</button>
 * </RoleBasedRender>
 * 
 * <RoleBasedRender roles={['admin', 'teacher']}>
 *   <button>Admin or Teacher Button</button>
 * </RoleBasedRender>
 */
export const RoleBasedRender = ({ roles, children }) => {
  const { userRole } = useAuth();
  
  if (!roles || roles.length === 0) {
    return children;
  }
  
  if (roles.includes(userRole)) {
    return children;
  }
  
  return null;
};

/**
 * Admin only content
 */
export const AdminOnly = ({ children }) => {
  return <RoleBasedRender roles={['admin']}>{children}</RoleBasedRender>;
};

/**
 * Teacher only content (includes admin)
 */
export const TeacherOnly = ({ children }) => {
  return <RoleBasedRender roles={['admin', 'teacher']}>{children}</RoleBasedRender>;
};

/**
 * Lab Assistant only content (includes admin)
 */
export const LabAssistantOnly = ({ children }) => {
  return <RoleBasedRender roles={['admin', 'lab-assistant']}>{children}</RoleBasedRender>;
};

/**
 * Staff only content (admin, teacher, or lab assistant)
 */
export const StaffOnly = ({ children }) => {
  return <RoleBasedRender roles={['admin', 'teacher', 'lab-assistant']}>{children}</RoleBasedRender>;
};

/**
 * Student only content
 */
export const StudentOnly = ({ children }) => {
  return <RoleBasedRender roles={['student']}>{children}</RoleBasedRender>;
};

/**
 * Hide content from certain roles
 */
export const HideFromRoles = ({ roles, children }) => {
  const { userRole } = useAuth();
  
  if (roles.includes(userRole)) {
    return null;
  }
  
  return children;
};

export default RoleBasedRender;
