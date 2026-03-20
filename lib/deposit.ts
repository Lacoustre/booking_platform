export function calculateDeposit(packageName: string, price: number) {
  const bridalPackages = [
    "gold-3hrs",
    "gold-hair",
    "gold-mum",
    "premium-full",
    "two-days-gold",
    "two-days-premium",
    "styling-two-days",
    "full-styling"
  ];

  if (bridalPackages.includes(packageName)) {
    return 1000;
  }

  return Math.round(price / 2); // 50% for non-bridal (bridesmaids etc.)
}