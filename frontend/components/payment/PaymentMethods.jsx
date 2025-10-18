'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCardIcon, 
  DevicePhoneMobileIcon, 
  BanknotesIcon,
  BuildingLibraryIcon,
  WalletIcon 
} from '@heroicons/react/24/outline';

const PaymentMethods = ({ onMethodSelect, selectedMethod }) => {
  const paymentMethods = [
    {
      id: 'COD',
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      icon: BanknotesIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'DEBIT_CARD',
      name: 'Debit Card',
      description: 'Visa, Mastercard, RuPay',
      icon: CreditCardIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'CREDIT_CARD',
      name: 'Credit Card', 
      description: 'Visa, Mastercard, American Express',
      icon: CreditCardIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'UPI',
      name: 'UPI Payment',
      description: 'Google Pay, PhonePe, Paytm, BHIM',
      icon: DevicePhoneMobileIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 'NET_BANKING',
      name: 'Net Banking',
      description: 'All major banks supported',
      icon: BuildingLibraryIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      id: 'WALLET',
      name: 'Digital Wallet',
      description: 'Paytm, Amazon Pay, etc.',
      icon: WalletIcon,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Choose Payment Method
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <motion.div
              key={method.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? `${method.borderColor} ${method.bgColor} ring-2 ring-offset-2 ring-blue-500` 
                  : 'border-gray-200 hover:border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600'
                }
              `}
              onClick={() => onMethodSelect(method.id)}
            >
              <div className="flex items-start space-x-3">
                <div className={`
                  p-2 rounded-lg ${isSelected ? method.bgColor : 'bg-gray-100 dark:bg-gray-700'}
                `}>
                  <Icon className={`
                    h-6 w-6 ${isSelected ? method.color : 'text-gray-600 dark:text-gray-300'}
                  `} />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {method.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {method.description}
                  </p>
                </div>
                
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentMethods;