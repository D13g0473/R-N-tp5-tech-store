import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { CartItem } from '../types';
import { getImageUrl, ordersAPI } from '../services/api';
import QuantitySelector from '../components/QuantitySelector';

const CartScreen: React.FC = () => {
  const navigation = useNavigation();
  const { cart, updateQuantity, removeFromCart, getTotal, clearCart } = useCart();
  const { user } = useAuth();

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: number, productName: string) => {
    Alert.alert(
      'Remove Item',
      `Remove ${productName} from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(productId) },
      ]
    );
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Carrito vacio', 'Añade algun producto primero!');
      return;
    }

    if (!user) {
      Alert.alert('Se necesita autenticacion!', 'Por favor logeate para porder realizar una orden', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Login' as never) }
      ]);
      return;
    }

    Alert.alert(
      'Orden confirmada',
      `Total: $${getTotal().toFixed(2)}\n\nEsto creara una orden real en el sistema.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ordenar',
          onPress: async () => {
            try {
              await ordersAPI.createOrder({
                items: cart.map((item) => ({
                  product: item.product.id,
                  quantity: item.quantity
                })),
                total: getTotal()
              });

              clearCart();
              Alert.alert('Exito!', 'A realizado su orden con exito!', [
                { text: 'OK', onPress: () => navigation.navigate('HomeTab' as never) }
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error?.message || 'La orden fallo. Intenta nuevamente.');
            }
          }
        }
      ]
    );
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const discountedPrice = item.product.Price * (1 - item.product.discount / 100);
    const itemTotal = discountedPrice * item.quantity;

    return (
      <View style={styles.cartItem}>
        <Image
          source={{ uri: item.product.image?.[0] ? getImageUrl(item.product.image[0].formats?.thumbnail?.url || item.product.image[0].url) : 'https://via.placeholder.com/80' }}
          style={styles.productImage}
          resizeMode="cover"
        />

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.product.name}</Text>
          <Text style={styles.productBrand}>{item.product.brand?.name || 'Unknown Brand'}</Text>

          <View style={styles.priceContainer}>
            {item.product.discount > 0 ? (
              <>
                <Text style={styles.originalPrice}>${item.product.Price}</Text>
                <Text style={styles.discountedPrice}>${discountedPrice.toFixed(2)}</Text>
              </>
            ) : (
              <Text style={styles.price}>${item.product.Price}</Text>
            )}
          </View>

          <Text style={styles.stock}>Stock: {item.product.stock}</Text>
        </View>

        <View style={styles.actionsContainer}>
          <QuantitySelector
            quantity={item.quantity}
            maxStock={item.product.stock}
            onIncrease={() => handleQuantityChange(item.product.id, item.quantity + 1)}
            onDecrease={() => handleQuantityChange(item.product.id, item.quantity - 1)}
          />

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item.product.id, item.product.name)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.itemTotal}>
          <Text style={styles.itemTotalText}>${itemTotal.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add some products to get started!</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('HomeTab' as never)}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Shopping Cart ({cart.length})</Text>

      <FlatList
        data={cart}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.product.id.toString()}
        contentContainerStyle={styles.cartList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>${getTotal().toFixed(2)}</Text>
        </View>

        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearButton} onPress={() => {
          Alert.alert('Clear Cart', 'Remove all items from cart?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: clearCart }
          ]);
        }}>
          <Text style={styles.clearButtonText}>Clear Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    padding: 20,
    paddingBottom: 10,
  },
  cartList: {
    padding: 20,
    paddingTop: 0,
  },
  cartItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  productBrand: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    color: '#8E8E93',
    marginRight: 8,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  stock: {
    fontSize: 12,
    color: '#34C759',
  },
  actionsContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  removeButton: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  removeButtonText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '500',
  },
  itemTotal: {
    alignItems: 'flex-end',
  },
  itemTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  checkoutButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 32,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default CartScreen;