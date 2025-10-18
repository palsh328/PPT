// Fake Payment Service - Simulates real payment gateways
class PaymentService {
  constructor() {
    this.simulationDelay = parseInt(process.env.PAYMENT_SIMULATION_DELAY) || 2000;
    this.successRate = parseInt(process.env.PAYMENT_SUCCESS_RATE) || 95;
  }

  // Simulate payment processing delay
  async simulateDelay() {
    return new Promise(resolve => {
      setTimeout(resolve, this.simulationDelay);
    });
  }

  // Generate fake transaction ID
  generateTransactionId(method) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const prefixes = {
      DEBIT_CARD: 'DC',
      CREDIT_CARD: 'CC', 
      UPI: 'UPI',
      NET_BANKING: 'NB',
      WALLET: 'WLT'
    };
    
    return `${prefixes[method] || 'PAY'}${timestamp}${random}`;
  }

  // Simulate payment success/failure
  isPaymentSuccessful() {
    return Math.random() * 100 < this.successRate;
  }

  // Process fake debit card payment
  async processDebitCard(paymentData) {
    await this.simulateDelay();
    
    const { cardNumber, expiryMonth, expiryYear, cvv, cardHolder, amount } = paymentData;
    
    // Validate fake card details
    if (!this.validateCardNumber(cardNumber)) {
      throw new Error('Invalid card number');
    }
    
    if (!this.validateExpiry(expiryMonth, expiryYear)) {
      throw new Error('Card expired or invalid expiry date');
    }
    
    if (!this.validateCVV(cvv)) {
      throw new Error('Invalid CVV');
    }

    const success = this.isPaymentSuccessful();
    
    return {
      success,
      transactionId: success ? this.generateTransactionId('DEBIT_CARD') : null,
      message: success ? 'Payment successful' : 'Payment failed - Insufficient funds',
      gatewayResponse: {
        cardLast4: cardNumber.slice(-4),
        cardType: this.getCardType(cardNumber),
        bankName: this.getFakeBankName(),
        authCode: success ? Math.random().toString(36).substring(2, 8).toUpperCase() : null
      }
    };
  }

  // Process fake credit card payment
  async processCreditCard(paymentData) {
    await this.simulateDelay();
    
    const { cardNumber, expiryMonth, expiryYear, cvv, cardHolder, amount } = paymentData;
    
    // Validate fake card details
    if (!this.validateCardNumber(cardNumber)) {
      throw new Error('Invalid card number');
    }
    
    if (!this.validateExpiry(expiryMonth, expiryYear)) {
      throw new Error('Card expired or invalid expiry date');
    }
    
    if (!this.validateCVV(cvv)) {
      throw new Error('Invalid CVV');
    }

    const success = this.isPaymentSuccessful();
    
    return {
      success,
      transactionId: success ? this.generateTransactionId('CREDIT_CARD') : null,
      message: success ? 'Payment successful' : 'Payment declined by bank',
      gatewayResponse: {
        cardLast4: cardNumber.slice(-4),
        cardType: this.getCardType(cardNumber),
        bankName: this.getFakeBankName(),
        authCode: success ? Math.random().toString(36).substring(2, 8).toUpperCase() : null
      }
    };
  }

  // Process fake UPI payment
  async processUPI(paymentData) {
    await this.simulateDelay();
    
    const { upiId, amount } = paymentData;
    
    if (!this.validateUPIId(upiId)) {
      throw new Error('Invalid UPI ID');
    }

    const success = this.isPaymentSuccessful();
    
    return {
      success,
      transactionId: success ? this.generateTransactionId('UPI') : null,
      message: success ? 'Payment successful' : 'UPI payment failed - Please try again',
      gatewayResponse: {
        upiId: upiId,
        pspName: this.getFakePSPName(),
        rrn: success ? Math.random().toString().substring(2, 14) : null
      }
    };
  }

  // Process fake net banking
  async processNetBanking(paymentData) {
    await this.simulateDelay();
    
    const { bankCode, amount } = paymentData;
    
    const success = this.isPaymentSuccessful();
    
    return {
      success,
      transactionId: success ? this.generateTransactionId('NET_BANKING') : null,
      message: success ? 'Payment successful' : 'Net banking payment failed',
      gatewayResponse: {
        bankCode,
        bankName: this.getBankNameByCode(bankCode),
        referenceNumber: success ? Math.random().toString().substring(2, 12) : null
      }
    };
  }

  // Process fake wallet payment
  async processWallet(paymentData) {
    await this.simulateDelay();
    
    const { walletType, phone, amount } = paymentData;
    
    const success = this.isPaymentSuccessful();
    
    return {
      success,
      transactionId: success ? this.generateTransactionId('WALLET') : null,
      message: success ? 'Payment successful' : 'Wallet payment failed - Insufficient balance',
      gatewayResponse: {
        walletType,
        phone: phone.replace(/(\d{6})(\d{4})/, '******$2'),
        walletTxnId: success ? Math.random().toString(36).substring(2, 10).toUpperCase() : null
      }
    };
  }

  // Validation helpers
  validateCardNumber(cardNumber) {
    // Remove spaces and check if it's 16 digits
    const cleaned = cardNumber.replace(/\s/g, '');
    return /^\d{16}$/.test(cleaned);
  }

  validateExpiry(month, year) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const expYear = parseInt(year);
    const expMonth = parseInt(month);
    
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    
    return expMonth >= 1 && expMonth <= 12;
  }

  validateCVV(cvv) {
    return /^\d{3,4}$/.test(cvv);
  }

  validateUPIId(upiId) {
    return /^[\w.-]+@[\w.-]+$/.test(upiId);
  }

  // Helper methods for fake data
  getCardType(cardNumber) {
    const firstDigit = cardNumber.charAt(0);
    if (firstDigit === '4') return 'Visa';
    if (firstDigit === '5') return 'Mastercard';
    if (firstDigit === '3') return 'American Express';
    return 'Unknown';
  }

  getFakeBankName() {
    const banks = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank', 'PNB'];
    return banks[Math.floor(Math.random() * banks.length)];
  }

  getFakePSPName() {
    const psps = ['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'Amazon Pay'];
    return psps[Math.floor(Math.random() * psps.length)];
  }

  getBankNameByCode(code) {
    const bankCodes = {
      'HDFC': 'HDFC Bank',
      'ICICI': 'ICICI Bank', 
      'SBI': 'State Bank of India',
      'AXIS': 'Axis Bank',
      'KOTAK': 'Kotak Mahindra Bank'
    };
    return bankCodes[code] || 'Unknown Bank';
  }
}

module.exports = new PaymentService();