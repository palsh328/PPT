# 🌐 PulsePixelTech - Digital Electronics E-commerce

A complete, production-ready e-commerce platform specialized in digital electronics (laptops, smartphones, tablets, accessories, spare parts) with modern UI/UX and comprehensive features.

## ✨ Features Overview

### 🛍️ Customer Experience
- **Modern UI/UX**: Amazon-style layout with smooth animations
- **Product Catalog**: Advanced search, filters, categories, sorting
- **Shopping Cart**: Real-time cart management with quantity updates
- **Wishlist**: Save favorite products for later
- **Checkout Flow**: Complete payment process with 6 payment methods
- **Order Tracking**: Visual order status with real-time updates
- **Reviews & Ratings**: Customer feedback system
- **User Profiles**: Account management with multiple addresses
- **PWA Support**: Installable mobile app with offline capabilities
- **Live Chat**: AI-powered customer support bot
- **Dark Mode**: Complete theme switching
- **AI Recommendations**: Smart product suggestions

### 🔧 Admin Dashboard
- **Analytics Dashboard**: Sales charts, revenue trends, user insights
- **Product Management**: CRUD operations with image uploads
- **Category Management**: Organize product catalog
- **Order Management**: Process orders, update status, handle refunds
- **User Management**: View and manage customers
- **Real-time Analytics**: Live sales data and performance metrics

### 💳 Payment System (Fake/Simulation)
- **Cash on Delivery**: Instant order confirmation
- **Debit/Credit Cards**: Realistic card processing simulation
- **UPI Payments**: UPI ID validation with fake responses
- **Net Banking**: Bank selection with simulated processing
- **Digital Wallets**: Wallet integration simulation
- **Payment Analytics**: Transaction tracking and reporting

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **Tailwind CSS**: Utility-first styling framework
- **Framer Motion**: Smooth animations and transitions
- **Recharts**: Data visualization for admin dashboard
- **React Hook Form**: Form management and validation
- **Axios**: HTTP client for API communication
- **PWA**: Progressive Web App capabilities

### Backend
- **Express.js**: Node.js web framework
- **PostgreSQL**: Relational database
- **Prisma**: Modern ORM with type safety
- **JWT**: Authentication and authorization
- **Nodemailer**: Email notifications
- **Multer**: File upload handling
- **bcryptjs**: Password hashing

### Key Features
- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: Live cart synchronization
- **Email Notifications**: Welcome, order confirmations, status updates
- **Search & Filters**: Advanced product discovery
- **Stock Management**: Real-time inventory tracking
- **Coupon System**: Promotional codes and discounts
- **Review System**: Customer ratings and feedback

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd pulsepixeltech
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your database URL in .env
npm run db:push
npm run db:seed
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🔐 Demo Accounts

### Admin Access
- **Email**: admin@pulsepixeltech.com
- **Password**: admin123
- **Features**: Full admin dashboard, analytics, product management

### Customer Access
- **Email**: customer@test.com
- **Password**: customer123
- **Features**: Shopping, orders, wishlist, profile management

## 📱 PWA Features

- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Basic functionality without internet
- **Push Notifications**: Order updates and promotions
- **App-like Experience**: Native mobile app feel

## 🎯 Project Highlights

### Professional Quality
- **Production-ready code** with proper error handling
- **Scalable architecture** with modular components
- **Security best practices** with JWT authentication
- **Performance optimized** with lazy loading and caching
- **SEO friendly** with proper meta tags and structure

### Modern Development
- **TypeScript-ready** codebase structure
- **Component-based architecture** for reusability
- **API-first design** with comprehensive REST endpoints
- **Database migrations** with Prisma schema management
- **Environment-based configuration** for different deployments

### User Experience
- **Intuitive navigation** with breadcrumbs and search
- **Loading states** and error handling throughout
- **Toast notifications** for user feedback
- **Responsive design** for all device sizes
- **Accessibility features** for inclusive design

## 📊 Database Schema

Comprehensive database design including:
- **Users & Authentication**: Secure user management
- **Products & Categories**: Flexible catalog structure
- **Orders & Payments**: Complete transaction tracking
- **Reviews & Ratings**: Customer feedback system
- **Cart & Wishlist**: Shopping experience features
- **Addresses & Profiles**: User account management

## 🔧 Customization

The platform is highly customizable:
- **Branding**: Easy logo and color scheme updates
- **Payment Integration**: Replace fake payments with real gateways
- **Email Templates**: Customize notification designs
- **Product Categories**: Add new product types
- **UI Components**: Modify layouts and styling

## 📈 Analytics & Insights

Built-in analytics dashboard provides:
- **Sales Performance**: Revenue trends and growth metrics
- **Product Analytics**: Best sellers and inventory insights
- **User Behavior**: Customer engagement and retention
- **Order Analytics**: Processing times and fulfillment rates

## 🌟 Why Choose This Platform?

1. **Complete Solution**: Everything needed for an e-commerce business
2. **Modern Technology**: Latest frameworks and best practices
3. **Scalable Design**: Grows with your business needs
4. **Professional Quality**: Production-ready from day one
5. **Comprehensive Features**: Matches major e-commerce platforms
6. **Easy Deployment**: Ready for cloud hosting platforms
7. **Maintainable Code**: Clean, documented, and organized
8. **Active Development**: Continuously updated and improved

## 📞 Support & Documentation

- **Setup Guide**: Detailed installation instructions
- **API Documentation**: Complete endpoint reference
- **Component Library**: Reusable UI components
- **Database Schema**: Entity relationship diagrams
- **Deployment Guide**: Production deployment steps

---

**PulsePixelTech** - Where technology meets commerce. Built for the future of digital retail. 🚀