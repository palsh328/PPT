const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ProductComparisonService {
  constructor() {
    this.comparisonCriteria = {
      laptops: [
        { key: 'processor', weight: 0.25, label: 'Processor' },
        { key: 'ram', weight: 0.20, label: 'RAM' },
        { key: 'storage', weight: 0.15, label: 'Storage' },
        { key: 'graphics', weight: 0.20, label: 'Graphics' },
        { key: 'display', weight: 0.10, label: 'Display' },
        { key: 'battery', weight: 0.10, label: 'Battery Life' }
      ],
      smartphones: [
        { key: 'processor', weight: 0.20, label: 'Processor' },
        { key: 'camera', weight: 0.25, label: 'Camera' },
        { key: 'battery', weight: 0.20, label: 'Battery' },
        { key: 'display', weight: 0.15, label: 'Display' },
        { key: 'storage', weight: 0.10, label: 'Storage' },
        { key: 'ram', weight: 0.10, label: 'RAM' }
      ],
      headphones: [
        { key: 'sound_quality', weight: 0.30, label: 'Sound Quality' },
        { key: 'noise_cancellation', weight: 0.25, label: 'Noise Cancellation' },
        { key: 'battery', weight: 0.20, label: 'Battery Life' },
        { key: 'comfort', weight: 0.15, label: 'Comfort' },
        { key: 'connectivity', weight: 0.10, label: 'Connectivity' }
      ]
    };
  }

  async compareProducts(productIds, userPreferences = {}) {
    try {
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          isActive: true
        },
        include: {
          category: true,
          reviews: {
            select: {
              rating: true,
              comment: true
            }
          }
        }
      });

      if (products.length < 2) {
        throw new Error('Need at least 2 products to compare');
      }

      const comparison = {
        products: products.map(p => this.formatProductForComparison(p)),
        analysis: this.analyzeComparison(products, userPreferences),
        recommendation: this.generateRecommendation(products, userPreferences),
        summary: this.generateComparisonSummary(products)
      };

      return comparison;
    } catch (error) {
      console.error('Product comparison error:', error);
      throw error;
    }
  }

  formatProductForComparison(product) {
    const avgRating = product.reviews.length > 0 
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;

    return {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      mrp: product.mrp,
      discount: Math.round(((product.mrp - product.price) / product.mrp) * 100),
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length,
      category: product.category?.name,
      features: product.features || [],
      specifications: product.specifications || {},
      images: product.images,
      pros: this.extractPros(product),
      cons: this.extractCons(product)
    };
  }

  extractPros(product) {
    const pros = [];
    const specs = product.specifications || {};
    const features = product.features || [];

    // Price-based pros
    if (product.mrp > product.price) {
      const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
      if (discount > 20) {
        pros.push(`Great value with ${discount}% discount`);
      }
    }

    // Feature-based pros
    if (features.includes('gaming')) pros.push('Excellent for gaming');
    if (features.includes('lightweight')) pros.push('Portable and lightweight');
    if (features.includes('long_battery')) pros.push('Long battery life');
    if (features.includes('fast_charging')) pros.push('Fast charging support');

    // Specification-based pros
    if (specs.ram && parseInt(specs.ram) >= 16) pros.push('High RAM capacity');
    if (specs.storage && specs.storage.includes('SSD')) pros.push('Fast SSD storage');
    if (specs.processor && specs.processor.includes('i7')) pros.push('Powerful processor');

    return pros.slice(0, 3); // Top 3 pros
  }

  extractCons(product) {
    const cons = [];
    const specs = product.specifications || {};

    // Price-based cons
    if (product.price > 100000) cons.push('Premium pricing');
    
    // Specification-based cons
    if (specs.ram && parseInt(specs.ram) < 8) cons.push('Limited RAM');
    if (specs.storage && !specs.storage.includes('SSD')) cons.push('Traditional HDD storage');
    if (specs.battery && parseInt(specs.battery) < 4000) cons.push('Average battery capacity');

    return cons.slice(0, 2); // Top 2 cons
  }

  analyzeComparison(products, userPreferences) {
    const analysis = {
      priceComparison: this.analyzePrices(products),
      featureComparison: this.analyzeFeatures(products),
      ratingComparison: this.analyzeRatings(products),
      valueAnalysis: this.analyzeValue(products),
      categoryInsights: this.getCategoryInsights(products[0].category?.name)
    };

    return analysis;
  }

  analyzePrices(products) {
    const prices = products.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    return {
      range: { min: minPrice, max: maxPrice },
      difference: maxPrice - minPrice,
      differencePercentage: Math.round(((maxPrice - minPrice) / minPrice) * 100),
      cheapest: products.find(p => p.price === minPrice),
      mostExpensive: products.find(p => p.price === maxPrice),
      averagePrice: Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length)
    };
  }

  analyzeFeatures(products) {
    const allFeatures = new Set();
    products.forEach(p => {
      (p.features || []).forEach(f => allFeatures.add(f));
    });

    const featureMatrix = {};
    allFeatures.forEach(feature => {
      featureMatrix[feature] = products.map(p => 
        (p.features || []).includes(feature)
      );
    });

    return {
      commonFeatures: Array.from(allFeatures).filter(feature =>
        featureMatrix[feature].every(has => has)
      ),
      uniqueFeatures: this.findUniqueFeatures(products),
      featureMatrix
    };
  }

  findUniqueFeatures(products) {
    const unique = {};
    products.forEach((product, index) => {
      const otherProducts = products.filter((_, i) => i !== index);
      const uniqueToThis = (product.features || []).filter(feature =>
        !otherProducts.some(other => (other.features || []).includes(feature))
      );
      if (uniqueToThis.length > 0) {
        unique[product.id] = uniqueToThis;
      }
    });
    return unique;
  }

  analyzeRatings(products) {
    const ratings = products.map(p => {
      const avgRating = p.reviews.length > 0 
        ? p.reviews.reduce((sum, review) => sum + review.rating, 0) / p.reviews.length
        : 0;
      return { productId: p.id, rating: avgRating, reviewCount: p.reviews.length };
    });

    const bestRated = ratings.reduce((best, current) => 
      current.rating > best.rating ? current : best
    );

    return {
      ratings,
      bestRated,
      averageRating: ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length,
      totalReviews: ratings.reduce((sum, r) => sum + r.reviewCount, 0)
    };
  }

  analyzeValue(products) {
    const valueScores = products.map(product => {
      const avgRating = product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 3;

      // Simple value score: (rating * features) / price
      const featureCount = (product.features || []).length;
      const valueScore = (avgRating * (featureCount + 1)) / (product.price / 10000);

      return {
        productId: product.id,
        valueScore: Math.round(valueScore * 100) / 100,
        reasoning: this.generateValueReasoning(product, avgRating, featureCount)
      };
    });

    const bestValue = valueScores.reduce((best, current) => 
      current.valueScore > best.valueScore ? current : best
    );

    return {
      valueScores,
      bestValue,
      analysis: "Value calculated based on price, features, and user ratings"
    };
  }

  generateValueReasoning(product, rating, featureCount) {
    const reasons = [];
    
    if (rating > 4.0) reasons.push('high user satisfaction');
    if (featureCount > 5) reasons.push('feature-rich');
    if (product.price < 50000) reasons.push('budget-friendly');
    
    const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
    if (discount > 15) reasons.push(`${discount}% discount`);

    return reasons.join(', ') || 'balanced offering';
  }

  getCategoryInsights(categoryName) {
    const insights = {
      laptops: {
        keyFactors: ['Processor performance', 'RAM capacity', 'Storage type', 'Graphics capability'],
        buyingTips: [
          'Consider your primary use case (gaming, work, study)',
          'SSD storage significantly improves performance',
          '16GB RAM is recommended for multitasking',
          'Check port availability for your peripherals'
        ]
      },
      smartphones: {
        keyFactors: ['Camera quality', 'Battery life', 'Display quality', 'Performance'],
        buyingTips: [
          'Camera specs matter more than megapixels',
          'Consider battery capacity for your usage',
          'Display refresh rate affects smoothness',
          'Check software update policy'
        ]
      },
      headphones: {
        keyFactors: ['Sound quality', 'Comfort', 'Battery life', 'Noise cancellation'],
        buyingTips: [
          'Try before buying if possible',
          'Consider your primary use (music, calls, gaming)',
          'Check codec support for your devices',
          'Comfort is crucial for long sessions'
        ]
      }
    };

    return insights[categoryName?.toLowerCase()] || {
      keyFactors: ['Price', 'Quality', 'Features', 'Brand reputation'],
      buyingTips: ['Research thoroughly', 'Read user reviews', 'Compare specifications', 'Consider warranty']
    };
  }

  generateRecommendation(products, userPreferences) {
    const analysis = this.analyzeComparison(products, userPreferences);
    
    // Determine recommendation based on user preferences or general criteria
    let recommendedProduct;
    let reason;

    if (userPreferences.priority === 'budget') {
      recommendedProduct = analysis.priceComparison.cheapest;
      reason = 'Best budget option with good value for money';
    } else if (userPreferences.priority === 'features') {
      // Find product with most features
      const productWithMostFeatures = products.reduce((best, current) => 
        (current.features?.length || 0) > (best.features?.length || 0) ? current : best
      );
      recommendedProduct = productWithMostFeatures;
      reason = 'Most feature-rich option for power users';
    } else if (userPreferences.priority === 'rating') {
      recommendedProduct = products.find(p => p.id === analysis.ratingComparison.bestRated.productId);
      reason = 'Highest rated by users for reliability';
    } else {
      // Default to best value
      recommendedProduct = products.find(p => p.id === analysis.valueAnalysis.bestValue.productId);
      reason = 'Best overall value considering price, features, and ratings';
    }

    return {
      productId: recommendedProduct.id,
      productName: recommendedProduct.name,
      reason,
      confidence: this.calculateRecommendationConfidence(recommendedProduct, products),
      alternatives: this.suggestAlternatives(recommendedProduct, products)
    };
  }

  calculateRecommendationConfidence(recommended, allProducts) {
    // Simple confidence based on how much better the recommended product is
    const avgPrice = allProducts.reduce((sum, p) => sum + p.price, 0) / allProducts.length;
    const priceScore = recommended.price <= avgPrice ? 0.3 : 0.1;
    
    const avgRating = allProducts.reduce((sum, p) => {
      const rating = p.reviews.length > 0 
        ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
        : 3;
      return sum + rating;
    }, 0) / allProducts.length;
    
    const recommendedRating = recommended.reviews.length > 0 
      ? recommended.reviews.reduce((s, r) => s + r.rating, 0) / recommended.reviews.length
      : 3;
    
    const ratingScore = recommendedRating >= avgRating ? 0.4 : 0.2;
    const featureScore = (recommended.features?.length || 0) > 3 ? 0.3 : 0.2;

    return Math.min(priceScore + ratingScore + featureScore, 1.0);
  }

  suggestAlternatives(recommended, allProducts) {
    const alternatives = allProducts
      .filter(p => p.id !== recommended.id)
      .map(product => ({
        productId: product.id,
        productName: product.name,
        reason: this.getAlternativeReason(product, recommended)
      }));

    return alternatives.slice(0, 2); // Top 2 alternatives
  }

  getAlternativeReason(alternative, recommended) {
    if (alternative.price < recommended.price) {
      return 'More budget-friendly option';
    }
    if ((alternative.features?.length || 0) > (recommended.features?.length || 0)) {
      return 'More features for power users';
    }
    if (alternative.brand !== recommended.brand) {
      return `Alternative from ${alternative.brand}`;
    }
    return 'Different approach to similar needs';
  }

  generateComparisonSummary(products) {
    const summary = {
      totalProducts: products.length,
      priceRange: {
        min: Math.min(...products.map(p => p.price)),
        max: Math.max(...products.map(p => p.price))
      },
      brands: [...new Set(products.map(p => p.brand))],
      categories: [...new Set(products.map(p => p.category?.name).filter(Boolean))],
      keyDifferences: this.identifyKeyDifferences(products)
    };

    return summary;
  }

  identifyKeyDifferences(products) {
    const differences = [];
    
    // Price differences
    const prices = products.map(p => p.price);
    const priceRange = Math.max(...prices) - Math.min(...prices);
    if (priceRange > 10000) {
      differences.push(`Significant price variation (₹${priceRange.toLocaleString()} difference)`);
    }

    // Brand differences
    const brands = new Set(products.map(p => p.brand));
    if (brands.size > 1) {
      differences.push(`Multiple brands: ${Array.from(brands).join(', ')}`);
    }

    // Feature differences
    const allFeatures = new Set();
    products.forEach(p => (p.features || []).forEach(f => allFeatures.add(f)));
    if (allFeatures.size > 5) {
      differences.push('Diverse feature sets across products');
    }

    return differences.slice(0, 3);
  }

  // Generate comparison table data
  generateComparisonTable(products) {
    const specs = new Set();
    products.forEach(p => {
      Object.keys(p.specifications || {}).forEach(spec => specs.add(spec));
    });

    const table = {
      headers: ['Specification', ...products.map(p => p.name)],
      rows: []
    };

    // Basic info rows
    table.rows.push(['Price', ...products.map(p => `₹${p.price.toLocaleString()}`)]);
    table.rows.push(['Brand', ...products.map(p => p.brand)]);
    table.rows.push(['Rating', ...products.map(p => {
      const rating = p.reviews.length > 0 
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
        : 0;
      return `${rating.toFixed(1)}/5 (${p.reviews.length} reviews)`;
    })]);

    // Specification rows
    Array.from(specs).forEach(spec => {
      const row = [spec, ...products.map(p => p.specifications?.[spec] || 'N/A')];
      table.rows.push(row);
    });

    return table;
  }
}

module.exports = new ProductComparisonService();