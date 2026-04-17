export const stripPhoneNumber = (value: string) => value.replace(/\D/g, '');

export const formatPhoneNumber = (value: string) => {
  const digits = stripPhoneNumber(value).slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};
