# 🚀 PulsePixelTech - Complete Setup Instructions

## 📋 Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Git

## 🛠️ Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your database credentials
DATABASE_URL="postgresql://username:password@localhost:5432/pulsepixeltech"
JWT_SECRET="your_super_secret_jwt_key_here"
JWT_EXPIRE="7d"
PORT=5000
NODE_ENV=development

# SambaNova AI Configuration (for chatbot)
SAMBANOVA_API_KEY=your_sambanova_api_key_here

# Email configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Fake payment settings
PAYMENT_SIMULATION_DELAY=2000
PAYMENT_SUCCESS_RATE=95

# File upload settings
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with sample data
npm run db:seed
```

### 4. Start Backend Server
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

## 🎨 Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration
```bash
# Copy the example environment file
cp .env.local.example .env.local

# Edit .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=PulsePixelTech
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Frontend Server
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🔐 Demo Accounts

### Admin Account
- **Email**: admin@pulsepixeltech.com
- **Password**: admin123
- **Access**: Full admin dashboard with analytics, product management, order management

### Customer Account
- **Email**: customer@test.com
- **Password**: customer123
- **Access**: Full customer features including cart, wishlist, orders

## 📱 Features Overview

### ✅ Customer Features
- **Authentication**: Register/Login with JWT
- **Product Browsing**: Advanced search, filters, categories
- **Shopping Cart**: Real-time cart management
- **Wishlist**: Save favorite products
- **Checkout**: Complete payment flow with 6 payment methods
- **Order Management**: Track orders, view history, cancel orders
- **Reviews**: Rate and review products
- **Profile**: Manage profile and addresses
- **PWA**: Installable as mobile app
- **Live Chat**: SambaNova AI-powered customer support
- **Dark Mode**: Complete theme switching

### ✅ Admin Features
- **Dashboard**: Sales analytics with charts
- **Product Management**: CRUD operations for products
- **Category Management**: Manage product categories
- **Order Management**: Update order status, process refunds
- **User Management**: View and manage customers
- **Analytics**: Revenue trends, top products, user insights

### ✅ Payment Methods (All Fake/Simulation)
- 💵 **Cash on Delivery**: Instant confirmation
- 💳 **Debit Card**: Card validation with fake processing
- 💎 **Credit Card**: Premium card processing simulation
- 📱 **UPI**: UPI ID validation with fake responses
- 🏦 **Net Banking**: Bank selection with simulated redirects
- 👛 **Digital Wallet**: Wallet selection with phone verification

### ✅ Advanced Features
- **AI Recommendations**: SambaNova AI-powered product suggestions with rule-based fallback
- **Email Notifications**: Welcome, order confirmation, status updates
- **Live Chat**: SambaNova AI chatbot with intelligent contextual responses
- **PWA Support**: Installable, offline-capable, push notifications
- **Dark Mode**: System-wide theme switching
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Framer Motion throughout
- **Real-time Updates**: Cart synchronization, live notifications

## 🎯 Key Technologies

### Backend
- **Express.js**: REST API server
- **PostgreSQL**: Primary database
- **Prisma**: Modern ORM with type safety
- **JWT**: Authentication and authorization
- **Nodemailer**: Email notifications
- **Multer**: File upload handling

### Frontend
- **Next.js 14**: React framework with App Router
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Recharts**: Data visualization
- **React Hook Form**: Form management
- **Axios**: HTTP client
- **React Hot Toast**: Notifications

## 📊 Database Schema

The database includes comprehensive tables for:
- Users (customers and admins)
- Products with categories and specifications
- Shopping cart and wishlist
- Orders with detailed tracking
- Payments with transaction records
- Reviews and ratings
- Addresses and user profiles
- Coupons and promotions

## 🚀 Production Deployment

### Backend Deployment Options
- **Render**: Easy Node.js deployment
- **Railway**: Modern app deployment
- **Heroku**: Traditional PaaS platform

### Frontend Deployment
- **Vercel**: Optimized for Next.js (recommended)
- **Netlify**: JAMstack deployment
- **Railway**: Full-stack deployment

### Database Options
- **Supabase**: PostgreSQL with real-time features
- **Neon**: Serverless PostgreSQL
- **Railway**: Managed PostgreSQL

## 🔧 Development Commands

### Backend
```bash
npm run dev          # Start development server
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🎨 Customization

### Branding
- Update logo in `/frontend/components/layout/Header.jsx`
- Modify colors in `/frontend/tailwind.config.js`
- Update PWA icons in `/frontend/public/icons/`

### Payment Integration
- Replace fake payment service with real gateways
- Update `/backend/services/paymentService.js`
- Add real API keys in environment variables

### Email Templates
- Customize email templates in `/backend/services/emailService.js`
- Add your SMTP credentials for real email sending

## 🐛 Troubleshooting

### Common Issues
1. **Database Connection**: Ensure PostgreSQL is running and credentials are correct
2. **Port Conflicts**: Change ports in environment files if needed
3. **CORS Issues**: Update CORS settings in backend if deploying to different domains
4. **Image Loading**: Ensure image domains are added to Next.js config

### Performance Optimization
- Enable database indexing for frequently queried fields
- Implement Redis caching for session management
- Use CDN for static assets in production
- Enable gzip compression on server

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review the code comments for implementation details
- Ensure all environment variables are properly configured

## 🎉 Success!

If everything is set up correctly, you should have:
- A fully functional e-commerce platform
- Admin dashboard with analytics
- Complete payment simulation
- PWA capabilities
- Email notifications
- Live chat support
- AI-powered recommendations

Enjoy your new PulsePixelTech e-commerce platform! 🚀