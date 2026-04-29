export const formatCurrency = (amount, currencyCode = 'IDR') => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currencyCode,
    // For IDR, we usually don't want decimals. For USD/SGD, we do.
    minimumFractionDigits: currencyCode === 'IDR' ? 0 : 2,
  }).format(amount || 0);
};