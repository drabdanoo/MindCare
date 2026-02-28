/**
 * Manual Payment Configuration
 *
 * *** UPDATE THESE VALUES before going live ***
 * Replace the placeholder numbers with your actual wallet/bank numbers.
 */

export interface WalletOption {
  id: string;
  name: string;
  number: string;
  instructions: string;
}

export const PAYMENT_CONFIG = {
  /** Fee per session — change this to match your doctor pricing */
  sessionFee: 50,

  /** Currency symbol shown to patients */
  currencySymbol: '$',

  /** Your receiving wallets — REPLACE numbers with your real accounts */
  wallets: [
    {
      id: 'zaincash',
      name: 'ZainCash',
      number: '0770-000-0000', // *** REPLACE WITH YOUR ZAINCASH NUMBER ***
      instructions: 'Open ZainCash → Send Money → enter number above',
    },
    {
      id: 'asiacell',
      name: 'Asiacell Hawala',
      number: '0750-000-0000', // *** REPLACE WITH YOUR ASIACELL NUMBER ***
      instructions: 'Open Asiacell Hawala → Transfer → enter number above',
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      number: 'Account: XXXX-XXXX-XXXX', // *** REPLACE WITH YOUR BANK ACCOUNT ***
      instructions: 'Transfer via your bank app to the account above',
    },
  ] as WalletOption[],
};
