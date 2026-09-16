export function products() {
  return [
    { id: 1, name: "Wireless Mouse", price: 24.5, stock: 100 },
    { id: 2, name: "Mechanical Keyboard", price: 19.99, stock: 100 },
    { id: 3, name: "USB-C Hub", price: 34.0, stock: 100 },
    { id: 4, name: "Laptop Stand", price: 42.75, stock: 50 },
    { id: 5, name: "4K Webcam", price: 59.99, stock: 40 },
    { id: 6, name: "Limited Edition Deskmat", price: 15.0, stock: 3 },
  ];
}

export function coupons() {
  return [
    {
      code: "WELCOME10",
      percentOff: 10,
      expiresAt: "2030-01-01T00:00:00Z",
    },
    {
      code: "EXPIRED20",
      percentOff: 20,
      expiresAt: "2024-01-01T00:00:00Z",
    },
  ];
}
