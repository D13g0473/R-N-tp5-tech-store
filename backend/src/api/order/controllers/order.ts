/**
 * order controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  async create(ctx) {
    try {
      const { items, total } = ctx.request.body.data;

      // Verificar stock disponible para todos los productos
      for (const item of items) {
        const product = await strapi.entityService.findOne('api::product.product', item.product);

        if (!product) {
          return ctx.badRequest('Producto no encontrado', { product: item.product });
        }

        if (product.stock < item.quantity) {
          return ctx.badRequest('Stock insuficiente', {
            product: item.product,
            available: product.stock,
            requested: item.quantity
          });
        }
      }

      // Crear la orden
      const order = await strapi.entityService.create('api::order.order', {
        data: {
          items,
          total,
          user: ctx.state.user.id, // Usuario autenticado
          publishedAt: new Date(),
        },
        populate: ['user']
      });

      // Actualizar stock de productos
      for (const item of items) {
        const product = await strapi.entityService.findOne('api::product.product', item.product);
        const newStock = product.stock - item.quantity;

        await strapi.entityService.update('api::product.product', item.product, {
          data: {
            stock: newStock,
            isActive: newStock > 0 // Desactivar producto si stock llega a 0
          }
        });
      }

      ctx.send(order);
    } catch (error) {
      ctx.badRequest('Error al crear la orden', { error: error.message });
    }
  }
}));
