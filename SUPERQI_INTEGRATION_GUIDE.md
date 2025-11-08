# SuperQi Integration Guide - Technical Specifications

## 📋 SuperQi API Requirements

SuperQi has specific technical requirements that must be followed exactly.

---

## 🔐 Authentication

### Header Requirements
Every request must include:

```javascript
headers: {
  'Content-Type': 'application/json; charset=utf-8',
  'X-Terminal-Id': 'YOUR_MERCHANT_TERMINAL_ID',
  'X-Request-Id': 'UNIQUE_REQUEST_ID'
}
```

### X-Terminal-Id
- **What**: Your merchant terminal identifier
- **Where**: Request header
- **Format**: String provided by SuperQi
- **Required**: Yes, every request

### X-Request-Id
- **What**: Unique identifier for each request
- **Where**: Request header
- **Format**: Must be unique for each POST request
- **Example**: `REQ_1730641200000_a1b2c3d4e5`
- **Required**: Yes, every request
- **Note**: If you send the same requestId twice, SuperQi will reject it

---

## 📅 Date & Time Formatting

### Date Format
```
Format: yyyy-MM-dd
Example: 2025-11-03
Timezone: GMT+3 (Iraq Standard Time)
```

### DateTime Format
```
Format: yyyy-MM-ddTHH:mm:ss
Example: 2025-11-03T14:30:45
Timezone: GMT+3 (Iraq Standard Time, 24-hour format)
Note: NO 'Z' suffix, NO milliseconds
```

### JavaScript Implementation
```javascript
// Get current time in GMT+3
const now = new Date();
const gmtPlus3Date = new Date(now.getTime() + (3 * 60 * 60 * 1000));

// Format as date (yyyy-MM-dd)
const dateString = gmtPlus3Date.toISOString().split('T')[0];
// Result: "2025-11-03"

// Format as datetime (yyyy-MM-ddTHH:mm:ss)
const dateTimeString = gmtPlus3Date.toISOString().replace('Z', '').substring(0, 19);
// Result: "2025-11-03T14:30:45"
```

---

## 💰 Amount Formatting

### Amount Format
```
Format: 0.00 (two decimal places)
Separator: Dot (.)
Example: 51.00, 100.50, 25.99
```

### JavaScript Implementation
```javascript
const amount = 51;
const formattedAmount = amount.toFixed(2);
// Result: "51.00"
```

---

## 🔤 Encoding

### UTF-8 Encoding Required
```javascript
headers: {
  'Content-Type': 'application/json; charset=utf-8'
}
```

- All text must be UTF-8 encoded
- Arabic characters supported
- Special characters must be properly escaped

---

## 🔒 SSL/TLS Encryption

### Minimum Requirements
- **SSL/TLS Version**: 1.2 or higher
- **Key Length**: Minimum 128-bit
- **Cipher Suites**: Modern, secure ciphers

### Implementation
```javascript
// Node.js automatically uses secure TLS
// Just ensure you're using HTTPS
const response = await fetch('https://api.superqi.iq/payment/request', {
  // ... your request
});
```

---

## 📤 Request Structure

### Complete Request Example
```javascript
const requestId = `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const now = new Date();
const gmtPlus3Date = new Date(now.getTime() + (3 * 60 * 60 * 1000));
const dateString = gmtPlus3Date.toISOString().split('T')[0];
const dateTimeString = gmtPlus3Date.toISOString().replace('Z', '').substring(0, 19);

const response = await fetch('https://api.superqi.iq/payment/request', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Terminal-Id': process.env.SUPERQI_TERMINAL_ID,
    'X-Request-Id': requestId,
  },
  body: JSON.stringify({
    requestId: requestId,
    transactionId: `SUPERQI_APT_${appointmentId}_${Date.now()}`,
    amount: '51.00',
    currency: 'IQD',
    date: dateString,
    dateTime: dateTimeString,
    customer: {
      name: 'Patient Name',
      phone: '+964123456789',
      email: 'patient@example.com',
    },
    description: 'MindCare Appointment - APT_123',
    callbackUrl: 'https://mindcare.app/payment-callback?method=superqi',
  }),
});
```

---

## ✅ Validation Checklist

Before sending request to SuperQi, verify:

- [ ] X-Terminal-Id is present in headers
- [ ] X-Request-Id is unique and not used before
- [ ] Content-Type includes `charset=utf-8`
- [ ] Date format is `yyyy-MM-dd`
- [ ] DateTime format is `yyyy-MM-ddTHH:mm:ss` (no Z, no milliseconds)
- [ ] Amount format is `0.00` (two decimal places)
- [ ] All text is UTF-8 encoded
- [ ] Using HTTPS (SSL/TLS 1.2+)
- [ ] requestId in body matches X-Request-Id in header
- [ ] All required fields are present

---

## 🚨 Common Errors & Solutions

### Error: "Invalid requestId"
**Cause**: requestId was already used
**Solution**: Generate new unique requestId for each request

```javascript
// ❌ WRONG - Same requestId
const requestId = 'REQ_12345';
// Send request 1
// Send request 2 with same requestId → ERROR

// ✅ CORRECT - Unique requestId
const requestId1 = `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const requestId2 = `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
```

### Error: "Invalid date format"
**Cause**: Date not in `yyyy-MM-dd` format
**Solution**: Use proper date formatting

```javascript
// ❌ WRONG
const date = new Date().toString(); // "Mon Nov 03 2025 14:30:45 GMT+0300"

// ✅ CORRECT
const date = new Date().toISOString().split('T')[0]; // "2025-11-03"
```

### Error: "Invalid datetime format"
**Cause**: DateTime not in `yyyy-MM-ddTHH:mm:ss` format
**Solution**: Remove Z and milliseconds

```javascript
// ❌ WRONG
const dateTime = new Date().toISOString(); // "2025-11-03T14:30:45.123Z"

// ✅ CORRECT
const dateTime = new Date().toISOString().replace('Z', '').substring(0, 19); // "2025-11-03T14:30:45"
```

### Error: "Invalid amount format"
**Cause**: Amount not in `0.00` format
**Solution**: Use toFixed(2)

```javascript
// ❌ WRONG
const amount = 51; // Missing decimal places
const amount = '51'; // String without decimals
const amount = 51.5; // Only one decimal place

// ✅ CORRECT
const amount = (51).toFixed(2); // "51.00"
const amount = (51.5).toFixed(2); // "51.50"
```

### Error: "Missing X-Terminal-Id header"
**Cause**: Terminal ID not in request header
**Solution**: Add X-Terminal-Id to headers

```javascript
// ❌ WRONG
headers: {
  'Content-Type': 'application/json'
}

// ✅ CORRECT
headers: {
  'Content-Type': 'application/json; charset=utf-8',
  'X-Terminal-Id': process.env.SUPERQI_TERMINAL_ID,
  'X-Request-Id': requestId,
}
```

### Error: "Invalid encoding"
**Cause**: Not UTF-8 encoded
**Solution**: Specify UTF-8 in Content-Type

```javascript
// ❌ WRONG
'Content-Type': 'application/json'

// ✅ CORRECT
'Content-Type': 'application/json; charset=utf-8'
```

---

## 🧪 Testing with SuperQi

### Test Environment
- **URL**: `https://test-api.superqi.iq/payment/request` (if available)
- **Credentials**: Provided by SuperQi
- **Test Terminal ID**: Provided by SuperQi

### Test Request
```javascript
const testRequest = {
  requestId: `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  transactionId: `TEST_TXN_${Date.now()}`,
  amount: '10.00',
  currency: 'IQD',
  date: '2025-11-03',
  dateTime: '2025-11-03T14:30:45',
  customer: {
    name: 'Test Customer',
    phone: '+964123456789',
    email: 'test@example.com',
  },
  description: 'Test Payment',
  callbackUrl: 'https://localhost:3000/test-callback',
};
```

---

## 📞 SuperQi Support & Documentation

### Official Developer Portal
- **Developer Documentation**: https://developers-gate.qi.iq/ ⭐ **MAIN RESOURCE**
- **Website**: https://www.superqi.iq/
- **Support Email**: support@superqi.iq
- **Support Phone**: +964 780 000 3333

### What's Available at developers-gate.qi.iq
- Complete API documentation
- Integration guides
- Code examples
- Test environment setup
- Webhook specifications
- Error codes and solutions
- SDK downloads (if available)
- Support tickets

---

## 🔄 Complete Integration Code

```javascript
// SuperQi payment processor
async function processSuperQiPayment(name, phone, email, amount, appointmentId) {
  try {
    // Generate unique IDs
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
        error: data.message || data.error || 'Payment request failed',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
```

---

## 📋 Implementation Checklist

- [ ] Get SuperQi Terminal ID from SuperQi
- [ ] Store Terminal ID in environment variables
- [ ] Implement date formatting (GMT+3)
- [ ] Implement datetime formatting (GMT+3)
- [ ] Implement amount formatting (0.00)
- [ ] Add X-Terminal-Id header
- [ ] Add X-Request-Id header (unique per request)
- [ ] Add UTF-8 encoding to Content-Type
- [ ] Test with test credentials
- [ ] Verify webhook handling
- [ ] Test error scenarios
- [ ] Go live with production credentials

---

**Last Updated**: November 3, 2025
**Status**: ✅ SuperQi Technical Specifications Complete
**Version**: 1.0.0
