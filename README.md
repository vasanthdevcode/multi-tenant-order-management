# Implemented features:

## Overview idea

### Mental model:

1. tenant - company or organization
2. user - user within organization and private to tenant
3. product - list of product for user that products private to tenant
4. order - user can order product that order private to tenant

### Example workflow:

- Available tenants - t1, t2, t3

- Available users - u1, u2, u3, u4, u5, u6, u7

- Belongs to tenant:
  - t1 - u2, u4
  - t2 - u3, u4, u7
  - t3 - u1, u5, u6

- (u4 in both tenant t1 and t2)

## Steps

- create tenant
- create user using tenantID
- create some products using tenantID
- order with some product

# Tech Overview

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

## Tech explanation

### Create tenant logic

- Adding `{ config: { skipTenant: true } }` flag to skip global tanent id validation in middleware(design choice: instead of using url includes check, i used flag passing that prevent future end rename bug )
- tenant middleware attach tenantId to req (design choice: avoid repeatation access `req.headers.["x-tenant"]`)

---

### Create user logic

- here common middleware check tenant id then create user

---

### Create product logic

- here common middleware check tenant id then create product

---

### Get product logic

- add some filter edge case such as check minPrice params should less than maxPrice and valid number check
- added pagination

---

### Create order logic

- check user belogs to tenant
- check product belogs to tenant
- check inventoryCount for stack
- sum totalAmount based on order items dynamically also consider quantity of items
- decrease inventoryCount while order placed

---

### Get order logic

- get based on tenant id
- added sorting

---

### Checks

- [x] Tenant isolation enforced in ALL queries
- [x] Indexes exist and are used (verified via explain)
- [x] Query performance improves after indexing
- [x] Aggregation returns correct monthly revenue
- [x] Orders validate product + user tenant consistency
- [x] Inventory decreases correctly on order creation
