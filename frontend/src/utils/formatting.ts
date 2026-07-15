export function formatTokenAmount(
  amount: number | bigint | string,
  decimals: number = 6,
  options?: Intl.NumberFormatOptions
): string {
  const num = typeof amount === 'bigint' 
    ? Number(amount) 
    : typeof amount === 'string' 
      ? parseFloat(amount) 
      : amount;

  const divisor = Math.pow(10, decimals);
  const formatted = num / divisor;

  return formatted.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
    ...options,
  });
}

export function toContractAmount(amount: number | string, decimals: number = 6): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return Math.floor(num * Math.pow(10, decimals)).toString();
}

export function formatAddress(address: string, prefix: number = 6, suffix: number = 4): string {
  if (address.length <= prefix + suffix) {
    return address;
  }
  return `${address.slice(0, prefix)}...${address.slice(-suffix)}`;
}

export function formatBasisPoints(basisPoints: number): string {
  return `${(basisPoints / 100).toFixed(2)}%`;
}

export function formatCompactNumber(num: number | string): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;

  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(2) + 'K';

  return n.toFixed(2);
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.length > 0 ? parts.join(' ') : '< 1m';
}

export default {
  formatTokenAmount,
  toContractAmount,
  formatAddress,
  formatBasisPoints,
  formatCompactNumber,
  formatDate,
  formatDuration,
};
