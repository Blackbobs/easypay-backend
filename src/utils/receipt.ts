
export const buildReceiptHtml = (payload: {
  college?: string;
  date: string;
  dueType?: string;
  email?: string;
  fullName?: string;
  receiptName?: string;
  reference: string;
  status?: string;
}) => {
  return `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width"/>
      <title>Receipt</title>
    </head>
    <body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#f4f6f8;">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding:24px;">
            <table cellpadding="0" cellspacing="0" width="600" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="padding:20px 24px; text-align:left; background:linear-gradient(90deg,#0ea5e9,#7c3aed); color:#fff;">
                  <h1 style="margin:0; font-size:20px; font-weight:700;">EasyPay Receipt</h1>
                  <p style="margin:4px 0 0; font-size:12px; opacity:0.95;">Official payment receipt</p>
                  <p><strong>Receipt Name:</strong> ${payload.receiptName ?? "-"}</p>
                </td>
              </tr>
  
              <!-- Body -->
              <tr>
                <td style="padding:20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding-bottom:12px;">
                        <strong>Receipt #: </strong> <span>${payload.reference}</span><br/>
                        <strong>Date: </strong> <span>${payload.date}</span>
                      </td>
                      <td style="text-align:right; padding-bottom:12px;">
                        <small style="color:#6b7280; display:block;">Status: ${payload.status ?? "Successful"}</small>
                      </td>
                    </tr>
  
                    <tr>
                      <td colspan="2" style="padding:12px 0;">
                        <strong>Billed To</strong>
                        <div style="margin-top:6px; padding:12px; border-radius:6px; background:#fafafa; border:1px solid #f1f5f9;">
                          <div style="font-weight:600;">${payload.fullName ?? "-"}</div>
                          <div style="font-size:13px; color:#6b7280;">${payload.email ?? "-"}</div>
                        </div>
                      </td>
                    </tr>
  
                    <tr>
                      <td colspan="2" style="padding-top:16px;">
                        <strong>Transaction Details</strong>
                        <table cellpadding="0" cellspacing="0" width="100%" style="margin-top:8px; border-collapse:collapse;">
                          <tr>
                            <td style="padding:8px 6px; border:1px solid #eef2f7; font-size:13px; width:40%;">Due Type</td>
                            <td style="padding:8px 6px; border:1px solid #eef2f7; font-size:13px;">${payload.dueType ?? "-"}</td>
                          </tr>
                          <tr>
                            <td style="padding:8px 6px; border:1px solid #eef2f7; font-size:13px;">College</td>
                            <td style="padding:8px 6px; border:1px solid #eef2f7; font-size:13px;">${payload.college ?? "-"}</td>
                          </tr>
                          <tr>
                            <td style="padding:8px 6px; border:1px solid #eef2f7; font-size:13px;">Department</td>
            
                          </tr>
                        </table>
                      </td>
                    </tr>
  
                    <tr>
                      <td colspan="2" style="padding-top:18px; color:#374151;">
                        <p style="margin:0; font-size:13px;">If you have any questions about this receipt, please contact <a href="mailto:support@easypay.com">support@easypay.com</a>.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
  
              <!-- Footer -->
              <tr>
                <td style="padding:16px 24px; background:#f8fafc; text-align:center; font-size:12px; color:#6b7280;">
                  <div>© ${String(new Date().getFullYear())} EasyPay. All rights reserved.</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
};
