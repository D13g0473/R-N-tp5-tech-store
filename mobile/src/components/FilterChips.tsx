import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Category, Brand } from '../types';

interface FilterChipsProps {
  categories: Category[];
  brands: Brand[];
  selectedCategory?: number;
  selectedBrand?: number;
  onCategorySelect: (id: number | undefined) => void;
  onBrandSelect: (id: number | undefined) => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  onCategorySelect,
  onBrandSelect,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
        <TouchableOpacity
          style={[styles.chip, !selectedCategory && styles.chipSelected]}
          onPress={() => onCategorySelect(undefined)}
        >
          <Text style={[styles.chipText, !selectedCategory && styles.chipTextSelected]}>All</Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.chip, selectedCategory === category.id && styles.chipSelected]}
            onPress={() => onCategorySelect(selectedCategory === category.id ? undefined : category.id)}
          >
            <Text style={[styles.chipText, selectedCategory === category.id && styles.chipTextSelected]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Brands</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
        <TouchableOpacity
          style={[styles.chip, !selectedBrand && styles.chipSelected]}
          onPress={() => onBrandSelect(undefined)}
        >
          <Text style={[styles.chipText, !selectedBrand && styles.chipTextSelected]}>All</Text>
        </TouchableOpacity>
        {brands.map((brand) => (
          <TouchableOpacity
            key={brand.id}
            style={[styles.chip, selectedBrand === brand.id && styles.chipSelected]}
            onPress={() => onBrandSelect(selectedBrand === brand.id ? undefined : brand.id)}
          >
            <Text style={[styles.chipText, selectedBrand === brand.id && styles.chipTextSelected]}>
              {brand.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
    marginTop: 8,
  },
  chipsContainer: {
    marginBottom: 8,
  },
  chip: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  chipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipText: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  chipTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
});

export default FilterChips;