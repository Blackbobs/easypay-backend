import crypto from "crypto";

const generatePaymentReference = (departmentCode: string) => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `DEPT${departmentCode}-${date}-${random}`;
};
export default generatePaymentReference;
