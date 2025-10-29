export const formatCurrency = (
    amount: number,
    currency = "NGN",
    locale = "en-NG",
  ): string => {
    return new Intl.NumberFormat(locale, {
        currency,
        maximumFractionDigits: 2,
      style: "currency",
    }).format(amount);
  };
  