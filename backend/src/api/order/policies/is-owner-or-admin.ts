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

  // For customers, check if they own the order
  const orderId = policyContext.params?.id;
  if (orderId) {
    // For specific order operations, check ownership
    const order = strapi.entityService.findOne('api::order.order', orderId, {
      populate: ['user']
    });

    if (order && order.user?.id === user.id) {
      return true;
    }
    return false;
  }

  // For general operations (create, list), allow authenticated users
  return true;
};