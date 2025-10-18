const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class InvoiceService {
  generateInvoice(order) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const filename = `invoice-${order.orderNumber}.pdf`;
        const filepath = path.join(__dirname, '../invoices', filename);

        if (!fs.existsSync(path.dirname(filepath))) {
          fs.mkdirSync(path.dirname(filepath), { recursive: true });
        }

        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Blue border around entire invoice
        doc.rect(30, 30, 535, 750).stroke('#6366F1').lineWidth(2);

        // Header with blue background
        doc.rect(50, 50, 495, 60).fill('#6366F1');
        doc.fillColor('white').fontSize(20).text('INVOICE', 60, 70);
        doc.fontSize(12).text(`Invoice #: ${order.orderNumber}`, 400, 70);
        doc.fontSize(12).text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 400, 90);

        // Company Info
        doc.fillColor('black').fontSize(16).text('PulsePixelTech', 60, 130);
        doc.fontSize(10).text('Premium Digital Electronics', 60, 150);

        // Customer Info with blue border
        doc.rect(60, 170, 200, 80).stroke('#6366F1');
        doc.fontSize(12).fillColor('#6366F1').text('Bill To:', 70, 180);
        doc.fillColor('black').fontSize(10).text(order.address.name, 70, 200);
        doc.fontSize(10).text(order.address.address, 70, 215);
        doc.fontSize(10).text(`${order.address.city}, ${order.address.state} - ${order.address.pincode}`, 70, 230);

        // Items Table
        let yPosition = 280;
        doc.fontSize(12).fillColor('#6366F1').text('Items:', 60, yPosition);
        yPosition += 30;

        // Table Headers with blue background
        doc.rect(60, yPosition, 465, 25).fill('#6366F1');
        doc.fillColor('white').fontSize(10)
           .text('Product', 70, yPosition + 8)
           .text('Qty', 300, yPosition + 8)
           .text('Price', 350, yPosition + 8)
           .text('Total', 450, yPosition + 8);

        yPosition += 35;

        // Items with alternating blue tint
        order.items.forEach((item, index) => {
          if (index % 2 === 1) {
            doc.rect(60, yPosition - 2, 465, 20).fill('#F0F4FF');
          }
          doc.fillColor('black').fontSize(9)
             .text(item.product.name.substring(0, 30), 70, yPosition)
             .text(item.quantity.toString(), 300, yPosition)
             .text(`₹${item.price.toLocaleString()}`, 350, yPosition)
             .text(`₹${item.total.toLocaleString()}`, 450, yPosition);
          yPosition += 20;
        });

        // Summary with blue border
        yPosition += 30;
        doc.rect(350, yPosition, 175, 80).stroke('#6366F1');
        yPosition += 15;

        doc.fillColor('black').fontSize(10)
           .text('Subtotal:', 360, yPosition)
           .text(`₹${order.totalAmount.toLocaleString()}`, 450, yPosition);
        yPosition += 15;

        doc.text('Shipping:', 360, yPosition);
        if (order.shippingFee > 0) {
          doc.text(`₹${order.shippingFee.toLocaleString()}`, 450, yPosition);
        } else {
          doc.text('FREE', 450, yPosition);
        }
        yPosition += 15;

        // Total with blue background
        doc.rect(360, yPosition, 155, 20).fill('#6366F1');
        doc.fillColor('white').fontSize(12)
           .text('Total:', 370, yPosition + 5)
           .text(`₹${order.finalAmount.toLocaleString()}`, 450, yPosition + 5);

        // Footer
        yPosition += 50;
        doc.fontSize(10).text('Thank you for your business!', 50, yPosition);
        doc.fontSize(8).text('support@pulsepixeltech.com | +91 98765 43210', 50, yPosition + 20);

        doc.end();

        stream.on('finish', () => resolve({ filename, filepath }));
        stream.on('error', reject);

      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new InvoiceService();