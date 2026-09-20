export const formatMoney = (value: number | string | null | undefined) =>
  Number(value ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
