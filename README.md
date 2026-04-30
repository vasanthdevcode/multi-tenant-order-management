# Implemented features:

## Root file

- Entry point of the application
- Registers all routes
- Connects to MongoDB
- Applies tenant middleware
- Starts Fastify server

---

## API Endpoints

### User

- **Create User**
  - `POST /api/user`

---

### Order

- **Create Order**
  - `POST /api/order`

- **Get All Orders**
  - `GET /api/orders`
  - Supports sorting

---

### Product

- **Create Product**
  - `POST /api/product`

- **Get All Products**
  - `GET /api/product`
  - Supports filtering and pagination

---

### Tenant

- **Create Tenant**
  - `POST /api/tenant`

---

### Analytics

- **Revenue Analytics**
  - `GET /api/analytics/revenue`
  - Uses MongoDB aggregation

---

### Indexing

- User Index:
  - Added compound index `userSchema.index({ tenantId: 1, email: 1 }, { unique: true });` means unique email per tenant

- Product:
  - Added compound index

  ```
  productSchema.index({ tenantId: 1, category: 1 });
  productSchema.index({ tenantId: 1, price: 1 });
  // Since tags is an array, MongoDB creates a multikey index.
  productSchema.index({ tenantId: 1, tags: 1 });
  ```

- Order:
  - Added compound index
  ```
  orderSchema.index({ tenantId: 1, createdAt: -1 });
  orderSchema.index({ tenantId: 1, status: 1 });
  orderSchema.index({ tenantId: 1, userId: 1 });
  ```

### Checks

- [x] Tenant isolation enforced in ALL queries
- [x] Indexes exist and are used (verified via explain)
- [x] Query performance improves after indexing
- [x] Aggregation returns correct monthly revenue
