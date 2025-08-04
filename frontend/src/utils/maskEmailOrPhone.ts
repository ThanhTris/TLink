export function maskEmailOrPhone(value: string): string {
  // Email
  if (value.includes("@")) {
    const [name, domain] = value.split("@");

    // Local part: giữ 1 ký tự đầu, che tối đa 6 dấu *
    const maskedName =
      name.length <= 1
        ? "*"
        : name[0] + "*".repeat(Math.min(name.length - 1, 6));

    // Domain: giữ 1 ký tự đầu của domain chính, che tối đa 6 dấu *
    const domainParts = domain.split(".");
    const mainDomain = domainParts[0];
    const maskedMainDomain =
      mainDomain.length <= 1
        ? "*"
        : mainDomain[0] + "*".repeat(Math.min(mainDomain.length - 1, 6));

    const maskedDomain =
      maskedMainDomain + (domainParts.length > 1 ? "." + domainParts.slice(1).join(".") : "");

    return `${maskedName}@${maskedDomain}`;
  }

  // Phone
  if (/^\d{8,15}$/.test(value)) {
    // Giữ 2 số đầu và 2 số cuối, che tối đa 6 dấu *
    const hiddenLength = Math.min(value.length - 4, 6);
    return value.slice(0, 2) + "*".repeat(hiddenLength) + value.slice(-2);
  }

  return value;
}
