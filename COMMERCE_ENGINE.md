# Kissan Mithar Conversational Commerce Engine
## In-Chat Agricultural Product Discovery, Cart Management & Checkout

---

### 1. Vision & Conversational Commerce Journey

Farmers should not have to navigate complicated e-commerce menus, category filters, and checkout funnels. Kissan Mithar embeds a frictionless, end-to-end commerce experience inside the conversation:

```
+----------------------------------------------------------------------------------------------------+
|                                CONVERSATIONAL COMMERCE FUNNEL                                      |
+----------------------------------------------------------------------------------------------------+
| 1. DIAGNOSIS    | Farmer sends photo of yellow leaves with brown lesions on cotton.                |
| 2. PRESCRIPTION | Assistant identifies Bacterial Blight and recommends Copper Oxychloride 50% WP.  |
| 3. IN-CHAT CARD | Assistant renders rich product card with brand (Blitox), pack size, price, stock.|
| 4. CART ACTION  | Farmer says: "Naaku 2 dabba Blitox pampinchu" -> Added 2 units to cart.          |
| 5. REVIEW CART  | Assistant renders visual cart summary (2x Blitox = Rs 960, Free Delivery).       |
| 6. CHECKOUT     | Farmer confirms shipping village (Gadwal) and selects Cash on Delivery.          |
| 7. TRACKING     | Order #KM-ORD-00492 confirmed with instant SMS and in-chat tracking timeline.     |
+----------------------------------------------------------------------------------------------------+
```

---

### 2. Product Catalog Schema & Categorization

The catalog is backed by `ProductCatalog` with strict technical metadata:

```
+---------------------------------------------------------------------------------------+
| Category               | Example SKUs                      | Technical / Active Comp. |
+------------------------+-----------------------------------+--------------------------+
| SEEDS                  | Kaveri Super Cotton Seeds (450g)  | Hybrid Bollgard II       |
| FERTILIZERS            | IFFCO DAP (50kg Bag)              | 18% N, 46% P2O5          |
| FERTILIZERS (SOLUBLE)  | Mahadhan 19:19:19 (1kg)           | NPK Balanced Foliar      |
| CROP PROTECTION (BIO)  | Trichoderma Viride Bio-Fungicide  | 2x10^8 CFU/g             |
| CROP PROTECTION (CHEM) | Blitox 50 (Copper Oxychloride)    | Copper Oxychloride 50% WP|
| FARM TOOLS & SPRAYERS  | Neptune 16L Battery Sprayer       | 12V Battery Backpack     |
+------------------------+-----------------------------------+--------------------------+
```

---

### 3. In-Chat Interactive UI Card Protocol

The backend orchestrator emits standardized structured JSON alongside textual chat responses:

```json
{
  "type": "PRODUCT_CARD",
  "data": {
    "productId": "prod_blitox_500g",
    "name": "Blitox 50 Fungicide",
    "brand": "Rallis India",
    "technicalName": "Copper Oxychloride 50% WP",
    "imageUrl": "https://res.cloudinary.com/kissan-mithar/image/upload/v1/products/blitox.png",
    "packagingSize": "500 grams",
    "price": 480.0,
    "mrp": 550.0,
    "discountPercent": 12.7,
    "inStock": true,
    "stockQuantity": 42,
    "dosageGuide": "2.5 grams per litre of water",
    "actions": [
      {
        "label": "Add to Cart",
        "actionType": "CART_ADD",
        "payload": { "productId": "prod_blitox_500g", "quantity": 1 }
      },
      {
        "label": "Buy Now (COD)",
        "actionType": "QUICK_BUY",
        "payload": { "productId": "prod_blitox_500g", "quantity": 1 }
      }
    ]
  }
}
```

---

### 4. Cart & Checkout API Lifecycle

```
POST /api/commerce/cart/items       -> Add SKU to cart
GET  /api/commerce/cart             -> View active cart items & total breakdown
DELETE /api/commerce/cart/items/:id -> Remove item or adjust quantity
POST /api/commerce/orders/checkout  -> Convert cart to placed order
POST /api/commerce/orders/:id/pay   -> Initiate Razorpay / UPI payment intent
GET  /api/commerce/orders           -> List farmer's past order history
```

---

### 5. Payment Security & Rural Farmer Trust

1. **Cash on Delivery (COD):** The predominant payment mode for rural Indian agriculture. High-value orders (> Rs 2,000) trigger an automated phone OTP verification before dispatch.
2. **UPI QR Code In-Chat:** For farmers with PhonePe, Google Pay, or Paytm, the assistant generates an instant UPI Dynamic QR code embedding the order reference.
3. **Transparent Billing:** Zero hidden delivery fees for agricultural inputs exceeding Rs 500.
