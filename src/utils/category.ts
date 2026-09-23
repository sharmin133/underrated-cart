export function getCategoryIcon(category: string): string {
  const map: Record<string, string> = {
    beauty: 'sparkles-outline',
    fragrances: 'flower-outline',
    furniture: 'bed-outline',
    groceries: 'basket-outline',
    'home-decoration': 'home-outline',
    'kitchen-accessories': 'restaurant-outline',
    laptops: 'laptop-outline',
    'mens-shirts': 'shirt-outline',
    'mens-shoes': 'footsteps-outline',
    'mens-watches': 'watch-outline',
    'mobile-accessories': 'phone-portrait-outline',
    motorcycle: 'bicycle-outline',
    'skin-care': 'water-outline',
    smartphones: 'phone-portrait-outline',
    'sports-accessories': 'basketball-outline',
    sunglasses: 'glasses-outline',
    tablets: 'tablet-portrait-outline',
    tops: 'shirt-outline',
    vehicle: 'car-outline',
    'womens-bags': 'bag-outline',
    'womens-dresses': 'woman-outline',
    'womens-jewellery': 'diamond-outline',
    'womens-shoes': 'footsteps-outline',
    'womens-watches': 'watch-outline',
  };
  return map[category] ?? 'pricetag-outline';
}

export function formatCategoryLabel(category: string): string {
  return category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}