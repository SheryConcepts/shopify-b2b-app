export function limitString(str: string, maxLength: number): string {
  // Check if the string is already within the limit
  if (str.length <= maxLength) {
    return str;
  }

  // Truncate the string using substring and add an ellipsis (...)
  return str.substring(0, maxLength) + "...";
}
