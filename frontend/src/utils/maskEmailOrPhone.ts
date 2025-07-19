export function maskEmailOrPhone(value: string): string {
  if (value.includes("@")) {
    const [name, domain] = value.split("@");
    const maskedName = name.length <= 2
      ? "*".repeat(name.length)
      : name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
    return `${maskedName}@${domain}`;
  }

  if (/^\d{8,15}$/.test(value)) {
    return value.slice(0, 3) + "****" + value.slice(-2);
  }

  return value;
}
