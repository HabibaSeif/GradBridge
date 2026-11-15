export const formatMoney = (n) => `$${Number(n).toLocaleString('en-US')}`;

export const formatDate = (value) => {
  const d = value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
