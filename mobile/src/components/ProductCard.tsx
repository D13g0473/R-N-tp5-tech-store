import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Product } from '../types';
import { getImageUrl } from '../services/api';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, onAddToCart }) => {
  const discountedPrice = product.Price * (1 - product.discount / 100);

  // Construir URL completa de la imagen (usar thumbnail si está disponible)
  const imageUrl = getImageUrl(product.image?.[0]?.formats?.small?.url || product.image?.[0]?.url);
  console.log("URL: "+JSON.stringify(product))
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
        onError={(error) => console.log('Eror al cargar imagen:', error.nativeEvent.error)}
        onLoad={() => console.log('Imagen cargada con exito:', imageUrl)}
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <View style={styles.priceContainer}>
          {product.discount > 0 ? (
            <>
              <Text style={styles.originalPrice}>${product.Price}</Text>
              <Text style={styles.discountedPrice}>${discountedPrice.toFixed(2)}</Text>
            </>
          ) : (
            <Text style={styles.price}>${product.Price}</Text>
          )}
        </View>
        <Text style={styles.stock}>Stock: {product.stock}</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddToCart}>
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    width: 180, // Ancho fijo uniforme
  },
  image: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginTop: 10,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  stock: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProductCard;