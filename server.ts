import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { SendMailClient } from 'zeptomail';

dotenv.config();

// ZeptoMail Client
const zeptoClient = new SendMailClient({
  url: "https://api.zeptomail.com/v1.1/email",
  token: process.env.ZEPTOMAIL_TOKEN || ''
});

// Supabase Admin Client (using service role to bypass RLS for critical tasks)
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Zoho Token Cache
let zohoTokenCache = {
  token: null,
  expiry: 0,
  refreshPromise: null
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Zoho CRM Access Token Helper with Smart Caching
  async function getZohoAccessToken() {
    const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN } = process.env;
    if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) {
      console.warn('Zoho credentials missing');
      return null;
    }

    // Return cached token if valid (with 60s buffer)
    const now = Date.now();
    if (zohoTokenCache.token && zohoTokenCache.expiry > now + 60000) {
      return zohoTokenCache.token;
    }

    // If a refresh is already in progress, wait for it
    if (zohoTokenCache.refreshPromise) {
      return zohoTokenCache.refreshPromise;
    }

    // Start new refresh
    zohoTokenCache.refreshPromise = (async () => {
      try {
        console.log('Refreshing Zoho Access Token...');
        const response = await axios.post(`https://accounts.zoho.com/oauth/v2/token?refresh_token=${ZOHO_REFRESH_TOKEN}&client_id=${ZOHO_CLIENT_ID}&client_secret=${ZOHO_CLIENT_SECRET}&grant_type=refresh_token`);
        
        const { access_token, expires_in } = response.data;
        zohoTokenCache.token = access_token;
        zohoTokenCache.expiry = Date.now() + (expires_in * 1000);
        zohoTokenCache.refreshPromise = null;
        
        return access_token;
      } catch (error) {
        console.error('Zoho Token Refresh Failed:', error.response?.data || error.message);
        zohoTokenCache.refreshPromise = null;
        return null;
      }
    })();

    return zohoTokenCache.refreshPromise;
  }

  // API Routes
  app.post('/api/orders', async (req, res) => {
    const orderData = req.body;
    
    try {
      console.log('Processing order on backend:', orderData.id || 'new');
      
      // Destructure potentially missing columns to avoid "column not found" error if schema is stale in PostgREST cache
      const { created_by, user_id, ...dbOrderData } = orderData;
      
      console.log('Attempting to insert order with keys:', Object.keys(dbOrderData));

      // 1. Create/Update Order in Supabase
      const { data: newOrder, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert(dbOrderData)
        .select()
        .single();
        
      if (orderError) throw orderError;

      // 2. Create/Update Customer Record
      const customerPayload = {
        email: orderData.shipping_email,
        full_name: orderData.shipping_name,
        phone: orderData.shipping_phone,
        address: orderData.shipping_address,
        city: orderData.shipping_city,
        user_id: orderData.user_id || null
      };

      const { data: existingCustomers } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('email', orderData.shipping_email);

      if (existingCustomers && existingCustomers.length > 0) {
        await supabaseAdmin.from('customers').update(customerPayload).eq('id', existingCustomers[0].id);
      } else {
        await supabaseAdmin.from('customers').insert(customerPayload);
      }

      // 3. Sync to Zoho if configured (Async)
      getZohoAccessToken().then(async (token) => {
        if (!token) return;
        
        try {
          // Upsert Contact
          const contactResponse = await axios.post(`${process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com'}/crm/v2/Contacts/upsert`, {
            data: [{
              Email: orderData.shipping_email,
              First_Name: orderData.shipping_name.split(' ')[0],
              Last_Name: orderData.shipping_name.split(' ').slice(1).join(' ') || 'Customer',
              Phone: orderData.shipping_phone,
              Mailing_Street: orderData.shipping_address,
              Mailing_City: orderData.shipping_city,
              Mailing_State: orderData.shipping_state,
              Mailing_Zip: orderData.shipping_zip
            }]
          }, {
            headers: { Authorization: `Zoho-oauthtoken ${token}` }
          });

          const contactId = contactResponse.data.data[0].details.id;

          // Create Sales Order
          await axios.post(`${process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com'}/crm/v2/Sales_Orders`, {
            data: [{
              Subject: `Website Order: ${newOrder.id}`,
              Contact_Name: { id: contactId },
              Grand_Total: newOrder.total,
              Status: 'Created',
              Product_Details: newOrder.items.map(item => ({
                 product: { name: item.product_name },
                 quantity: item.quantity,
                 list_price: item.price
              }))
            }]
          }, {
            headers: { Authorization: `Zoho-oauthtoken ${token}` }
          });
          console.log('Successfully synced to Zoho CRM');
        } catch (err) {
          console.error('Zoho CRM Sync Failed:', err.response?.data || err.message);
        }
      });

      res.status(201).json(newOrder);
    } catch (error) {
      console.error('Order creation failed:', error.message);
      res.status(500).json({ error: 'Failed to create order', message: error.message });
    }
  });

  app.post('/api/zoho/sync-order', async (req, res) => {
    const order = req.body;
    const token = await getZohoAccessToken();

    if (!token) {
      console.warn('Zoho sync skipped: token missing');
      return res.status(500).json({ error: 'Zoho not configured' });
    }

    try {
      // 1. Create or Update Contact in Zoho
      const contactResponse = await axios.post(`${process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com'}/crm/v2/Contacts/upsert`, {
        data: [{
          Email: order.shipping_email,
          First_Name: order.shipping_name.split(' ')[0],
          Last_Name: order.shipping_name.split(' ').slice(1).join(' ') || 'Customer',
          Phone: order.shipping_phone,
          Mailing_Street: order.shipping_address,
          Mailing_City: order.shipping_city,
          Mailing_State: order.shipping_state,
          Mailing_Zip: order.shipping_zip
        }]
      }, {
        headers: { Authorization: `Zoho-oauthtoken ${token}` }
      });

      const contactId = contactResponse.data.data[0].details.id;

      // 2. Create Sale Order in Zoho CRM
      const saleOrderResponse = await axios.post(`${process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com'}/crm/v2/Sales_Orders`, {
        data: [{
          Subject: `Website Order: ${order.id}`,
          Contact_Name: { id: contactId },
          Grand_Total: order.total,
          Status: 'Created',
          Product_Details: order.items.map(item => ({
             product: { name: item.product_name },
             quantity: item.quantity,
             list_price: item.price
          }))
        }]
      }, {
        headers: { Authorization: `Zoho-oauthtoken ${token}` }
      });

      res.json({ success: true, contactId, zohoOrderId: saleOrderResponse.data.data[0].details.id });
    } catch (error) {
      console.error('Zoho Sync Error:', error.response?.data || error.message);
      res.status(500).json({ error: 'Failed to sync with Zoho', details: error.response?.data });
    }
  });

  app.post('/api/zoho/update-status', async (req, res) => {
    const { orderId, status } = req.body;
    const token = await getZohoAccessToken();
    
    // 1. Update in Supabase using Admin Client for guaranteed persistence
    try {
      const { data: order, error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (updateError) throw updateError;

      // 2. Send Email Notification to Customer
      if (order && process.env.ZEPTOMAIL_TOKEN) {
        const friendlyId = order.id.substring(0, 8).toUpperCase();
        
        const statusMap = {
          'processing': { title: 'Order is being processed', text: 'We have started preparing your solar gear.' },
          'shipped': { title: 'Order has been shipped', text: 'Your package is on its way to you!' },
          'delivered': { title: 'Order has been delivered', text: 'Your solar gear has reached its destination.' },
          'cancelled': { title: 'Order has been cancelled', text: 'Your order has been cancelled.' }
        };

        const statusInfo = statusMap[status];
        if (statusInfo) {
          try {
            await zeptoClient.sendMail({
              "from": { "address": "noreply@solargear.co.ke", "name": "Solar Gear" },
              "to": [{ "email_address": { "address": order.shipping_email, "name": order.shipping_name } }],
              "subject": `Order Update: #${friendlyId} is ${status.toUpperCase()}`,
              "htmlbody": `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                  <div style="background-color: #0f172a; padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Solar Gear</h1>
                  </div>
                  <div style="padding: 40px 30px;">
                    <h2 style="font-size: 20px; color: #0f172a; margin-top: 0;">${statusInfo.title}</h2>
                    <p style="font-size: 16px; line-height: 1.6; color: #475569;">
                      Hello ${order.shipping_name},<br><br>
                      We're writing to let you know that your order <strong>#${friendlyId}</strong> has been updated to <strong>${status.toUpperCase()}</strong>.
                    </p>
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin: 25px 0;">
                      <p style="margin: 0; font-size: 14px;"><strong>Status Details:</strong> ${statusInfo.text}</p>
                    </div>
                    <div style="text-align: center; margin-top: 30px;">
                      <a href="https://solargear.co.ke/track-order?orderId=${friendlyId}&email=${order.shipping_email}&auto=true" 
                         style="display: inline-block; background-color: #f59e0b; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                        Track Live Status
                      </a>
                    </div>
                  </div>
                  <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
                    © 2024 Solar Gear. Premium Sustainable Solutions.
                  </div>
                </div>
              `
            });
          } catch (emailErr) {
            console.error('Status Update Email Failed:', emailErr);
          }
        }
      }

      // 3. Sync to Zoho (existing logic)
      if (token) {
        const statusMapping = {
          'pending': 'Draft',
          'processing': 'Approved',
          'shipped': 'Delivered',
          'delivered': 'Delivered',
          'cancelled': 'Cancelled'
        };
        const zohoStatus = statusMapping[status] || 'Draft';

        try {
          const searchResponse = await axios.get(`${process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com'}/crm/v2/Sales_Orders/search?criteria=(Subject:starts_with:Website%20Order:%20${orderId})`, {
            headers: { Authorization: `Zoho-oauthtoken ${token}` }
          });
          if (searchResponse.data.data && searchResponse.data.data.length > 0) {
            const zohoOrderId = searchResponse.data.data[0].id;
            await axios.put(`${process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com'}/crm/v2/Sales_Orders/${zohoOrderId}`, {
              data: [{ Status: zohoStatus }]
            }, {
              headers: { Authorization: `Zoho-oauthtoken ${token}` }
            });
          }
        } catch (error) {
          console.error('Zoho Status Update Error:', error.response?.data || error.message);
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Order status update failed:', error.message);
      res.status(500).json({ error: 'Failed to update status', message: error.message });
    }
  });

  app.post('/api/zoho/lead', async (req, res) => {
    const { name, email, phone, interest, message, source } = req.body;
    const token = await getZohoAccessToken();

    if (!token) {
      console.warn('Zoho lead sync skipped: token missing');
      return res.status(500).json({ error: 'Zoho not configured' });
    }

    try {
      // 1. Upsert Lead in Zoho CRM
      const leadResponse = await axios.post(`${process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com'}/crm/v2/Leads/upsert`, {
        data: [{
          Email: email,
          First_Name: name.split(' ')[0],
          Last_Name: name.split(' ').slice(1).join(' ') || 'Lead',
          Phone: phone,
          Description: `Interest: ${interest}\nLead Source: ${source || 'Website'}\nMessage: ${message}`,
          Lead_Source: source || 'Website',
          Company: 'Prospect'
        }]
      }, {
        headers: { Authorization: `Zoho-oauthtoken ${token}` }
      });

      console.log('Successfully synced lead to Zoho CRM');
      res.json({ success: true, leadId: leadResponse.data.data[0].details?.id });
    } catch (error) {
      console.error('Zoho Lead Sync Error:', error.response?.data || error.message);
      res.status(500).json({ error: 'Failed to sync lead with Zoho', details: error.response?.data });
    }
  });

  app.get('/api/zoho/test', async (req, res) => {
    const token = await getZohoAccessToken();
    if (!token) {
      return res.status(500).json({ 
        success: false, 
        message: 'Zoho not configured. Check ZOHO_CLIENT_ID, SECRET, and REFRESH_TOKEN in environment variables.' 
      });
    }

    try {
      // Test 1: Fetch first 1 contact
      const contactResponse = await axios.get(`${process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com'}/crm/v2/Contacts?per_page=1`, {
        headers: { Authorization: `Zoho-oauthtoken ${token}` }
      });

      res.json({ 
        success: true, 
        message: 'Zoho Connection Successful',
        apiDomain: process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com',
        contactsCount: contactResponse.data.data?.length || 0,
        scopes: 'Contacts, Sales_Orders'
      });
    } catch (error) {
      console.error('Zoho Test Error:', error.response?.data || error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Zoho Connection Failed', 
        details: error.response?.data || error.message 
      });
    }
  });

  // Zoho Mail (Transactional Email via Zoho ZeptoMail)
  app.post('/api/email/send', async (req, res) => {
    const { to, subject, templateData } = req.body;

    if (!process.env.ZEPTOMAIL_TOKEN) {
      console.warn('ZeptoMail skipped: token missing');
      return res.json({ success: false, message: 'ZeptoMail not configured' });
    }

    try {
      const friendlyId = (templateData.orderId || '').substring(0, 8).toUpperCase();
      
      await zeptoClient.sendMail({
        "from": {
          "address": "noreply@solargear.co.ke",
          "name": "Solar Gear"
        },
        "to": [
          {
            "email_address": {
              "address": to,
              "name": templateData.customerName || "Customer"
            }
          }
        ],
        "subject": `Solar Gear Order Confirmation - #${friendlyId}`,
        "htmlbody": `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
            <div style="background-color: #0f172a; padding: 40px 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.025em; font-weight: 700;">Solar Gear</h1>
              <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px;">Premium Solar Energy Solutions</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 40px 30px; border: 1px solid #e2e8f0; border-top: none; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; background-color: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 9999px; font-size: 14px; font-weight: 600;">
                  Order Confirmed
                </div>
                <h2 style="margin: 20px 0 10px 0; font-size: 24px; color: #0f172a;">Thank you for your order!</h2>
                <p style="color: #64748b; font-size: 16px; line-height: 1.5;">We're getting your solar gear ready for delivery. Your order number is <strong>#${friendlyId}</strong>.</p>
              </div>

              <div style="margin-bottom: 30px; border: 1px solid #f1f5f9; border-radius: 8px; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead style="background-color: #f8fafc;">
                    <tr>
                      <th style="text-align: left; padding: 12px 15px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Item</th>
                      <th style="text-align: right; padding: 12px 15px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(templateData.items || []).map(item => {
                      // Handle both string items and object items
                      const isString = typeof item === 'string';
                      const name = isString ? item.split(' x ')[0] : item.product_name;
                      const qty = isString ? item.split(' x ')[1] : item.quantity;
                      const unitPrice = !isString ? item.price : '';

                      return `
                      <tr>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #1e293b;">
                          <div style="font-weight: 600;">${name}</div>
                          <div style="font-size: 12px; color: #64748b;">Qty: ${qty} ${unitPrice ? `· KSh ${unitPrice.toLocaleString()}` : ''}</div>
                        </td>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 14px; font-weight: 600;">
                          ${unitPrice ? `KSh ${(unitPrice * qty).toLocaleString()}` : 'Included'}
                        </td>
                      </tr>
                    `}).join('')}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td style="padding: 15px; font-weight: 700; color: #0f172a; font-size: 16px;">Total</td>
                      <td style="padding: 15px; text-align: right; font-weight: 700; color: #f59e0b; font-size: 20px;">KSh ${templateData.total}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; font-size: 14px;">
                <h4 style="margin: 0 0 10px 0; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px;">Shipping Address</h4>
                <p style="margin: 0; color: #1e293b; line-height: 1.6;">
                  ${templateData.shippingDetails?.name || templateData.customerName}<br>
                  ${templateData.shippingDetails?.address || 'N/A'}<br>
                  ${templateData.shippingDetails?.city || ''}
                </p>
              </div>

              <div style="margin-top: 30px; text-align: center;">
                <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">Need help with your order? Reply to this email or visit our website.</p>
                <a href="https://solargear.co.ke" style="display: inline-block; background-color: #f59e0b; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">Visit Our Store</a>
              </div>
            </div>

            <div style="text-align: center; padding: 30px 20px; color: #94a3b8; font-size: 12px;">
              <p style="margin: 0;">© 2024 Solar Gear. All rights reserved.</p>
              <p style="margin: 5px 0;">Empowering Kenya through Sustainable Energy.</p>
            </div>
          </div>
        `
      });
      console.log(`Email successfully sent to ${to}`);
      res.json({ success: true });
    } catch (error) {
      console.error('ZeptoMail Send Failed:', error);
      res.status(500).json({ success: false, error: 'Failed to send email' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
