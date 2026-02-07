import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface OrderItem {
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  selected_size?: string | null;
  selected_color?: string | null;
  product_image?: string | null;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  total_amount: number;
  payment_status: string;
  payment_id: string;
  order_status: string;
  created_at: string;
  order_items: OrderItem[];
  dispatch_details?: string;
}

interface SiteSettings {
  site_name: string;
  contact_email: string;
  contact_phone: string;
}

export function generateBillHTML(order: Order, siteSettings: SiteSettings, shippingCharge: number = 0): string {
  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const subtotal = order.order_items.reduce((sum, item) => sum + Number(item.subtotal), 0);
  const total = subtotal + shippingCharge;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${order.id}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      padding: 20px;
      background: #ffffff;
    }

    .invoice-container {
      max-width: 210mm;
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: white;
      padding: 20px 30px;
      border: 2px solid #000000;
      box-sizing: border-box;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      border-bottom: 2px solid #000000;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }

    .company-info {
      flex: 1;
    }

    .company-name {
      font-size: 24px;
      font-weight: bold;
      color: #000000;
      margin-bottom: 5px;
    }

    .company-details {
      font-size: 11px;
      color: #333333;
      line-height: 1.5;
    }

    .invoice-title {
      text-align: right;
    }

    .invoice-title h1 {
      font-size: 28px;
      color: #000000;
      margin-bottom: 5px;
    }

    .invoice-number {
      font-size: 12px;
      color: #333333;
      margin-bottom: 5px;
    }

    .order-date {
      font-size: 12px;
      color: #666666;
      margin-top: 5px;
    }

    .product-image {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border: 1px solid #cccccc;
      border-radius: 4px;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    .items-table thead {
      background: #000000;
      color: white;
    }

    .items-table th {
      padding: 10px 8px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .items-table th:last-child,
    .items-table td:last-child {
      text-align: right;
    }

    .items-table tbody tr {
      border-bottom: 1px solid #cccccc;
    }

    .items-table tbody tr:last-child {
      border-bottom: 2px solid #000000;
    }

    .items-table td {
      padding: 10px 8px;
      font-size: 12px;
      color: #333333;
      vertical-align: middle;
    }

    .item-details {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .item-info {
      flex: 1;
    }

    .items-table tbody tr:hover {
      background: #f5f5f5;
    }

    .totals {
      margin-left: auto;
      width: 250px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 12px;
    }

    .total-row.subtotal {
      color: #333333;
      border-bottom: 1px solid #cccccc;
    }

    .total-row.tax {
      color: #333333;
      border-bottom: 1px solid #cccccc;
    }

    .total-row.grand-total {
      background: #000000;
      color: white;
      padding: 12px 15px;
      margin-top: 8px;
      border-radius: 0;
      font-size: 16px;
      font-weight: bold;
    }

    .payment-status {
      display: inline-block;
      padding: 4px 10px;
      border: 2px solid #000000;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 5px;
      background: white;
      color: #000000;
    }

    .payment-status.completed {
      background: #e5e5e5;
      color: #000000;
      border-color: #000000;
    }

    .payment-status.pending {
      background: #f5f5f5;
      color: #333333;
      border-color: #666666;
    }

    .payment-status.failed {
      background: #cccccc;
      color: #000000;
      border-color: #000000;
    }

    .footer {
      margin-top: 20px;
      padding-top: 15px;
      border-top: 2px solid #000000;
      text-align: center;
      font-size: 10px;
      color: #333333;
    }

    .footer p {
      margin-bottom: 3px;
    }

    .thank-you {
      margin-top: 20px;
      text-align: center;
      font-size: 14px;
      color: #000000;
      font-weight: 600;
    }

    .cut-line {
      margin: 20px 0 15px 0;
      border-top: 2px dashed #666666;
      position: relative;
      text-align: center;
    }

    .cut-line::before {
      content: '✂ CUT HERE ✂';
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      padding: 0 12px;
      font-size: 10px;
      color: #000000;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .shipping-labels {
      display: flex;
      gap: 20px;
      margin-top: 15px;
    }

    .label-box {
      flex: 1;
      border: 2px solid #000000;
      padding: 15px;
      background: #ffffff;
    }

    .label-box h3 {
      font-size: 12px;
      color: #000000;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
      font-weight: 700;
      border-bottom: 2px solid #000000;
      padding-bottom: 5px;
    }

    .label-box p {
      font-size: 11px;
      color: #000000;
      line-height: 1.6;
      margin-bottom: 4px;
      font-weight: 600;
    }

    .label-box strong {
      color: #000000;
      font-weight: 700;
    }

    @media print {
      body {
        padding: 0;
        background: white;
      }

      .invoice-container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="company-info">
        <div class="company-name">pixieblooms</div>
        <div class="company-details">
          <p>pixieblooms2512@gmail.com</p>
          <p>${siteSettings.contact_phone}</p>
        </div>
      </div>
      <div class="invoice-title">
        <h1>INVOICE</h1>
        <p class="invoice-number">Order #${order.id.slice(0, 8).toUpperCase()}</p>
        <p class="order-date">${orderDate}</p>
        <div class="payment-status ${order.payment_status}">
          ${order.payment_status}
        </div>
      </div>
    </div>

    ${order.dispatch_details && order.dispatch_details.trim() !== '' ? `
    <div style="background: #e0f2fe; border: 2px solid #0ea5e9; border-radius: 6px; padding: 12px; margin: 15px 0;">
      <h3 style="margin: 0 0 8px 0; color: #0369a1; font-size: 12px;">Dispatch Details</h3>
      <p style="margin: 0; white-space: pre-wrap; color: #334155; font-size: 11px;">${order.dispatch_details}</p>
    </div>
    ` : ''}

    <table class="items-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${order.order_items.map(item => {
          const details = [];
          if (item.selected_size) details.push(`Size: ${item.selected_size}`);
          if (item.selected_color) details.push(`Color: ${item.selected_color}`);
          const detailsText = details.length > 0 ? `<br/><span style="font-size: 10px; color: #666;">${details.join(' • ')}</span>` : '';

          return `
          <tr>
            <td>
              <div class="item-details">
                ${item.product_image ? `<img src="${item.product_image}" alt="${item.product_name}" class="product-image" crossorigin="anonymous" />` : ''}
                <div class="item-info">
                  <strong>${item.product_name}</strong>${detailsText}
                </div>
              </div>
            </td>
            <td>${item.quantity}</td>
            <td>₹${Number(item.product_price).toFixed(2)}</td>
            <td>₹${Number(item.subtotal).toFixed(2)}</td>
          </tr>
        `;
        }).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row subtotal">
        <span>Subtotal</span>
        <span>₹${subtotal.toFixed(2)}</span>
      </div>
      <div class="total-row tax">
        <span>Shipping Charge</span>
        <span>₹${shippingCharge.toFixed(2)}</span>
      </div>
      <div class="total-row grand-total">
        <span>Total Amount</span>
        <span>₹${total.toFixed(2)}</span>
      </div>
    </div>

    <div class="thank-you">
      Thank you for your business!
    </div>

    <div class="cut-line"></div>

    <div class="shipping-labels">
      <div class="label-box">
        <h3>From</h3>
        <p><strong>Pixie Blooms</strong></p>
        <p>Atchukattu Street</p>
        <p>Thiruppathur</p>
        <p>Tamil Nadu</p>
        <p><strong>PIN:</strong> 630211</p>
        <p><strong>Mobile:</strong> ${siteSettings.contact_phone}</p>
      </div>

      <div class="label-box">
        <h3>Ship To</h3>
        <p><strong>${order.customer_name}</strong></p>
        <p>${order.shipping_address.address}</p>
        <p>${order.shipping_address.city}, ${order.shipping_address.state}</p>
        <p><strong>PIN:</strong> ${order.shipping_address.pincode}</p>
        <p><strong>Mobile:</strong> ${order.customer_phone}</p>
      </div>
    </div>

    <div class="footer">
      <p>This is a computer-generated invoice and does not require a signature.</p>
      <p>For any queries, please contact us at pixieblooms2512@gmail.com</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

async function createBillElement(order: Order, siteSettings: SiteSettings, shippingCharge: number = 0): Promise<HTMLDivElement> {
  const billHTML = generateBillHTML(order, siteSettings, shippingCharge);

  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '0';
  tempDiv.innerHTML = billHTML;
  document.body.appendChild(tempDiv);

  return tempDiv;
}

export async function downloadBillAsPDF(order: Order, siteSettings: SiteSettings, shippingCharge: number = 0): Promise<void> {
  try {
    const tempDiv = await createBillElement(order, siteSettings, shippingCharge);
    const invoiceContainer = tempDiv.querySelector('.invoice-container') as HTMLElement;

    if (!invoiceContainer) {
      throw new Error('Invoice container not found');
    }

    const canvas = await html2canvas(invoiceContainer, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`invoice-${order.id.slice(0, 8)}.pdf`);

    document.body.removeChild(tempDiv);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
}

export async function downloadBillAsJPG(order: Order, siteSettings: SiteSettings, shippingCharge: number = 0): Promise<void> {
  try {
    const tempDiv = await createBillElement(order, siteSettings, shippingCharge);
    const invoiceContainer = tempDiv.querySelector('.invoice-container') as HTMLElement;

    if (!invoiceContainer) {
      throw new Error('Invoice container not found');
    }

    const canvas = await html2canvas(invoiceContainer, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${order.id.slice(0, 8)}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      document.body.removeChild(tempDiv);
    }, 'image/jpeg', 0.95);
  } catch (error) {
    console.error('Error generating JPG:', error);
    alert('Failed to generate JPG. Please try again.');
  }
}

export function printBill(order: Order, siteSettings: SiteSettings, shippingCharge: number = 0): void {
  const billHTML = generateBillHTML(order, siteSettings, shippingCharge);

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(billHTML);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }
}
