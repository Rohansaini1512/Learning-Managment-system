# Razorpay Payment Flow - Visual Diagrams

This document contains visual representations of the Razorpay payment integration flow.

---

## 🎯 Complete Payment Flow - Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend as Frontend<br/>(React + Redux)
    participant Backend as Backend<br/>(Node.js + Express)
    participant Razorpay as Razorpay API
    participant DB as Database<br/>(MongoDB)

    rect rgb(240, 248, 255)
        Note over User,DB: PHASE 1: Initialization
        Frontend->>Frontend: Load Razorpay SDK from CDN<br/>window.Razorpay available
        Backend->>Backend: Initialize Razorpay SDK<br/>with env variables<br/>(KEY_ID, SECRET, PLAN_ID)
    end

    rect rgb(255, 250, 240)
        Note over User,DB: PHASE 2: Subscription Creation
        User->>Frontend: Clicks "Buy Now" button
        Frontend->>Backend: GET /api/v1/payments/razorpay-key
        Backend-->>Frontend: { success: true, key: RAZORPAY_KEY_ID }
        Frontend->>Frontend: Store key in Redux (razorpay.key)
        
        Frontend->>Backend: POST /api/v1/payments/subscribe<br/>(with JWT token)
        Backend->>Backend: Validate user (not ADMIN)
        Backend->>Razorpay: Create subscription<br/>(plan_id from env)
        Razorpay-->>Backend: { id: subscription_id, status: "created" }
        Backend->>DB: Update User<br/>subscription.id = subscription_id<br/>subscription.status = "created"
        Backend-->>Frontend: { success: true, subscription_id }
        Frontend->>Frontend: Store subscription_id in Redux
    end

    rect rgb(240, 255, 240)
        Note over User,DB: PHASE 3: Payment Processing
        Frontend->>Frontend: Create Razorpay options<br/>{ key, subscription_id, handler }
        Frontend->>Razorpay: Open payment modal<br/>new Razorpay(options).open()
        User->>Razorpay: Enter payment details<br/>(Card/UPI/Wallet)
        Razorpay->>Razorpay: Process payment
        Razorpay-->>Frontend: Payment success callback<br/>{ razorpay_payment_id,<br/>  razorpay_signature,<br/>  razorpay_subscription_id }
    end

    rect rgb(255, 240, 240)
        Note over User,DB: PHASE 4: Payment Verification
        Frontend->>Backend: POST /api/v1/payments/verify<br/>{ razorpay_payment_id,<br/>  razorpay_signature,<br/>  razorpay_subscription_id }
        Backend->>Backend: Get user subscription.id
        Backend->>Backend: Generate HMAC SHA256 signature:<br/>crypto.createHmac('sha256', SECRET)<br/>  .update(payment_id + ' | ' + subscription_id)<br/>  .digest('hex')
        Backend->>Backend: Compare signatures
        
        alt Signatures Match ✅
            Backend->>DB: Create Payment record<br/>{ payment_id, signature, subscription_id }
            Backend->>DB: Update User<br/>subscription.status = 'active'
            Backend-->>Frontend: { success: true, message: "Payment verified" }
            Frontend->>User: Redirect to /checkout/success
        else Signatures Don't Match ❌
            Backend-->>Frontend: { success: false, message: "Payment not verified" }
            Frontend->>User: Redirect to /checkout/fail
        end
    end
```

---

## 🏗️ Architecture Overview Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        A[User Browser] --> B[React App]
        B --> C[Checkout.jsx]
        C --> D[Redux Store<br/>RazorpaySlice]
    end

    subgraph "API Layer"
        D --> E[Axios Instance]
        E --> F[GET /payments/razorpay-key]
        E --> G[POST /payments/subscribe]
        E --> H[POST /payments/verify]
    end

    subgraph "Backend Server"
        F --> I[Auth Middleware<br/>isLoggedIn]
        G --> I
        H --> I
        
        I --> J[Payment Controller]
        J --> K[getRazorpayApiKey]
        J --> L[buySubscription]
        J --> M[verifySubscription]
        
        L --> N[Razorpay SDK Instance]
        M --> N
        M --> O[Signature Verification<br/>HMAC SHA256]
    end

    subgraph "External Services"
        N --> P[Razorpay API]
        P --> Q[Razorpay Payment Gateway]
    end

    subgraph "Data Layer"
        L --> R[(User Model)]
        M --> R
        M --> S[(Payment Model)]
        R --> T[MongoDB]
        S --> T
    end

    style A fill:#e1f5ff
    style Q fill:#ffe1f5
    style T fill:#fff5e1
    style O fill:#ff6b6b,color:#fff
```

---

## 📋 Step-by-Step Flow (Detailed)

### **Visual Representation**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          RAZORPAY INTEGRATION FLOW                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: SETUP & INITIALIZATION                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐                    ┌─────────────┐
│  Frontend   │                    │   Backend   │
│  (Browser)  │                    │  (Server)   │
└──────┬──────┘                    └──────┬──────┘
       │                                   │
       │ 1. Load Razorpay CDN              │ 2. Initialize Razorpay SDK
       │    <script src=                   │    new Razorpay({
       │      "checkout.razorpay.com">     │      key_id: env.KEY_ID,
       │                                   │      key_secret: env.SECRET
       │                                   │    })
       │                                   │
       └───────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: USER INITIATES SUBSCRIPTION                                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────┐    ┌──────────┐    ┌─────────┐    ┌──────────┐    ┌──────────┐
│  User   │    │Frontend  │    │ Backend │    │ Razorpay │    │Database  │
└────┬────┘    └────┬─────┘    └────┬────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │               │
     │ Click "Buy"   │               │               │               │
     ├──────────────>│               │               │               │
     │               │               │               │               │
     │               │ GET /razorpay-key            │               │
     │               ├──────────────────────────────>│               │
     │               │                               │               │
     │               │ Returns: { key: "rzp_xxx" }   │               │
     │               │<──────────────────────────────┤               │
     │               │                               │               │
     │               │ Store in Redux                │               │
     │               │                               │               │
     │               │ POST /subscribe               │               │
     │               ├──────────────────────────────>│               │
     │               │                               │               │
     │               │                               │ Create Subscription
     │               │                               ├──────────────>│
     │               │                               │               │
     │               │                               │ Returns:      │
     │               │                               │ subscription_id
     │               │                               │<──────────────┤
     │               │                               │               │
     │               │                               │ Save to User  │
     │               │                               ├───────────────>│
     │               │                               │               │
     │               │ Returns: { subscription_id }  │               │
     │               │<──────────────────────────────┤               │
     │               │                               │               │
     │               │ Store subscription_id         │               │
     │               │                               │               │


┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: PAYMENT PROCESSING                                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────┐    ┌──────────┐                        ┌──────────────────────┐
│  User   │    │Frontend  │                        │  Razorpay Gateway   │
└────┬────┘    └────┬─────┘                        └──────┬───────────────┘
     │               │                                    │
     │               │ Create Razorpay Options:          │
     │               │ {                                 │
     │               │   key: razorpayKey,               │
     │               │   subscription_id: sub_id,         │
     │               │   handler: callback               │
     │               │ }                                 │
     │               │                                    │
     │               │ Open Modal                         │
     │               ├───────────────────────────────────>│
     │               │                                    │
     │  Enter Payment Details (Card/UPI)                   │
     ├───────────────────────────────────────────────────>│
     │               │                                    │
     │               │                                    │ Process Payment
     │               │                                    │
     │               │ Payment Success Callback:          │
     │               │ {                                  │
     │               │   razorpay_payment_id: "pay_xxx",  │
     │               │   razorpay_signature: "sig_xxx",   │
     │               │   razorpay_subscription_id: "..." │
     │               │ }                                  │
     │               │<───────────────────────────────────┤
     │               │                                    │


┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: PAYMENT VERIFICATION (CRITICAL SECURITY STEP)                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────┐    ┌─────────┐    ┌──────────┐    ┌──────────┐
│Frontend  │    │ Backend │    │Database  │    │ Razorpay │
└────┬─────┘    └────┬────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │
     │ POST /verify  │               │               │
     │ {             │               │               │
     │   payment_id, │               │               │
     │   signature,  │               │               │
     │   sub_id      │               │               │
     │ }             │               │               │
     ├──────────────>│               │               │
     │               │               │               │
     │               │ Get user subscription.id       │
     │               │                               │
     │               │ Generate Expected Signature:  │
     │               │ crypto.createHmac('sha256',   │
     │               │   SECRET)                      │
     │               │   .update(payment_id +        │
     │               │     ' | ' + subscription_id)  │
     │               │   .digest('hex')              │
     │               │                               │
     │               │ Compare Signatures            │
     │               │                               │
     │               │ ┌─────────────────────────┐   │
     │               │ │ Signatures Match?       │   │
     │               │ └─────────────────────────┘   │
     │               │        │                      │
     │               │    YES │ NO                   │
     │               │    │   └──> Reject & Return   │
     │               │    │        Error             │
     │               │    │                          │
     │               │    ▼                          │
     │               │ Create Payment Record         │
     │               ├──────────────────────────────>│
     │               │                               │
     │               │ Update User:                  │
     │               │ subscription.status = 'active' │
     │               ├──────────────────────────────>│
     │               │                               │
     │               │ Return Success                │
     │               │                               │
     │<──────────────┤                               │
     │               │                               │
     │ Redirect to Success Page                      │
     │                                               │
```

---

## 🔐 Security Verification Flow

```mermaid
flowchart TD
    A[Payment Response from Razorpay] --> B[Frontend receives:<br/>payment_id, signature, subscription_id]
    B --> C[Send to Backend<br/>POST /payments/verify]
    C --> D{User Authenticated?}
    D -->|No| E[Return 401 Unauthorized]
    D -->|Yes| F[Get user subscription.id from DB]
    F --> G[Generate HMAC SHA256:<br/>SECRET + payment_id + subscription_id]
    G --> H[Compare Generated Signature<br/>with Received Signature]
    H --> I{Signatures Match?}
    I -->|No| J[Return Error:<br/>Payment not verified]
    I -->|Yes| K[Create Payment Record in DB]
    K --> L[Update User:<br/>subscription.status = 'active']
    L --> M[Return Success]
    
    style I fill:#ff6b6b,color:#fff
    style K fill:#51cf66,color:#fff
    style M fill:#51cf66,color:#fff
```

---

## 📊 Data Flow Summary

```
ENVIRONMENT VARIABLES (Backend Only)
├── RAZORPAY_KEY_ID → Sent to frontend (public)
├── RAZORPAY_SECRET → NEVER sent to frontend (secret)
└── RAZORPAY_PLAN_ID → Used to create subscriptions

FRONTEND STATE (Redux)
├── razorpay.key → Public key from backend
├── razorpay.subscription_id → Subscription ID from backend
└── razorpay.isPaymentVerified → Verification status

BACKEND DATABASE
├── User Model
│   └── subscription: { id: String, status: String }
└── Payment Model
    ├── razorpay_payment_id: String
    ├── razorpay_subscription_id: String
    └── razorpay_signature: String

RAZORPAY RESPONSE (Payment Success)
├── razorpay_payment_id → Unique payment ID
├── razorpay_signature → HMAC signature for verification
└── razorpay_subscription_id → Subscription reference
```

---

## 🎯 Quick Reference - Flow Steps

```
1. [User] → Click "Buy Now"
2. [Frontend] → Get Razorpay public key
3. [Frontend] → Create subscription (get subscription_id)
4. [Frontend] → Open Razorpay payment modal
5. [User] → Complete payment
6. [Razorpay] → Return payment details + signature
7. [Frontend] → Send to backend for verification
8. [Backend] → Verify signature (HMAC SHA256)
9. [Backend] → Save payment record & activate subscription
10. [Frontend] → Redirect to success page
```

---

**Note:** All diagrams can be viewed in:
- GitHub (Mermaid diagrams render automatically)
- VS Code (with Mermaid extension)
- Markdown viewers that support Mermaid
- ASCII diagrams work everywhere


