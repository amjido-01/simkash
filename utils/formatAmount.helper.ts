export // Helper function to format amount
const formatAmount = (amount: string, isCommission = false) => {
  const sign = isCommission ? "+" : "-";
  return `${sign}₦${parseFloat(amount).toLocaleString()}`;
};