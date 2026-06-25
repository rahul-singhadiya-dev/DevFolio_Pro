// src/utils/formatDate.js

export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const defaultOptions = { year: 'numeric', month: 'long', ...options };
  return date.toLocaleDateString('en-US', defaultOptions);
};

export const formatDuration = (startDate, endDate, isCurrent) => {
  const start = formatDate(startDate, { month: 'short', year: 'numeric' });
  if (isCurrent) {
    return `${start} — Present`;
  }
  const end = formatDate(endDate, { month: 'short', year: 'numeric' });
  return `${start} — ${end}`;
};
