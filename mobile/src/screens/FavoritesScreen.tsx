import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types';
import { userAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

const FavoritesScreen: React.FC = () => {
  const { favorites, removeFromFavorites, setFavorites } = useFavorites();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (user && favorites.length === 0) {
      loadFavoritesFromServer();
    }
  }, [user]);

  const loadFavoritesFromServer = async () => {
    try {
      const profile = await userAPI.getProfile();
      if (profile.favorites && profile.favorites.length > 0) {
        setFavorites(profile.favorites);
      }
    } catch (error) {
      console.error('Failed to load favorites from server:', error);
    }
  };

  const handleProductPress = (product: Product) => {
    (navigation as any).navigate('ProductDetail', { product });
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    Alert.alert('Success', `${product.name} added to cart!`);
  };

  const handleRemoveFavorite = async (productId: number, productName: string) => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please login to manage favorites', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Login' as never) }
      ]);
      return;
    }

    Alert.alert(
      'Remove from Favorites',
      `Remove ${productName} from favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedFavorites = favorites.filter(fav => fav.id !== productId);
              await userAPI.updateFavorites(updatedFavorites.map(fav => fav.id));
              setFavorites(updatedFavorites);
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error?.message || 'Failed to remove from favorites');
            }
          }
        },
      ]
    );
  };

  const renderFavorite = ({ item }: { item: Product }) => (
    <View style={styles.favoriteItem}>
      <ProductCard
        product={item}
        onPress={() => handleProductPress(item)}
        onAddToCart={() => handleAddToCart(item)}
      />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFavorite(item.id, item.name)}
      >
        <Text style={styles.removeButtonText}>Remove from Favorites</Text>
      </TouchableOpacity>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.authRequiredContainer}>
        <Text style={styles.authRequiredEmoji}>🔒</Text>
        <Text style={styles.authRequiredTitle}>Login Required</Text>
        <Text style={styles.authRequiredSubtitle}>Please login to view your favorites</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>❤️</Text>
        <Text style={styles.emptyTitle}>No favorites yet</Text>
        <Text style={styles.emptySubtitle}>Products you favorite will appear here</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('HomeTab' as never)}
        >
          <Text style={styles.shopButtonText}>Browse Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Favorites ({favorites.length})</Text>

      <FlatList
        data={favorites}
        renderItem={renderFavorite}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.favoritesList}
        showsVerticalScrollIndicator={false}
      />
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
  favoritesList: {
    padding: 20,
    paddingTop: 0,
  },
  favoriteItem: {
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
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
  authRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F2F2F7',
  },
  authRequiredEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  authRequiredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  authRequiredSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 32,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default FavoritesScreen;