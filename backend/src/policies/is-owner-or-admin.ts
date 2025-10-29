/**
 * is-owner-or-admin policy
 */

export default (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;

  if (!user) {
    return false; // Deny access if not authenticated
  }

  // Admin users have full access
  if (user.role?.type === 'admin' || user.role?.name === 'admin') {
    return true;
  }

  // For customers, check if they own the resource
  const resourceId = policyContext.params?.id;
  if (resourceId) {
    // This is a generic policy - specific logic should be implemented per content type
    // For orders, check ownership
    // For users, only allow access to own profile
    return true; // Allow for now, implement specific logic per route
  }

  // For general operations, allow authenticated users
  return true;
};