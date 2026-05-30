import { Navigate } from "react-router-dom"
import useAuthStore from "../store/authStore.js" // Import the auth store

/**
 * A component that protects routes based on user authentication and role.
 * If the user is not authenticated, they are redirected to the login page.
 * If the user is authenticated but does not have an allowed role, they are redirected to the home page.
 * @param {Object} props - The component props.
 * @param {string|string[]} props.requiredRole - The role(s) that are allowed to access this route.
 * @param {React.ReactNode} props.children - The child components to render if access is granted.
 */
function ProtectedRoute({ requiredRole, children }) {
  const { token, user } = useAuthStore() // Get token and user from the auth store

  // If no token is present, the user is not authenticated
  if (!token) {
    return <Navigate to="/login" replace /> // Redirect to login page
  }

  // If user data is not loaded or role is missing
  if (!user || !user.role) {
    return <Navigate to="/login" replace />
  }

  // Check if the user's role matches the required role(s)
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      // If unauthorized, redirect to their default home or profile
      return <Navigate to="/" replace />
    }
  }

  // If authenticated and authorized, render the child components
  return children
}

export default ProtectedRoute
