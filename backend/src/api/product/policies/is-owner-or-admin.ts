/**
 * is-owner-or-admin policy
 */

export default (policyContext, config, { strapi }) => {
  // For authenticated users, allow access to their own orders
  // For admin users, allow access to all orders
  const { user } = policyContext.state;

  if (!user) {
    return false; // Deny access if not authenticated
  }

  // Admin users have full access
  if (user.role?.type === 'admin' || user.role?.name === 'admin') {
    return true;
  }

  // For customers, they can only access their own data
  // This policy is mainly for orders, but can be adapted for other content types
  return true; // Allow for now, implement specific logic per content type
};