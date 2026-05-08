export const generateProductKey = ({
  tenantId,
  category,
  minPrice,
  maxPrice,
  sort,
}) => {
  return `product_cache:${tenantId}:${category}:${minPrice}:${maxPrice}:${sort}`;
};

export const generateIdemKey = ({ tenantId, userId, idemKey }) => {
  return `idem:order:${tenantId}:${userId}:${idemKey}`;
};

export const generateLockKey = ({ tenantId, userId, idemKey }) => {
  return `lock:order:${tenantId}:${userId}:${idemKey}`;
};
