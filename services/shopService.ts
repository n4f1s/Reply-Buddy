// Example: load static shop data from JSON


const shopDatabase: Record<string, any> = {
  "default": {
    deliveryTime: "within 2-3 days",
    deliveryCost: "$5",
    products: [
      { name: "T-Shirt", price: "20 dollar" },
      { name: "Jeans", price: 40 },
      { name: "Shoes", price: 60 },
    ],
  },
};

export async function getShopData(shopId: string) {
  // For now return default data (extend for per-shop logic)
  return shopDatabase[shopId] || shopDatabase["default"];
}
