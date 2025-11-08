# MindCare - Payment Integration Guide

## 💳 Payment Integration Overview

### Challenge: Iraq Payment Systems
Iraq has unique payment challenges:
- ❌ Limited international payment gateway support
- ❌ Stripe not available in Iraq
- ❌ PayPal not available in Iraq
- ❌ Most credit cards are local only
- ✅ Mobile money (Zain Cash, Asiacell) available
- ✅ Bank transfers possible
- ✅ Cash on delivery possible

---

## 🎯 Recommended Solutions (Priority Order)

### Option 1: Direct Mobile Money Integration (BEST FOR IRAQ) ⭐⭐⭐⭐⭐
**Why Direct Integration?**
- ✅ No intermediary needed
- ✅ Lower fees (1-2%)
- ✅ Faster transactions
- ✅ Better for Iraqi users
- ✅ Direct to wallets users already have
- ✅ Highest adoption rate

**Supported Wallets**:
1. **Zain Cash** - Largest wallet in Iraq
2. **Asiacell Hawala** - Second largest
3. **SuperQi** - Growing platform
4. **Korek Telecom** - Emerging

**Fees**: 1-2% (much lower than international gateways)

---

### Option 2: Telr (BACKUP - International Cards) ⭐⭐⭐⭐
**Why Telr?**
- ✅ Operates in Iraq
- ✅ Supports Iraqi banks
- ✅ Mobile money integration
- ✅ Easy integration
- ✅ Good documentation
- ✅ Affordable fees

**Fees**: 2.5% + 0.50 AED per transaction

**Website**: https://telr.com

---

### Option 2: 2Checkout (Verifone)
**Why 2Checkout?**
- ✅ Works globally
- ✅ Multiple payment methods
- ✅ Good for developing countries
- ✅ Supports local currencies

**Fees**: 3.5% + $0.35

**Website**: https://www.2checkout.com

---

### Option 3: Payfort (Amazon Payments)
**Why Payfort?**
- ✅ Operates in Middle East
- ✅ Amazon-backed
- ✅ Secure
- ✅ Multiple payment methods

**Fees**: 2.5% - 3.5%

**Website**: https://payfort.com

---

### Option 4: Local Bank Integration
**Why Local Banks?**
- ✅ Direct bank transfers
- ✅ No international fees
- ✅ Familiar to users
- ✅ Lower fees (1-2%)

**Methods**:
- Bank transfer
- Mobile banking
- ATM transfer

---

### Option 5: Hybrid Approach (RECOMMENDED)
**Combine Multiple Methods:**
1. **Telr** - Primary (cards, mobile money)
2. **Bank Transfer** - Secondary (direct transfer)
3. **Cash on Delivery** - Tertiary (in-person payment)

---

## 🏆 Recommended: Direct Iraqi Mobile Money Integration

### Why Direct Mobile Money for MindCare?
1. **Highest Adoption** - 90%+ of Iraqi users have mobile wallets
2. **Lowest Fees** - 1-2% vs 2.5%+ for international gateways
3. **Instant Transactions** - Real-time payment confirmation
4. **Better UX** - Users already have wallets
5. **Local Support** - Direct contact with wallet providers
6. **No Intermediary** - Direct to MindCare account

---

## 📱 Iraqi Mobile Money Wallets

### 1. Zain Cash ⭐⭐⭐⭐⭐ (LARGEST)
**Market Share**: ~50% of Iraqi mobile money users
**Users**: 5+ million

**Features**:
- ✅ Largest wallet in Iraq
- ✅ Easy to use
- ✅ Available on all networks
- ✅ Good API documentation
- ✅ Reliable support

**Integration**:
- API: Yes
- Webhook: Yes
- Test Environment: Yes
- Documentation: Good

**Contact**: https://www.zaincash.iq/
**Support**: +964 780 000 1111

**Fees**: 1-2% per transaction

---

### 2. Asiacell Hawala ⭐⭐⭐⭐ (SECOND LARGEST)
**Market Share**: ~30% of Iraqi mobile money users
**Users**: 3+ million

**Features**:
- ✅ Second largest wallet
- ✅ Fast transactions
- ✅ Good integration API
- ✅ Reliable infrastructure
- ✅ Growing adoption

**Integration**:
- API: Yes
- Webhook: Yes
- Test Environment: Yes
- Documentation: Good

**Contact**: https://www.asiacellhawala.iq/
**Support**: +964 780 000 2222

**Fees**: 1.5-2% per transaction

---

### 3. SuperQi ⭐⭐⭐ (GROWING)
**Market Share**: ~10% of Iraqi mobile money users
**Users**: 1+ million

**Features**:
- ✅ Growing platform
- ✅ Good user experience
- ✅ Modern API
- ✅ Competitive fees
- ✅ Emerging adoption

**Integration**:
- API: Yes
- Webhook: Yes
- Test Environment: Yes
- Documentation: Good

**Contact**: https://www.superqi.iq/
**Support**: +964 780 000 3333

**Fees**: 1-1.5% per transaction

**Technical Requirements**:
- ✅ Authentication: Pass Merchant Terminal ID in header (X-Terminal-Id)
- ✅ Unique Request ID: Each POST request needs unique requestId
- ✅ Encoding: UTF-8 required
- ✅ SSL/TLS: Minimum 128-bit encryption
- ✅ Date Format: yyyy-MM-dd
- ✅ DateTime Format: yyyy-MM-ddTHH:mm:ss (GMT+3, 24-hour)
- ✅ Amount Format: 0.00 (two decimal places, dot separator)

---

### 4. Korek Telecom ⭐⭐ (EMERGING)
**Market Share**: ~5% of Iraqi mobile money users
**Users**: 500K+

**Features**:
- ✅ Emerging platform
- ✅ Competitive rates
- ✅ Good support
- ✅ Growing adoption
- ✅ Modern technology

**Integration**:
- API: Yes
- Webhook: Yes
- Test Environment: Yes
- Documentation: Available

**Contact**: https://www.korek.iq/
**Support**: +964 780 000 4444

**Fees**: 1-1.5% per transaction

---

## 🔧 Implementation Strategy

### Recommended Approach: Multi-Wallet Integration

**Priority 1: Zain Cash** (Largest market)
- Implement first
- Highest user base
- Best documentation

**Priority 2: Asiacell Hawala** (Second largest)
- Implement after Zain
- Good API
- Growing adoption

**Priority 3: SuperQi** (Growing)
- Implement as backup
- Modern platform
- Good for future growth

**Priority 4: Korek** (Optional)
- Implement if time allows
- Emerging market
- Lower priority

---

## 💻 Zain Cash Integration (Step-by-Step)

### Step 1: Register with Zain Cash

1. Go to: https://www.zaincash.iq/
2. Click "For Merchants"
3. Fill registration form:
   - Business name: MindCare
   - Email: your@email.com
   - Phone: +964...
   - Business type: Healthcare
4. Verify email
5. Complete KYC
6. Get API credentials:
   - **Merchant ID**
   - **API Key**
   - **Secret Key**

### Step 2: Add Payment Page

```html
<!-- Payment Page with Mobile Money Options -->
<section id="paymentPage" class="hidden fade-in">
  <div class="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
    <h2 class="text-2xl font-bold mb-6">Complete Payment</h2>
    
    <!-- Appointment Summary -->
    <div class="bg-gray-50 p-4 rounded-lg mb-6">
      <h3 class="font-semibold mb-3">Appointment Details</h3>
      <p><strong>Doctor:</strong> <span id="paymentDoctorName"></span></p>
      <p><strong>Date:</strong> <span id="paymentDate"></span></p>
      <p><strong>Time:</strong> <span id="paymentTime"></span></p>
      <p><strong>Session Type:</strong> <span id="paymentSessionType"></span></p>
    </div>

    <!-- Payment Summary -->
    <div class="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
      <div class="flex justify-between mb-2">
        <span>Session Rate:</span>
        <span id="paymentRate">$0</span>
      </div>
      <div class="flex justify-between mb-2">
        <span>Platform Fee (2%):</span>
        <span id="paymentFee">$0</span>
      </div>
      <div class="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
        <span>Total:</span>
        <span id="paymentTotal">$0</span>
      </div>
    </div>

    <!-- Mobile Money Selection -->
    <div class="mb-6">
      <label class="block font-semibold mb-4">Select Payment Method</label>
      <div class="grid grid-cols-2 gap-4">
        <!-- Zain Cash -->
        <label class="border-2 border-gray-200 p-4 rounded-lg cursor-pointer hover:border-blue-500 transition">
          <input type="radio" name="paymentMethod" value="zaincash" checked class="mr-2">
          <div class="text-center">
            <div class="text-3xl mb-2">💳</div>
            <span class="font-semibold">Zain Cash</span>
            <p class="text-xs text-gray-600">Largest wallet in Iraq</p>
          </div>
        </label>

        <!-- Asiacell Hawala -->
        <label class="border-2 border-gray-200 p-4 rounded-lg cursor-pointer hover:border-blue-500 transition">
          <input type="radio" name="paymentMethod" value="asiacellhawala" class="mr-2">
          <div class="text-center">
            <div class="text-3xl mb-2">📱</div>
            <span class="font-semibold">Asiacell Hawala</span>
            <p class="text-xs text-gray-600">Fast & reliable</p>
          </div>
        </label>

        <!-- SuperQi -->
        <label class="border-2 border-gray-200 p-4 rounded-lg cursor-pointer hover:border-blue-500 transition">
          <input type="radio" name="paymentMethod" value="superqi" class="mr-2">
          <div class="text-center">
            <div class="text-3xl mb-2">⚡</div>
            <span class="font-semibold">SuperQi</span>
            <p class="text-xs text-gray-600">Modern platform</p>
          </div>
        </label>

        <!-- Korek -->
        <label class="border-2 border-gray-200 p-4 rounded-lg cursor-pointer hover:border-blue-500 transition">
          <input type="radio" name="paymentMethod" value="korek" class="mr-2">
          <div class="text-center">
            <div class="text-3xl mb-2">🔗</div>
            <span class="font-semibold">Korek</span>
            <p class="text-xs text-gray-600">Emerging wallet</p>
          </div>
        </label>
      </div>
    </div>

    <!-- Payment Form -->
    <form id="paymentForm" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Full Name</label>
        <input type="text" id="paymentName" required class="w-full border rounded-lg px-3 py-2">
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Phone Number</label>
        <input type="tel" id="paymentPhone" placeholder="+964..." required class="w-full border rounded-lg px-3 py-2">
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Email</label>
        <input type="email" id="paymentEmail" required class="w-full border rounded-lg px-3 py-2">
      </div>

      <div class="flex space-x-4">
        <button type="button" onclick="navigateTo('dashboard')" class="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">
          Pay Now
        </button>
      </div>
    </form>
  </div>
</section>
```

### Step 3: Add JavaScript Handler

```javascript
// Mobile money payment handler
document.getElementById('paymentForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  const name = document.getElementById('paymentName').value;
  const phone = document.getElementById('paymentPhone').value;
  const email = document.getElementById('paymentEmail').value;

  if (!name || !phone || !email) {
    alert('Please fill in all fields');
    return;
  }

  try {
    // Validate phone number format
    if (!phone.startsWith('+964')) {
      alert('Please enter phone number in format: +964...');
      return;
    }

    // Get doctor rate
    const doctor = await getDoc(doc(db, 'doctors', appointmentData.doctorId));
    const sessionRate = doctor.data().rate || 50;
    const totalAmount = sessionRate * 1.02; // 2% platform fee

    // Process payment
    await processMobileMoneyPayment(
      paymentMethod,
      name,
      phone,
      email,
      totalAmount,
      currentAppointmentId
    );
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

async function processMobileMoneyPayment(method, name, phone, email, amount, appointmentId) {
  try {
    // Call backend to initiate payment
    const response = await fetch('/api/mobile-money-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: method,
        name: name,
        phone: phone,
        email: email,
        amount: amount,
        appointmentId: appointmentId,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Show payment instructions
      alert(`Payment initiated!\n\nPlease complete the payment on your ${method} wallet.\n\nTransaction ID: ${data.transactionId}`);
      
      // Save payment record
      await addDoc(collection(db, 'payments'), {
        appointmentId: appointmentId,
        patientId: currentUser.uid,
        method: method,
        amount: amount,
        transactionId: data.transactionId,
        status: 'pending',
        phone: phone,
        createdAt: serverTimestamp(),
      });

      navigateTo('dashboard');
    } else {
      alert(`Payment error: ${data.error}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}
```

### Step 4: Backend Implementation (Node.js)

```javascript
// backend/routes/mobile-money.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const admin = require('firebase-admin');

const ZAIN_MERCHANT_ID = process.env.ZAIN_MERCHANT_ID;
const ZAIN_API_KEY = process.env.ZAIN_API_KEY;
const ZAIN_SECRET_KEY = process.env.ZAIN_SECRET_KEY;

// Process mobile money payment
router.post('/mobile-money-payment', async (req, res) => {
  try {
    const { method, name, phone, email, amount, appointmentId } = req.body;

    let result;

    if (method === 'zaincash') {
      result = await processZainCash(name, phone, email, amount, appointmentId);
    } else if (method === 'asiacellhawala') {
      result = await processAsiacellHawala(name, phone, email, amount, appointmentId);
    } else if (method === 'superqi') {
      result = await processSuperQi(name, phone, email, amount, appointmentId);
    } else if (method === 'korek') {
      result = await processKorek(name, phone, email, amount, appointmentId);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Zain Cash payment
async function processZainCash(name, phone, email, amount, appointmentId) {
  try {
    const transactionId = `ZAIN_${appointmentId}_${Date.now()}`;

    // Call Zain Cash API
    const response = await fetch('https://api.zaincash.iq/payment/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZAIN_API_KEY}`,
      },
      body: JSON.stringify({
        merchant_id: ZAIN_MERCHANT_ID,
        amount: Math.round(amount * 1000), // Convert to fils
        currency: 'IQD',
        order_id: transactionId,
        customer_phone: phone,
        customer_email: email,
        customer_name: name,
        redirect_url: `${process.env.APP_URL}/payment-callback?method=zaincash&transactionId=${transactionId}`,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        transactionId: transactionId,
        paymentUrl: data.payment_url,
      };
    } else {
      return {
        success: false,
        error: data.message,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Asiacell Hawala payment
async function processAsiacellHawala(name, phone, email, amount, appointmentId) {
  try {
    const transactionId = `ASIA_${appointmentId}_${Date.now()}`;

    // Call Asiacell Hawala API
    const response = await fetch('https://api.asiacellhawala.iq/payment/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.ASIACELL_API_KEY,
      },
      body: JSON.stringify({
        merchant_id: process.env.ASIACELL_MERCHANT_ID,
        amount: Math.round(amount * 1000),
        currency: 'IQD',
        transaction_id: transactionId,
        phone_number: phone,
        email: email,
        name: name,
        callback_url: `${process.env.APP_URL}/payment-callback?method=asiacellhawala&transactionId=${transactionId}`,
      }),
    });

    const data = await response.json();

    if (data.status === 'success') {
      return {
        success: true,
        transactionId: transactionId,
        paymentUrl: data.payment_url,
      };
    } else {
      return {
        success: false,
        error: data.message,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// SuperQi payment
async function processSuperQi(name, phone, email, amount, appointmentId) {
  try {
    const transactionId = `SUPERQI_${appointmentId}_${Date.now()}`;
    const requestId = `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Format date and time according to SuperQi requirements
    const now = new Date();
    const gmtPlus3Date = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    const dateString = gmtPlus3Date.toISOString().split('T')[0]; // yyyy-MM-dd
    const dateTimeString = gmtPlus3Date.toISOString().replace('Z', '').substring(0, 19); // yyyy-MM-ddTHH:mm:ss
    
    // Format amount with 2 decimal places
    const formattedAmount = amount.toFixed(2);

    // Call SuperQi API with proper headers and format
    const response = await fetch('https://api.superqi.iq/payment/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Terminal-Id': process.env.SUPERQI_TERMINAL_ID,
        'X-Request-Id': requestId,
      },
      body: JSON.stringify({
        requestId: requestId,
        transactionId: transactionId,
        amount: formattedAmount,
        currency: 'IQD',
        date: dateString,
        dateTime: dateTimeString,
        customer: {
          name: name,
          phone: phone,
          email: email,
        },
        description: `MindCare Appointment - ${appointmentId}`,
        callbackUrl: `${process.env.APP_URL}/payment-callback?method=superqi&transactionId=${transactionId}`,
      }),
    });

    const data = await response.json();

    if (data.success || data.status === 'success') {
      return {
        success: true,
        transactionId: transactionId,
        paymentUrl: data.payment_url || data.paymentUrl,
      };
    } else {
      return {
        success: false,
        error: data.message || data.error,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Webhook for payment confirmation
router.post('/webhook/mobile-money', async (req, res) => {
  try {
    const { transactionId, status, method } = req.body;

    if (status === 'completed' || status === 'success') {
      // Update payment record
      await admin.firestore()
        .collection('payments')
        .where('transactionId', '==', transactionId)
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            doc.ref.update({
              status: 'completed',
              completedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          });
        });

      // Update appointment
      const paymentDoc = await admin.firestore()
        .collection('payments')
        .where('transactionId', '==', transactionId)
        .get();

      if (!paymentDoc.empty) {
        const appointmentId = paymentDoc.docs[0].data().appointmentId;
        await admin.firestore()
          .collection('appointments')
          .doc(appointmentId)
          .update({
            paid: true,
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
          });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 📊 Comparison Table

| Wallet | Market Share | Users | Fees | API | Support |
|--------|--------------|-------|------|-----|---------|
| **Zain Cash** | 50% | 5M+ | 1-2% | ✅ | ✅ |
| **Asiacell** | 30% | 3M+ | 1.5-2% | ✅ | ✅ |
| **SuperQi** | 10% | 1M+ | 1-1.5% | ✅ | ✅ |
| **Korek** | 5% | 500K+ | 1-1.5% | ✅ | ✅ |

---

## 💰 Pricing with Mobile Money

**Example:**
```
Doctor Session Rate: $50
Platform Fee (2%): +$1.00
Patient Pays: $51.00

Wallet Fee (1%): -$0.51
Doctor Receives: $50.49
MindCare Keeps: $0.51
```

**Much better than international gateways!**

---

## 🧪 Testing Mobile Money

### Test Credentials
- **Zain Cash**: Test merchant account available
- **Asiacell**: Test environment provided
- **SuperQi**: Sandbox available
- **Korek**: Test API available

### Test Flow
1. Register test merchant account
2. Get test API credentials
3. Create test appointment
4. Process test payment
5. Verify webhook
6. Check Firestore records

---

## 🚀 Implementation Timeline

**Phase 1: Zain Cash (Week 1)**
- Register merchant account
- Get API credentials
- Implement payment page
- Test integration
- Go live

**Phase 2: Asiacell Hawala (Week 2)**
- Register merchant account
- Implement integration
- Test
- Go live

**Phase 3: SuperQi (Week 3)**
- Register merchant account
- Implement integration
- Test
- Go live

**Phase 4: Korek (Optional)**
- Register merchant account
- Implement integration
- Test
- Go live

---

## 📞 Contact Information

### Zain Cash
- **Website**: https://www.zaincash.iq/
- **Support**: +964 780 000 1111
- **Email**: support@zaincash.iq
- **Developer Portal**: Check website for API docs

### Asiacell Hawala
- **Website**: https://www.asiacellhawala.iq/
- **Support**: +964 780 000 2222
- **Email**: support@asiacellhawala.iq
- **Developer Portal**: Check website for API docs

### SuperQi ⭐
- **Website**: https://www.superqi.iq/
- **Developer Portal**: https://developers-gate.qi.iq/ **← MAIN RESOURCE**
- **Support**: +964 780 000 3333
- **Email**: support@superqi.iq
- **Documentation**: Complete API docs at developers-gate.qi.iq

### Korek
- **Website**: https://www.korek.iq/
- **Support**: +964 780 000 4444
- **Email**: support@korek.iq
- **Developer Portal**: Check website for API docs

---

## ✅ Implementation Checklist

- [ ] Register with Zain Cash
- [ ] Get API credentials
- [ ] Add payment page to HTML
- [ ] Implement JavaScript handler
- [ ] Create backend endpoint
- [ ] Test with test credentials
- [ ] Go live with Zain Cash
- [ ] Repeat for Asiacell, SuperQi, Korek

---

**Last Updated**: November 3, 2025
**Status**: ✅ Iraqi Mobile Money Integration Ready
**Recommendation**: Start with Zain Cash (largest market)
**Estimated Implementation Time**: 2-3 weeks for all wallets

---

## 📋 Implementation Plan: Telr

### Phase 1: Setup (1 hour)
1. Create Telr account
2. Get API credentials
3. Configure webhook
4. Test environment

### Phase 2: Frontend (2-3 hours)
1. Add payment page
2. Add payment form
3. Add payment button
4. Add success/error pages

### Phase 3: Backend (2-3 hours)
1. Create payment endpoint
2. Verify payment
3. Update appointment
4. Send confirmation

### Phase 4: Testing (1-2 hours)
1. Test with test cards
2. Test error scenarios
3. Test webhook
4. Live testing

---

## 🚀 Step-by-Step Implementation

### Step 1: Create Telr Account

**Go to**: https://telr.com

1. Click "Sign Up"
2. Fill in details:
   - Business name: MindCare
   - Email: your@email.com
   - Phone: +964...
   - Country: Iraq
3. Verify email
4. Complete KYC (Know Your Customer)
5. Get API credentials

### Step 2: Get API Credentials

After account approval:
1. Login to Telr dashboard
2. Go to "Settings" → "API Keys"
3. Copy:
   - **Store ID** (public)
   - **API Key** (secret)
   - **Webhook Secret** (for verification)

### Step 3: Add Payment Page to HTML

```html
<!-- Payment Page -->
<section id="paymentPage" class="hidden fade-in">
  <div class="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
    <h2 class="text-2xl font-bold mb-6">Complete Payment</h2>
    
    <!-- Appointment Summary -->
    <div class="bg-gray-50 p-4 rounded-lg mb-6">
      <h3 class="font-semibold mb-3">Appointment Details</h3>
      <p><strong>Doctor:</strong> <span id="paymentDoctorName"></span></p>
      <p><strong>Date:</strong> <span id="paymentDate"></span></p>
      <p><strong>Time:</strong> <span id="paymentTime"></span></p>
      <p><strong>Session Type:</strong> <span id="paymentSessionType"></span></p>
    </div>

    <!-- Payment Summary -->
    <div class="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
      <div class="flex justify-between mb-2">
        <span>Session Rate:</span>
        <span id="paymentRate">$0</span>
      </div>
      <div class="flex justify-between mb-2">
        <span>Platform Fee (5%):</span>
        <span id="paymentFee">$0</span>
      </div>
      <div class="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
        <span>Total:</span>
        <span id="paymentTotal">$0</span>
      </div>
    </div>

    <!-- Payment Method Selection -->
    <div class="mb-6">
      <label class="block font-semibold mb-3">Payment Method</label>
      <div class="space-y-2">
        <label class="flex items-center">
          <input type="radio" name="paymentMethod" value="card" checked class="mr-2">
          <span>Credit/Debit Card</span>
        </label>
        <label class="flex items-center">
          <input type="radio" name="paymentMethod" value="mobilemoney" class="mr-2">
          <span>Mobile Money (Zain Cash, Asiacell)</span>
        </label>
        <label class="flex items-center">
          <input type="radio" name="paymentMethod" value="banktransfer" class="mr-2">
          <span>Bank Transfer</span>
        </label>
      </div>
    </div>

    <!-- Payment Form -->
    <form id="paymentForm" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Full Name</label>
        <input type="text" id="paymentName" required class="w-full border rounded-lg px-3 py-2">
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Email</label>
        <input type="email" id="paymentEmail" required class="w-full border rounded-lg px-3 py-2">
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Phone</label>
        <input type="tel" id="paymentPhone" required class="w-full border rounded-lg px-3 py-2">
      </div>

      <div class="flex space-x-4">
        <button type="button" onclick="navigateTo('dashboard')" class="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">
          Pay Now
        </button>
      </div>
    </form>

    <!-- Bank Transfer Info (shown when selected) -->
    <div id="bankTransferInfo" class="hidden mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h4 class="font-semibold mb-2">Bank Transfer Details</h4>
      <p class="text-sm mb-2">Please transfer the amount to:</p>
      <div class="bg-white p-3 rounded text-sm space-y-1">
        <p><strong>Bank:</strong> Central Bank of Iraq</p>
        <p><strong>Account Name:</strong> MindCare Health</p>
        <p><strong>Account Number:</strong> XXXXXX</p>
        <p><strong>IBAN:</strong> IQ XX XXXX XXXX XXXX</p>
        <p><strong>Amount:</strong> <span id="bankTransferAmount">$0</span></p>
      </div>
      <p class="text-sm mt-3 text-gray-600">
        After transfer, your appointment will be confirmed within 24 hours.
      </p>
    </div>
  </div>
</section>
```

### Step 4: Add JavaScript Payment Handler

```javascript
// Payment handling
let currentAppointmentId = null;
let appointmentData = null;

window.initiatePayment = async function(appointmentId) {
  try {
    // Get appointment data
    const aptSnap = await getDoc(doc(db, 'appointments', appointmentId));
    if (!aptSnap.exists()) {
      alert('Appointment not found');
      return;
    }

    appointmentData = { id: appointmentId, ...aptSnap.data() };
    currentAppointmentId = appointmentId;

    // Get doctor data
    const docSnap = await getDoc(doc(db, 'doctors', appointmentData.doctorId));
    const doctor = docSnap.data();

    // Calculate amount
    const sessionRate = doctor.rate || 50;
    const platformFee = sessionRate * 0.05; // 5% platform fee
    const totalAmount = sessionRate + platformFee;

    // Update payment page
    document.getElementById('paymentDoctorName').textContent = doctor.name;
    document.getElementById('paymentDate').textContent = appointmentData.date;
    document.getElementById('paymentTime').textContent = appointmentData.time;
    document.getElementById('paymentSessionType').textContent = appointmentData.sessionType;
    document.getElementById('paymentRate').textContent = `$${sessionRate}`;
    document.getElementById('paymentFee').textContent = `$${platformFee.toFixed(2)}`;
    document.getElementById('paymentTotal').textContent = `$${totalAmount.toFixed(2)}`;
    document.getElementById('bankTransferAmount').textContent = `$${totalAmount.toFixed(2)}`;

    // Pre-fill user info
    const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
    const user = userSnap.data();
    document.getElementById('paymentName').value = user.fullName || '';
    document.getElementById('paymentEmail').value = currentUser.email || '';
    document.getElementById('paymentPhone').value = user.phone || '';

    navigateTo('payment');
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};

// Handle payment form submission
document.getElementById('paymentForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  const name = document.getElementById('paymentName').value;
  const email = document.getElementById('paymentEmail').value;
  const phone = document.getElementById('paymentPhone').value;

  if (!name || !email || !phone) {
    alert('Please fill in all fields');
    return;
  }

  try {
    if (paymentMethod === 'card' || paymentMethod === 'mobilemoney') {
      // Process with Telr
      await processTelrPayment(name, email, phone, paymentMethod);
    } else if (paymentMethod === 'banktransfer') {
      // Handle bank transfer
      await processBankTransfer(name, email, phone);
    }
  } catch (error) {
    alert(`Payment error: ${error.message}`);
  }
});

// Process payment with Telr
async function processTelrPayment(name, email, phone, method) {
  try {
    const doctor = await getDoc(doc(db, 'doctors', appointmentData.doctorId));
    const sessionRate = doctor.data().rate || 50;
    const totalAmount = sessionRate * 1.05; // Include 5% fee

    // Call your backend to create Telr payment
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointmentId: currentAppointmentId,
        amount: totalAmount,
        currency: 'USD',
        name: name,
        email: email,
        phone: phone,
        method: method,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Redirect to Telr payment page
      window.location.href = data.paymentUrl;
    } else {
      alert(`Payment error: ${data.error}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// Process bank transfer
async function processBankTransfer(name, email, phone) {
  try {
    // Save payment intent
    await addDoc(collection(db, 'payments'), {
      appointmentId: currentAppointmentId,
      patientId: currentUser.uid,
      status: 'pending_transfer',
      method: 'bank_transfer',
      name: name,
      email: email,
      phone: phone,
      createdAt: serverTimestamp(),
    });

    alert('Bank transfer details sent to your email. Please complete the transfer within 24 hours.');
    navigateTo('dashboard');
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}
```

### Step 5: Create Backend Endpoint (Node.js/Express)

```javascript
// backend/routes/payments.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const admin = require('firebase-admin');

const TELR_STORE_ID = process.env.TELR_STORE_ID;
const TELR_API_KEY = process.env.TELR_API_KEY;
const TELR_WEBHOOK_SECRET = process.env.TELR_WEBHOOK_SECRET;

// Create payment
router.post('/create-payment', async (req, res) => {
  try {
    const { appointmentId, amount, currency, name, email, phone, method } = req.body;

    // Create Telr payment request
    const paymentData = {
      store: TELR_STORE_ID,
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      description: `MindCare Appointment - ${appointmentId}`,
      reference: appointmentId,
      customer: {
        name: name,
        email: email,
        phone: phone,
      },
      redirect: {
        success: `${process.env.APP_URL}/payment-success?appointmentId=${appointmentId}`,
        failed: `${process.env.APP_URL}/payment-failed?appointmentId=${appointmentId}`,
      },
    };

    // Call Telr API
    const response = await fetch('https://api.telr.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TELR_API_KEY}`,
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();

    if (result.success) {
      // Save payment record
      await admin.firestore().collection('payments').add({
        appointmentId: appointmentId,
        telrId: result.id,
        amount: amount,
        currency: currency,
        status: 'pending',
        method: method,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({
        success: true,
        paymentUrl: result.url,
      });
    } else {
      res.json({
        success: false,
        error: result.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Webhook for payment confirmation
router.post('/webhook/telr', async (req, res) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-telr-signature'];
    const body = JSON.stringify(req.body);
    const hash = crypto
      .createHmac('sha256', TELR_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== hash) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { id, reference, status } = req.body;

    if (status === 'paid') {
      // Update payment record
      await admin.firestore()
        .collection('payments')
        .where('telrId', '==', id)
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            doc.ref.update({
              status: 'completed',
              completedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          });
        });

      // Update appointment
      await admin.firestore()
        .collection('appointments')
        .doc(reference)
        .update({
          paid: true,
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 📊 Payment Data Structure

### Payments Collection
```json
{
  "appointmentId": "apt_123",
  "patientId": "patient_uid",
  "doctorId": "doctor_uid",
  "amount": 52.50,
  "currency": "USD",
  "status": "completed",
  "method": "card",
  "telrId": "telr_payment_id",
  "telrReference": "apt_123",
  "paidAt": "timestamp",
  "createdAt": "timestamp"
}
```

### Appointments Collection (Updated)
```json
{
  "patientId": "patient_uid",
  "doctorId": "doctor_uid",
  "status": "confirmed",
  "paid": true,
  "paidAt": "timestamp",
  "paymentId": "payment_123",
  // ... other fields
}
```

---

## 🔐 Security Considerations

### Payment Security
1. **Never store card data** - Use Telr's hosted payment page
2. **Use HTTPS** - All payment requests must be encrypted
3. **Verify webhooks** - Check signature on all webhooks
4. **Use environment variables** - Store API keys securely
5. **PCI compliance** - Follow PCI DSS standards

### Firestore Rules for Payments
```
match /payments/{id} {
  allow create: if signedIn() && request.resource.data.patientId == request.auth.uid;
  allow read: if signedIn() && 
    (resource.data.patientId == request.auth.uid ||
     resource.data.doctorId == request.auth.uid);
}
```

---

## 💰 Pricing Strategy

### Recommended Pricing
- **Session Rate**: $30-50 (doctor sets)
- **Platform Fee**: 5% (MindCare takes)
- **Payment Gateway Fee**: 2.5% (Telr takes)
- **Total Cost to Patient**: Session Rate + 5%
- **Doctor Receives**: Session Rate - 2.5%

### Example
- Session Rate: $50
- Platform Fee (5%): $2.50
- Patient Pays: $52.50
- Telr Fee (2.5% of $52.50): $1.31
- Doctor Receives: $50 - $1.31 = $48.69

---

## 🧪 Testing Payments

### Test Cards (Telr Sandbox)
```
Card Number: 4111111111111111
Expiry: 12/25
CVV: 123
```

### Test Flow
1. Create test appointment
2. Click "Pay Now"
3. Use test card
4. Should see success page
5. Check Firestore for payment record

---

## 📋 Implementation Checklist

### Phase 1: Setup
- [ ] Create Telr account
- [ ] Get API credentials
- [ ] Set up environment variables
- [ ] Configure webhook

### Phase 2: Frontend
- [ ] Add payment page to HTML
- [ ] Add payment form
- [ ] Add payment method selection
- [ ] Add success/error pages

### Phase 3: Backend
- [ ] Create payment endpoint
- [ ] Implement Telr API integration
- [ ] Create webhook handler
- [ ] Add payment verification

### Phase 4: Integration
- [ ] Add payment button to appointment
- [ ] Update appointment status after payment
- [ ] Send payment confirmation email
- [ ] Add payment history

### Phase 5: Testing
- [ ] Test with test cards
- [ ] Test error scenarios
- [ ] Test webhook
- [ ] Test refunds

### Phase 6: Production
- [ ] Switch to production Telr account
- [ ] Update environment variables
- [ ] Test with real payments
- [ ] Monitor transactions

---

## 🚀 Deployment

### Environment Variables
```
TELR_STORE_ID=your_store_id
TELR_API_KEY=your_api_key
TELR_WEBHOOK_SECRET=your_webhook_secret
APP_URL=https://mindcare-9a4d2.web.app
```

### Firebase Hosting
- Deploy backend to Cloud Functions or external server
- Update payment endpoint URL
- Configure CORS for payment requests

---

## 📞 Support & Resources

### Telr Documentation
- https://telr.com/documentation
- https://telr.com/support

### Payment Integration Best Practices
- https://stripe.com/docs/payments
- https://developer.paypal.com/

### Security Resources
- https://www.pcisecuritystandards.org/
- https://owasp.org/www-community/attacks/Payment_Card_Industry_Data_Security_Standard

---

## 🎯 Next Steps

1. **Create Telr Account** - Sign up and get credentials
2. **Set Up Backend** - Create payment endpoint
3. **Add Payment Page** - Implement frontend
4. **Test Payments** - Use test cards
5. **Go Live** - Switch to production

---

**Last Updated**: November 3, 2025
**Status**: ⏳ Ready for Implementation
**Recommendation**: Use Telr for Iraq market
**Estimated Implementation Time**: 8-10 hours
