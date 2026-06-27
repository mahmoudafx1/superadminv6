export const parseAmount = (amountObj) => {
    if (!amountObj) return 0;

    const digits = amountObj.d?.[0] || 0;
    const exponent = amountObj.e || 0;

    return digits * Math.pow(10, exponent - 2);
};

export const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-EG", {
        style: "currency",
        currency: "EGP",
        maximumFractionDigits: 0,
    }).format(value);
};