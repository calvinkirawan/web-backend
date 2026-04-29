export const convertCurrency = (amount, fromCode, toCode, rates) => {
    const fromRate = rates.find(r => r.currency_code === fromCode)?.rate_to_idr;
    const toRate = rates.find(r => r.currency_code === toCode)?.rate_to_idr;

    if (!fromRate || !toRate) return amount;

    // Formula: (Amount * From_Rate_to_IDR) / To_Rate_to_IDR
    return (amount * fromRate) / toRate;
};