import { ITransaction } from "#interface/transaction.js";
import nodemailer from "nodemailer";

import { formatCurrency } from "./format-currency";
import { buildReceiptHtml } from "./receipt";

const transporter = nodemailer.createTransport({
  auth: {
    pass: process.env.NODEMAILER_PASS,
    user: process.env.NODEMAILER_USER,
  },
  host:"smtp.gmail.com",  
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, 
});

export const sendMail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: `"EasyPay" <${process.env.SMTP_USER ?? "no-reply@easypay.com"}>`,
    html,
    subject,
    to,
  });
};

export const sendReceipt = async (userEmail: string, transaction: ITransaction) => {
  const receiptData = {
    amount: formatCurrency(transaction.amount), // convert number → formatted string
    college: transaction.college,
    date:new Date(transaction.createdAt).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
        })
        ,
        department: transaction.department,
        dueType: transaction.dueType,
        email: userEmail,
        fullName: transaction.fullName,
    reference: transaction.reference,
    status: transaction.status,
  };

  const html = buildReceiptHtml(receiptData);

  await transporter.sendMail({
    from: `"EasyPay" <${process.env.SMTP_USER ?? "no-reply@easypay.com"}>`,
    html, 
    subject: "Your Payment Receipt",
    to: userEmail,
  });
};


export const failedMail = async (
  userEmail: string,
  transaction: ITransaction
) => {
  const failedData = {
    amount: formatCurrency(transaction.amount),
    college: transaction.college,
    date: new Date(transaction.createdAt).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    department: transaction.department,
    dueType: transaction.dueType,
    email: userEmail,
    fullName: transaction.fullName,
    receiptName: transaction.receiptName,
    reference: transaction.reference,
    status: "Failed",
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #d9534f;">Payment Failed</h2>
      <p>Hello ${failedData.fullName},</p>
      <p>Unfortunately, your payment could not be processed.</p>
      <p><strong>Reference:</strong> ${failedData.reference}</p>
      <p><strong>Amount:</strong> ${failedData.amount}</p>
      <p><strong>Due Type:</strong> ${failedData.dueType}</p>
      <p><strong>College:</strong> ${failedData.college}</p>
      <p><strong>Department:</strong> ${failedData.department}</p>
      <p><strong>Date:</strong> ${failedData.date}</p>
      <p>If this issue persists, please contact support.</p>
    </div>
  `;

  await sendMail(userEmail, "Payment Failed - EasyPay", html);
};