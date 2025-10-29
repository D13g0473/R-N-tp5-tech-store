import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { getImageUrl } from '../services/api';
import QuantitySelector from '../components/QuantitySelector';

const { width } = Dimensions.get('window');

const ProductDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { product } = route.params as { product: Product };
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const discountedPrice = product.Price * (1 - product.discount / 100);

  const finalPrice = discountedPrice * quantity;

  // Construir URLs completas de las imágenes
  const mainImageUrl = product.image?.[selectedImageIndex]
    ? getImageUrl(product.image[selectedImageIndex].url)
    : 'https://via.placeholder.com/300';

  // Calcular el alto proporcional de la imagen
  const getImageHeight = () => {
    if (imageDimensions.width === 0 || imageDimensions.height === 0) {
      return 300; // Alto por defecto
    }

    const aspectRatio = imageDimensions.height / imageDimensions.width;
    const calculatedHeight = width * aspectRatio;

    // Limitar el alto máximo para evitar imágenes demasiado grandes
    return Math.min(calculatedHeight, 500);
  };
  const handleAddToCart = () => {
    addToCart(product, quantity);
    Alert.alert('Success', `${quantity} x ${product.name} added to cart!`);
    navigation.goBack();
  };

  const handleFavoriteToggle = () => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
      Alert.alert('Removed', 'Product removed from favorites');
    } else {
      addToFavorites(product);
      Alert.alert('Added', 'Product added to favorites');
    }
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };


  return (
    <ScrollView style={styles.container}>
      {/* Image Gallery */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: mainImageUrl }}
          style={[styles.mainImage, { height: getImageHeight() }]}
          resizeMode="contain"
          onLoad={(event) => {
            const { width: imgWidth, height: imgHeight } = event.nativeEvent.source;
            setImageDimensions({ width: imgWidth, height: imgHeight });
          }}
        />
        {product.image && product.image.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailContainer}>
            {product.image.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImageIndex(index)}
                style={[styles.thumbnail, selectedImageIndex === index && styles.thumbnailSelected]}
              >
                <Image source={{ uri: getImageUrl(image.url) }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.brand}>{product.brand?.name || 'Unknown Brand'}</Text>

        {/* Price */}
        <View style={styles.priceContainer}>
          {product.discount > 0 ? (
            <>
              <Text style={styles.originalPrice}>${product.Price}</Text>
              <Text style={styles.discountedPrice}>${discountedPrice.toFixed(2)}</Text>
              <Text style={styles.discountBadge}>-{product.discount}%</Text>
            </>
          ) : (
            <Text style={styles.price}>${product.Price}</Text>
          )}
        </View>

        {/* Stock */}
        <Text style={[styles.stock, product.stock < 10 && styles.lowStock]}>
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </Text>

        {/* Quantity Selector */}
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Quantity:</Text>
          <QuantitySelector
            quantity={quantity}
            maxStock={product.stock}
            onIncrease={increaseQuantity}
            onDecrease={decreaseQuantity}
          />
        </View>

        {/* Total */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>${finalPrice.toFixed(2)}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.favoriteButton, isFavorite(product.id) && styles.favoriteButtonActive]}
            onPress={handleFavoriteToggle}
          >
            <Text style={[styles.buttonText, styles.favoriteButtonText, isFavorite(product.id) && styles.favoriteButtonTextActive]}>
              {isFavorite(product.id) ? '❤️ In Favorites' : '🤍 Add to Favorites'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cartButton, product.stock === 0 && styles.buttonDisabled]}
            onPress={handleAddToCart}
            disabled={product.stock === 0}
          >
            <Text style={[styles.buttonText, product.stock === 0 && styles.buttonTextDisabled]}>
              {product.stock === 0 ? 'Out of Stock' : `Add ${quantity} to Cart`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specContainer}>
            <Text style={styles.specLabel}>Category:</Text>
            <Text style={styles.specValue}>{product.category?.name || 'Unknown Category'}</Text>
          </View>
          <View style={styles.specContainer}>
            <Text style={styles.specLabel}>Brand:</Text>
            <Text style={styles.specValue}>{product.brand?.name || 'Unknown Brand'}</Text>
          </View>
          <View style={styles.specContainer}>
            <Text style={styles.specLabel}>Stock:</Text>
            <Text style={styles.specValue}>{product.stock} units</Text>
          </View>
          {product.discount > 0 && (
            <View style={styles.specContainer}>
              <Text style={styles.specLabel}>Discount:</Text>
              <Text style={styles.specValue}>{product.discount}% off</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingTop:25,
  },
  imageContainer: {
    backgroundColor: 'white',
  },
  mainImage: {
    width: width,
    // El alto se calcula dinámicamente basado en las dimensiones de la imagen
  },
  thumbnailContainer: {
    padding: 16,
  },
  thumbnail: {
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailSelected: {
    borderColor: '#007AFF',
  },
  thumbnailImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  infoContainer: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  brand: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  originalPrice: {
    fontSize: 20,
    textDecorationLine: 'line-through',
    color: '#8E8E93',
    marginRight: 12,
  },
  discountedPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginRight: 12,
  },
  discountBadge: {
    backgroundColor: '#FF3B30',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  stock: {
    fontSize: 16,
    color: '#34C759',
    marginBottom: 20,
  },
  lowStock: {
    color: '#FF9500',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginRight: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E5E5EA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 32,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  favoriteButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  favoriteButtonActive: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FF3B30',
  },
  favoriteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  favoriteButtonTextActive: {
    color: '#FF3B30',
  },
  cartButton: {
    backgroundColor: '#007AFF',
  },
  buttonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  buttonTextDisabled: {
    color: '#8E8E93',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#3C3C43',
    lineHeight: 24,
  },
  specContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  specLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  specValue: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
});

export default ProductDetailScreen;