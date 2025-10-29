/**
 * order router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::order.order', {
  config: {
    create: {
      policies: ['api::order.is-owner-or-admin'],
    },
    find: {
      policies: ['api::order.is-owner-or-admin'],
    },
    findOne: {
      policies: ['api::order.is-owner-or-admin'],
    },
    update: {
      policies: ['api::order.is-owner-or-admin'],
    },
    delete: {
      policies: ['api::order.is-owner-or-admin'],
    },
  },
});
