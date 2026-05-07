export const generateProductKey = ({
  tenantId,
  category,
  minPrice,
  maxPrice,
}) => {
  return `product_cache:${tenantId}:${category}:${minPrice}:${maxPrice}`;
};

export const generateLockKey = ({ tenantId, userId }) => {
  return `lock:order:${tenantId}:${userId}`;
};
