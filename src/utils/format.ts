export const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A";
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
};

export const formatCurrency = (amount: number | undefined | null): string => {
  const val = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
};

export const getCurrentMonthString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export const formatMonthYear = (monthStr: string): string => {
  if (!monthStr || !monthStr.includes("-")) return monthStr || "";
  const [yearStr, monthNumStr] = monthStr.split("-");
  const date = new Date(parseInt(yearStr, 10), parseInt(monthNumStr, 10) - 1, 1);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
};

export const formatShortMonthYear = (monthStr: string): string => {
  if (!monthStr || !monthStr.includes("-")) return monthStr || "";
  const [yearStr, monthNumStr] = monthStr.split("-");
  const date = new Date(parseInt(yearStr, 10), parseInt(monthNumStr, 10) - 1, 1);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
};

export const getOffsetMonthString = (monthStr: string, offset: number): string => {
  const [yearStr, monthNumStr] = monthStr.split("-");
  const date = new Date(parseInt(yearStr, 10), parseInt(monthNumStr, 10) - 1 + offset, 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};
