import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TextInput, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { productsAPI, categoriesAPI, brandsAPI } from '../services/api';
import { Product, Category, Brand } from '../types';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';
import FilterChips from '../components/FilterChips';

const HomeScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedBrand, setSelectedBrand] = useState<number | undefined>();

  const navigation = useNavigation();
  const { addToCart } = useCart();

  const loadData = async () => {
    try {
      const [productsResponse, categoriesResponse, brandsResponse] = await Promise.all([
        productsAPI.getProducts(),
        categoriesAPI.getCategories(),
        brandsAPI.getBrands(),
      ]);

      setProducts(productsResponse.data);
      setCategories(categoriesResponse.data);
      setBrands(brandsResponse.data);
    } catch (error) {
      Alert.alert('Error', 'Fallo la carga de datos. Intenta nuevamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category?.id === selectedCategory;
    const matchesBrand = !selectedBrand || product.brand?.id === selectedBrand;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  const handleProductPress = (product: Product) => {
    (navigation as any).navigate('ProductDetail', { product });
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    Alert.alert('Exito', `${product.name} añadido al carrito!`);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar productos ..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FilterChips
        categories={categories}
        brands={brands}
        selectedCategory={selectedCategory}
        selectedBrand={selectedBrand}
        onCategorySelect={setSelectedCategory}
        onBrandSelect={setSelectedBrand}
      />

      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => (
          <View style={styles.productContainer}>
            <ProductCard
              product={item}
              onPress={() => handleProductPress(item)}
              onAddToCart={() => handleAddToCart(item)}
            />
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.productList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:20,
    backgroundColor: '#F2F2F7',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  searchInput: {
    backgroundColor: 'white',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  productList: {
    paddingBottom: 20,
  },
  productContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default HomeScreen;