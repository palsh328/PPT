const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      const mailOptions = {
        from: `"PulsePixelTech" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  // Welcome email template
  getWelcomeEmailTemplate(userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to PulsePixelTech</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to PulsePixelTech! 🎉</h1>
            <p>Your journey into the world of digital electronics begins here</p>
          </div>
          <div class="content">
            <h2>Hi ${userName}!</h2>
            <p>Thank you for joining PulsePixelTech, your premier destination for digital electronics. We're excited to have you as part of our community!</p>
            
            <h3>What's Next?</h3>
            <ul>
              <li>🛍️ Browse our extensive catalog of laptops, smartphones, and accessories</li>
              <li>💰 Enjoy exclusive deals and discounts for members</li>
              <li>🚚 Get free shipping on orders above ₹500</li>
              <li>⭐ Read reviews and ratings from verified buyers</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" class="button">
              Start Shopping Now
            </a>
            
            <p>If you have any questions, our support team is here to help 24/7.</p>
            
            <p>Happy Shopping!<br>The PulsePixelTech Team</p>
          </div>
          <div class="footer">
            <p>© 2024 PulsePixelTech. All rights reserved.</p>
            <p>You received this email because you signed up for a PulsePixelTech account.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Order confirmation email template
  getOrderConfirmationTemplate(order, user) {
    const itemsList = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.product.name}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ₹${item.price.toLocaleString()}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ₹${item.total.toLocaleString()}
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - ${order.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th { background: #f1f5f9; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; }
          .total-row { background: #f8fafc; font-weight: bold; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed! ✅</h1>
            <p>Thank you for your purchase</p>
          </div>
          <div class="content">
            <h2>Hi ${user.firstName}!</h2>
            <p>Your order has been confirmed and is being processed. Here are the details:</p>
            
            <div class="order-details">
              <h3>Order #${order.orderNumber}</h3>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod.replace('_', ' ')}</p>
              <p><strong>Delivery Address:</strong><br>
                ${order.address.name}<br>
                ${order.address.address}<br>
                ${order.address.city}, ${order.address.state} - ${order.address.pincode}<br>
                Phone: ${order.address.phone}
              </p>
            </div>
            
            <h3>Order Items</h3>
            <table class="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
                <tr class="total-row">
                  <td colspan="3" style="padding: 15px; text-align: right;">Subtotal:</td>
                  <td style="padding: 15px; text-align: right;">₹${order.totalAmount.toLocaleString()}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="3" style="padding: 15px; text-align: right;">Shipping:</td>
                  <td style="padding: 15px; text-align: right;">₹${order.shippingFee.toLocaleString()}</td>
                </tr>
                ${order.discount > 0 ? `
                <tr class="total-row">
                  <td colspan="3" style="padding: 15px; text-align: right; color: #10b981;">Discount:</td>
                  <td style="padding: 15px; text-align: right; color: #10b981;">-₹${order.discount.toLocaleString()}</td>
                </tr>
                ` : ''}
                <tr class="total-row" style="border-top: 2px solid #e2e8f0;">
                  <td colspan="3" style="padding: 15px; text-align: right; font-size: 18px;">Total:</td>
                  <td style="padding: 15px; text-align: right; font-size: 18px;">₹${order.finalAmount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            
            <p>Your order will be delivered within 3-5 business days. You'll receive tracking information once your order ships.</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order.id}" class="button">
              Track Your Order
            </a>
            
            <p>Thank you for choosing PulsePixelTech!</p>
          </div>
          <div class="footer">
            <p>© 2024 PulsePixelTech. All rights reserved.</p>
            <p>Need help? Contact us at support@pulsepixeltech.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Order status update email template
  getOrderStatusUpdateTemplate(order, user, newStatus) {
    const statusMessages = {
      CONFIRMED: 'Your order has been confirmed and is being prepared for shipment.',
      PROCESSING: 'Your order is currently being processed in our warehouse.',
      SHIPPED: 'Great news! Your order has been shipped and is on its way to you.',
      DELIVERED: 'Your order has been delivered successfully. We hope you love your purchase!',
      CANCELLED: 'Your order has been cancelled as requested. Any payment will be refunded within 3-5 business days.'
    };

    const statusColors = {
      CONFIRMED: '#3b82f6',
      PROCESSING: '#f59e0b',
      SHIPPED: '#8b5cf6',
      DELIVERED: '#10b981',
      CANCELLED: '#ef4444'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Update - ${order.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusColors[newStatus]}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-badge { background: ${statusColors[newStatus]}; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 10px 0; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Update 📦</h1>
            <p>Your order status has been updated</p>
          </div>
          <div class="content">
            <h2>Hi ${user.firstName}!</h2>
            <p>We have an update on your order <strong>#${order.orderNumber}</strong>:</p>
            
            <div class="status-badge">${newStatus.replace('_', ' ')}</div>
            
            <p>${statusMessages[newStatus]}</p>
            
            ${newStatus === 'SHIPPED' ? `
              <p><strong>Estimated Delivery:</strong> ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
            ` : ''}
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order.id}" class="button">
              View Order Details
            </a>
            
            <p>Thank you for shopping with PulsePixelTech!</p>
          </div>
          <div class="footer">
            <p>© 2024 PulsePixelTech. All rights reserved.</p>
            <p>Need help? Contact us at support@pulsepixeltech.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send welcome email
  async sendWelcomeEmail(user) {
    const subject = 'Welcome to PulsePixelTech! 🎉';
    const html = this.getWelcomeEmailTemplate(`${user.firstName} ${user.lastName}`);
    
    return await this.sendEmail(user.email, subject, html);
  }

  // Send order confirmation email
  async sendOrderConfirmationEmail(order, user) {
    const subject = `Order Confirmation - #${order.orderNumber}`;
    const html = this.getOrderConfirmationTemplate(order, user);
    
    return await this.sendEmail(user.email, subject, html);
  }

  // Send order status update email
  async sendOrderStatusUpdateEmail(order, user, newStatus) {
    const subject = `Order Update - #${order.orderNumber} is ${newStatus.replace('_', ' ')}`;
    const html = this.getOrderStatusUpdateTemplate(order, user, newStatus);
    
    return await this.sendEmail(user.email, subject, html);
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const subject = 'Reset Your PulsePixelTech Password';
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Password Reset Request</h2>
          <p>Hi ${user.firstName},</p>
          <p>You requested to reset your password for your PulsePixelTech account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>PulsePixelTech Team</p>
        </div>
      </body>
      </html>
    `;
    
    return await this.sendEmail(user.email, subject, html);
  }
}

module.exports = new EmailService();