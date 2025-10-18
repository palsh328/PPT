const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pulsepixeltech.com' },
    update: {},
    create: {
      email: 'admin@pulsepixeltech.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN'
    }
  });
  console.log('✅ Admin user created');

  // Create test users for each role
  const customerPassword = await bcrypt.hash('customer123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      password: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '9876543210',
      role: 'CUSTOMER'
    }
  });

  const sellerPassword = await bcrypt.hash('seller123', 12);
  const seller = await prisma.user.upsert({
    where: { email: 'seller@test.com' },
    update: {},
    create: {
      email: 'seller@test.com',
      password: sellerPassword,
      firstName: 'Sarah',
      lastName: 'Wilson',
      phone: '9876543211',
      role: 'SELLER'
    }
  });

  // Create Raj Patel seller account
  const rajPassword = await bcrypt.hash('raj123', 12);
  const rajSeller = await prisma.user.upsert({
    where: { email: 'raj@pulsepixeltech.com' },
    update: {},
    create: {
      email: 'raj@pulsepixeltech.com',
      password: rajPassword,
      firstName: 'Raj',
      lastName: 'Patel',
      phone: '9876543213',
      role: 'SELLER'
    }
  });

  const deliveryPassword = await bcrypt.hash('delivery123', 12);
  const delivery = await prisma.user.upsert({
    where: { email: 'delivery@test.com' },
    update: {},
    create: {
      email: 'delivery@test.com',
      password: deliveryPassword,
      firstName: 'Mike',
      lastName: 'Driver',
      phone: '9876543212',
      role: 'DELIVERY'
    }
  });

  console.log('✅ Test users created for all roles');

  // Create categories
  const categories = [
    {
      name: 'Laptops',
      slug: 'laptops',
      description: 'High-performance laptops for work and gaming',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'
    },
    {
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Latest smartphones with cutting-edge technology',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'
    },
    {
      name: 'Tablets',
      slug: 'tablets',
      description: 'Portable tablets for productivity and entertainment',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500'
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Essential accessories for your devices',
      image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500'
    },
    {
      name: 'Audio',
      slug: 'audio',
      description: 'Headphones, speakers, and audio equipment',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
    }
  ];

  const createdCategories = {};
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    });
    createdCategories[category.slug] = created;
  }
  console.log('✅ Categories created');

  // Create products
  const products = [
    // Laptops
    {
      name: 'MacBook Pro 16-inch M3',
      slug: 'macbook-pro-16-m3',
      description: 'The most powerful MacBook Pro ever with M3 chip, perfect for professionals and creators.',
      price: 239900,
      mrp: 249900,
      stock: 25,
      brand: 'Apple',
      model: 'MacBook Pro 16"',
      sku: 'MBP16M3001',
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800'
      ],
      specifications: {
        processor: 'Apple M3 Pro chip',
        memory: '18GB unified memory',
        storage: '512GB SSD',
        display: '16.2-inch Liquid Retina XDR',
        graphics: 'Integrated GPU',
        battery: 'Up to 22 hours'
      },
      features: ['Touch ID', 'Magic Keyboard', 'Force Touch trackpad', 'Thunderbolt 4 ports'],
      categoryId: createdCategories.laptops.id,
      sellerId: seller.id,
      isFeatured: true
    },
    {
      name: 'Dell XPS 13 Plus',
      slug: 'dell-xps-13-plus',
      description: 'Ultra-thin laptop with stunning InfinityEdge display and premium build quality.',
      price: 129900,
      mrp: 139900,
      stock: 30,
      brand: 'Dell',
      model: 'XPS 13 Plus',
      sku: 'DXPS13P001',
      images: [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'
      ],
      specifications: {
        processor: 'Intel Core i7-1360P',
        memory: '16GB LPDDR5',
        storage: '512GB PCIe SSD',
        display: '13.4-inch FHD+ InfinityEdge',
        graphics: 'Intel Iris Xe',
        battery: 'Up to 12 hours'
      },
      features: ['Backlit keyboard', 'Windows Hello', 'Thunderbolt 4', 'Wi-Fi 6E'],
      categoryId: createdCategories.laptops.id,
      sellerId: seller.id,
      isFeatured: true
    },
    
    // Smartphones
    {
      name: 'iPhone 15 Pro Max',
      slug: 'iphone-15-pro-max',
      description: 'The ultimate iPhone with titanium design, A17 Pro chip, and advanced camera system.',
      price: 159900,
      mrp: 159900,
      stock: 50,
      brand: 'Apple',
      model: 'iPhone 15 Pro Max',
      sku: 'IP15PM001',
      images: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'
      ],
      specifications: {
        processor: 'A17 Pro chip',
        memory: '8GB RAM',
        storage: '256GB',
        display: '6.7-inch Super Retina XDR',
        camera: '48MP Main + 12MP Ultra Wide + 12MP Telephoto',
        battery: 'Up to 29 hours video playback'
      },
      features: ['Face ID', '5G capable', 'MagSafe', 'Water resistant IP68'],
      categoryId: createdCategories.smartphones.id,
      sellerId: seller.id,
      isFeatured: true
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      slug: 'samsung-galaxy-s24-ultra',
      description: 'Premium Android flagship with S Pen, incredible cameras, and AI features.',
      price: 129999,
      mrp: 134999,
      stock: 40,
      brand: 'Samsung',
      model: 'Galaxy S24 Ultra',
      sku: 'SGS24U001',
      images: [
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800'
      ],
      specifications: {
        processor: 'Snapdragon 8 Gen 3',
        memory: '12GB RAM',
        storage: '256GB',
        display: '6.8-inch Dynamic AMOLED 2X',
        camera: '200MP Main + 50MP Periscope + 10MP Telephoto + 12MP Ultra Wide',
        battery: '5000mAh with 45W fast charging'
      },
      features: ['S Pen included', '5G ready', 'IP68 rating', 'Wireless charging'],
      categoryId: createdCategories.smartphones.id,
      sellerId: seller.id,
      isFeatured: true
    },

    // Tablets
    {
      name: 'iPad Pro 12.9-inch M2',
      slug: 'ipad-pro-12-9-m2',
      description: 'The most advanced iPad with M2 chip, Liquid Retina XDR display, and Apple Pencil support.',
      price: 112900,
      mrp: 119900,
      stock: 35,
      brand: 'Apple',
      model: 'iPad Pro 12.9"',
      sku: 'IPP129M2001',
      images: [
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800'
      ],
      specifications: {
        processor: 'Apple M2 chip',
        memory: '8GB RAM',
        storage: '128GB',
        display: '12.9-inch Liquid Retina XDR',
        camera: '12MP Wide + 10MP Ultra Wide',
        battery: 'Up to 10 hours'
      },
      features: ['Apple Pencil support', 'Magic Keyboard compatible', 'Face ID', 'USB-C'],
      categoryId: createdCategories.tablets.id,
      sellerId: seller.id
    },

    // Audio
    {
      name: 'AirPods Pro (2nd Gen)',
      slug: 'airpods-pro-2nd-gen',
      description: 'Premium wireless earbuds with active noise cancellation and spatial audio.',
      price: 26900,
      mrp: 26900,
      stock: 100,
      brand: 'Apple',
      model: 'AirPods Pro',
      sku: 'APP2G001',
      images: [
        'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'
      ],
      specifications: {
        driver: 'Custom high-excursion driver',
        battery: 'Up to 6 hours (30 hours with case)',
        connectivity: 'Bluetooth 5.3',
        features: 'Active Noise Cancellation, Transparency mode',
        charging: 'Lightning, MagSafe, Qi wireless',
        water_resistance: 'IPX4'
      },
      features: ['Active Noise Cancellation', 'Spatial Audio', 'Hey Siri', 'Sweat resistant'],
      categoryId: createdCategories.audio.id,
      sellerId: seller.id,
      isFeatured: true
    },
    {
      name: 'Sony WH-1000XM5',
      slug: 'sony-wh-1000xm5',
      description: 'Industry-leading noise canceling headphones with exceptional sound quality.',
      price: 29990,
      mrp: 34990,
      stock: 60,
      brand: 'Sony',
      model: 'WH-1000XM5',
      sku: 'SWH1000XM5001',
      images: [
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
        'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800'
      ],
      specifications: {
        driver: '30mm dynamic drivers',
        battery: 'Up to 30 hours',
        connectivity: 'Bluetooth 5.2, NFC',
        noise_cancellation: 'Industry-leading ANC',
        charging: 'USB-C quick charge',
        weight: '250g'
      },
      features: ['Noise Cancellation', 'Touch controls', 'Voice assistant', 'Foldable design'],
      categoryId: createdCategories.audio.id,
      sellerId: seller.id
    },

    // Accessories
    {
      name: 'Apple Magic Mouse',
      slug: 'apple-magic-mouse',
      description: 'Wireless mouse with Multi-Touch surface and rechargeable battery.',
      price: 7900,
      mrp: 7900,
      stock: 80,
      brand: 'Apple',
      model: 'Magic Mouse',
      sku: 'AMM001',
      images: [
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800'
      ],
      specifications: {
        connectivity: 'Bluetooth',
        battery: 'Built-in rechargeable battery',
        compatibility: 'Mac, iPad',
        charging: 'Lightning port',
        sensors: 'Multi-Touch surface'
      },
      features: ['Multi-Touch gestures', 'Wireless', 'Rechargeable', 'Seamless tracking'],
      categoryId: createdCategories.accessories.id,
      sellerId: seller.id
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product
    });
  }
  console.log('✅ Products created');

  // Create sample coupons
  const coupons = [
    {
      code: 'WELCOME10',
      description: 'Welcome offer - 10% off on first order',
      type: 'PERCENTAGE',
      value: 10,
      minAmount: 1000,
      maxDiscount: 2000,
      usageLimit: 1000,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    },
    {
      code: 'FLAT500',
      description: 'Flat ₹500 off on orders above ₹5000',
      type: 'FIXED',
      value: 500,
      minAmount: 5000,
      usageLimit: 500,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days
    }
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: coupon
    });
  }
  console.log('✅ Coupons created');

  // Create sample addresses for test users
  await prisma.address.upsert({
    where: { id: 'sample-address-customer' },
    update: {},
    create: {
      id: 'sample-address-customer',
      userId: customer.id,
      name: 'John Doe',
      phone: '9876543210',
      address: '123 Tech Street, Silicon Valley',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      landmark: 'Near Tech Park',
      isDefault: true
    }
  });

  await prisma.address.upsert({
    where: { id: 'sample-address-admin' },
    update: {},
    create: {
      id: 'sample-address-admin',
      userId: admin.id,
      name: 'Admin User',
      phone: '9876543200',
      address: '456 Admin Street, Corporate Hub',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      landmark: 'Near Business Center',
      isDefault: true
    }
  });

  await prisma.address.upsert({
    where: { id: 'sample-address-seller' },
    update: {},
    create: {
      id: 'sample-address-seller',
      userId: seller.id,
      name: 'Sarah Wilson',
      phone: '9876543211',
      address: '789 Seller Avenue, Market District',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      landmark: 'Near Shopping Mall',
      isDefault: true
    }
  });

  await prisma.address.upsert({
    where: { id: 'sample-address-delivery' },
    update: {},
    create: {
      id: 'sample-address-delivery',
      userId: delivery.id,
      name: 'Mike Driver',
      phone: '9876543212',
      address: '321 Delivery Lane, Transport Hub',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001',
      landmark: 'Near Transport Center',
      isDefault: true
    }
  });

  await prisma.address.upsert({
    where: { id: 'sample-address-raj' },
    update: {},
    create: {
      id: 'sample-address-raj',
      userId: rajSeller.id,
      name: 'Raj Patel',
      phone: '9876543213',
      address: '555 Business Park, Tech City',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      landmark: 'Near IT Hub',
      isDefault: true
    }
  });

  console.log('✅ Sample addresses created for all users');

  console.log('🎉 Database seeding completed!');
  console.log('\n📧 Login Credentials:');
  console.log('👑 Admin: admin@pulsepixeltech.com / admin123');
  console.log('🛍️ Customer: customer@test.com / customer123');
  console.log('🏪 Seller: seller@test.com / seller123');
  console.log('🏪 Raj Seller: raj@pulsepixeltech.com / raj123');
  console.log('🚚 Delivery: delivery@test.com / delivery123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });