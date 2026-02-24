# Custom Domain Setup Guide - quantistechnologies.co.zw

This guide will walk you through setting up your custom domain `quantistechnologies.co.zw` with the provided nameservers.

## 📋 Prerequisites

- Domain: `quantistechnologies.co.zw`
- Nameservers:
  - ns5.mydata.city
  - ns6.mydata.city
- Vercel account (for frontend)
- Render account (for backend) OR Vercel (for backend)

---

## 🚀 Quick Reference: DNS Configuration Options

### Option A: Use Vercel Nameservers (Simpler, but less control)

**Update nameservers at domain registrar to:**
- `ns1.vercel-dns.com`
- `ns2.vercel-dns.com`

**Pros:** Vercel manages all DNS automatically  
**Cons:** Less control, need to configure Render API subdomain separately

### Option B: Use Custom Nameservers (Recommended - Current Setup)

**Keep mydata.city nameservers and add these DNS records:**

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| A | @ | `216.198.79.1` | Root domain → Vercel |
| CNAME | www | `ab64489d90636882.vercel-dns-017.com.` | WWW → Vercel |
| CNAME | api | `grinite-tech.onrender.com` | API → Render |
| MX | @ | `mail.quantistechnologies.co.zw` | Email (already configured) |
| TXT | @ | `v=spf1 a mx include:relay.outboundspamprotection.com -all` | SPF (already configured) |

**Pros:** Full control, all DNS in one place (mydata.city)  
**Cons:** Manual DNS record management

**Current Status:**
- ✅ Nameservers: Configured and authoritative (ns5.mydata.city, ns6.mydata.city)
- ⚠️ Vercel domains: Invalid Configuration (choose Option A or B above)
- ⚠️ Render domain: DNS update needed to verify

---

## 🔧 Step 1: Configure Nameservers at Domain Registrar

### At Your Domain Registrar (e.g., ZOL, ZimNames, etc.)

1. **Log in** to your domain registrar account
2. **Navigate** to DNS Management or Nameserver Settings
3. **Update Nameservers** to:
   ```
   ns5.mydata.city
   ns6.mydata.city
   ```
4. **Save** the changes
5. **Wait** 24-48 hours for DNS propagation (usually takes 1-4 hours)

**Note:** DNS changes can take up to 48 hours to fully propagate globally.

---

## 🌐 Step 2: Configure DNS Records at mydata.city

After nameservers are updated, configure DNS records at your DNS provider (mydata.city):

> **⚠️ Important for Render:** When adding DNS records for the `api` subdomain, do NOT add AAAA records. Render uses IPv4 only, and AAAA records (IPv6) can cause unexpected behavior. Only use A or CNAME records for the api subdomain.

### Required DNS Records:

#### For Frontend (Main Website):
```
Type: A Record
Name: @ (or quantistechnologies.co.zw)
Value: 216.198.79.1
TTL: 3600

Type: CNAME Record
Name: www
Value: ab64489d90636882.vercel-dns-017.com.
TTL: 3600
```

**Note:** Vercel has expanded their IP range. The new A record value is `216.198.79.1`. Old records (`cname.vercel-dns.com` and `76.76.21.21`) will continue to work, but the new values are recommended.

**Current Vercel Status:**
- `quantistechnologies.co.zw`: ⚠️ Invalid Configuration (DNS update needed)
- `www.quantistechnologies.co.zw`: ⚠️ Invalid Configuration (DNS update needed)
- Root domain redirects to www (307 redirect)

#### For Backend API (Subdomain):
```
Type: CNAME Record
Name: api
Value: grinite-tech.onrender.com
TTL: 3600
```

**Current Render Status:**
- `api.quantistechnologies.co.zw`: ⚠️ DNS update needed to verify domain ownership
- Render service subdomain: `https://grinite-tech.onrender.com` (enabled)
- **Action Required:** Add CNAME record for `api` pointing to `grinite-tech.onrender.com`, then click "Verify" in Render Dashboard

#### Email Records (Currently Configured):
```
Type: MX Record
Name: @
Value: mail.quantistechnologies.co.zw
Priority: 10
TTL: 3600

Type: TXT Record (SPF)
Name: @
Value: v=spf1 a mx include:relay.outboundspamprotection.com -all
TTL: 3600
```

---

## 🚀 Step 3: Configure Domain in Vercel (Frontend)

### 3.1 Add Domain to Vercel Project

1. **Go to** [Vercel Dashboard](https://vercel.com/dashboard)
2. **Select** your frontend project (`granite-tech-frontend` or `quantis-tech-frontend`)
3. **Navigate** to **Settings** → **Domains**
4. **Click** "Add Domain"
5. **Enter** `quantistechnologies.co.zw`
6. **Click** "Add"
7. **Also add** `www.quantistechnologies.co.zw` (Vercel will handle redirect)

**Note:** After adding domains, you'll see two tabs:
- **"Vercel DNS" tab** (default): Shows nameservers to use if you want Vercel to manage DNS
- **"DNS Records" tab**: Shows individual DNS records if you want to use custom nameservers (mydata.city)

### 3.2 Configure DNS in Vercel

**Current Status:** Both domains show "Invalid Configuration" - DNS configuration is pending.

Vercel provides two options for DNS configuration. The dashboard shows **Option A (Vercel Nameservers)** as the recommended approach:

#### Option A: Use Vercel's Nameservers (Recommended - Currently Shown in Dashboard)

**Vercel Nameservers (from Dashboard):**
- `ns1.vercel-dns.com`
- `ns2.vercel-dns.com`

**Steps:**
1. **Copy the nameservers** from Vercel Dashboard (use the clipboard icon next to each)
2. **Log in to your domain registrar** (ZISPA)
3. **Update nameservers** to:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
4. **Save** the changes
5. **Wait 24-48 hours** for nameserver propagation (usually 1-4 hours)
6. **Vercel will automatically:**
   - Manage all DNS records
   - Provision SSL certificates
   - Verify domain ownership

**Note:** When using Vercel nameservers, you won't need to manually configure DNS records at mydata.city for the frontend domains. However, you'll still need to configure the `api` subdomain for Render at mydata.city.

#### Option B: Use Custom Nameservers (Current Setup - mydata.city)

If you prefer to keep using mydata.city nameservers, switch to the "DNS Records" tab in Vercel Dashboard and use these records:

**Required DNS Records (from Vercel Dashboard - DNS Records tab):**

1. **Root Domain (`quantistechnologies.co.zw`):**
   - Type: `A Record`
   - Name: `@` (or `quantistechnologies.co.zw`)
   - Value: `216.198.79.1`
   - TTL: `3600`

2. **WWW Subdomain (`www.quantistechnologies.co.zw`):**
   - Type: `CNAME Record`
   - Name: `www`
   - Value: `ab64489d90636882.vercel-dns-017.com.`
   - TTL: `3600`

**Important Notes:**
- Vercel has expanded their IP range. The new A record value is `216.198.79.1`
- Old records (`cname.vercel-dns.com` and `76.76.21.21`) will continue to work but new values are recommended
- The root domain automatically redirects to www (307 redirect)
- After adding DNS records, wait for propagation (usually 5-10 minutes) and Vercel will automatically verify

**Recommendation:** Since you're already using mydata.city nameservers for email and other services, **Option B (Custom Nameservers)** is recommended to maintain control over all DNS records in one place.

### 3.3 Update Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```bash
NEXT_PUBLIC_API_URL=https://api.quantistechnologies.co.zw/api/v1
NEXT_PUBLIC_SITE_URL=https://quantistechnologies.co.zw
```

### 3.4 SSL Certificate

- Vercel **automatically provisions** SSL certificates via Let's Encrypt
- SSL will be active within **5-10 minutes** after DNS is configured
- Force HTTPS redirect is enabled by default

---

## 🔧 Step 4: Configure Domain in Render (Backend)

> **Important:** Hobby workspaces support a maximum of two custom domains across all services. Professional workspaces and higher support unlimited custom domains.

> **🔍 Quick Clarification:**
> 
> **What Render is asking for:**
> - Create a CNAME record: `api` → `grinite-tech.onrender.com`
> 
> **What this means:**
> - `grinite-tech.onrender.com` is Render's service URL (already exists, don't add it as a record)
> - You're creating a CNAME that makes `api.quantistechnologies.co.zw` point to it
> - Think of it as: "When someone visits `api.quantistechnologies.co.zw`, redirect them to `grinite-tech.onrender.com`"

### 4.1 Add Custom Domain to Render Service

1. **Go to** [Render Dashboard](https://dashboard.render.com)
2. **Select** your backend service (web service or static site)
3. **Navigate** to **Settings** → **Custom Domains** section
4. **Click** "+ Add Custom Domain"
5. **Enter** `api.quantistechnologies.co.zw`
6. **Click** "Save"

**Important Notes:**
- Your domain will appear in the list, but **it does not yet point to your service!** You must configure DNS next.
- Render automatically creates and renews TLS certificates for all custom domains
- All HTTP traffic to a custom domain is automatically redirected to HTTPS
- Services with a custom domain also keep their `onrender.com` subdomain (unless disabled)

### 4.2 Configure DNS for Render

> **⚠️ Important:** Remove any `AAAA` records from your domain while configuring DNS. Render uses IPv4 only, and AAAA records (IPv6) can cause unexpected behavior.

> **📝 Understanding the CNAME Record:**
> 
> **Common Misunderstanding:** You don't add `grinite-tech.onrender.com` as a DNS record itself. Instead, you create a CNAME record that points your `api` subdomain TO `grinite-tech.onrender.com`.
> 
> **What `grinite-tech.onrender.com` is:**
> - This is Render's default subdomain for your service (already exists and works)
> - It's the **target** that your custom domain will point to
> - You can verify it works by visiting: `https://grinite-tech.onrender.com`
> 
> **What you need to add:**
> - A CNAME record for `api.quantistechnologies.co.zw` that points to `grinite-tech.onrender.com`
> - This tells DNS: "When someone visits `api.quantistechnologies.co.zw`, send them to `grinite-tech.onrender.com`"

1. **Log in** to your DNS provider (mydata.city)
2. **Navigate** to DNS settings for `quantistechnologies.co.zw`
3. **Add a CNAME record** with these exact values:

**Required DNS Record (from Render Dashboard):**
```
Type: CNAME Record
Name: api (or api.quantistechnologies.co.zw - depends on your DNS provider)
Value/Target: grinite-tech.onrender.com
TTL: 3600
```

**Step-by-Step at mydata.city:**
1. Click "Add Record" or "Create Record"
2. Select record type: **CNAME**
3. Enter name/host: **`api`** (some providers may require the full `api.quantistechnologies.co.zw`)
4. Enter value/target: **`grinite-tech.onrender.com`** (copy from Render dashboard)
5. Set TTL: **3600** (or use default)
6. Save the record

**Current Status:**
- Domain added: `api.quantistechnologies.co.zw`
- Status: ⚠️ "DNS update needed to verify domain ownership"
- Render service: `grinite-tech.onrender.com` (this is the target, not a record to add)
- Render subdomain: Enabled (service accessible at `https://grinite-tech.onrender.com`)

**Verification:**
After adding the CNAME record, you can verify it's working:
```bash
# Check CNAME record
nslookup api.quantistechnologies.co.zw
# Should show: api.quantistechnologies.co.zw canonical name = grinite-tech.onrender.com

# Or use dig
dig api.quantistechnologies.co.zw CNAME
# Should show: api.quantistechnologies.co.zw. IN CNAME grinite-tech.onrender.com.
```

4. **Remove any existing AAAA records** for the api subdomain
5. **Save** the DNS changes

### 4.3 Verify Your Domain in Render

1. **Return** to your service's *Custom Domains* settings in the Render Dashboard
2. **Click** the "Verify" button next to `api.quantistechnologies.co.zw`
   - If verification fails, wait a few minutes for DNS propagation and try again
   - See [Speeding up domain verification](#speeding-up-domain-verification) below
3. **When verification succeeds:**
   - Render issues a TLS certificate for your domain
   - Verification status updates to show success
4. **Test** your domain:
   - Visit `https://api.quantistechnologies.co.zw/api/v1/health` in a browser
   - If you see a *502 Bad Gateway* error, wait a few minutes for routing rules to update
   - When your domain loads successfully, you're good to go!

### 4.4 Speeding up Domain Verification

After updating DNS records, clear cached entries in public DNS servers to speed up verification:

- [Flush Google Public DNS Cache](https://developers.google.com/speed/public-dns/cache)
- [Purge Cloudflare Public DNS Cache](https://1.1.1.1/purge-cache/)
- [Refresh OpenDNS Cache](https://cachecheck.opendns.com/)

This is especially important if you're updating nameservers for your domain.

### 4.5 Update Environment Variables in Render

In Render Dashboard → Environment:

```bash
FRONTEND_URL=https://quantistechnologies.co.zw
ALLOWED_ORIGINS=https://quantistechnologies.co.zw,https://www.quantistechnologies.co.zw
NODE_ENV=production
```

### 4.6 Disable Render Subdomain (Optional)

If you want your service to be reachable exclusively at your custom domain:

1. In your service's **Settings** → **Custom Domains** section
2. **Toggle** the "Render Subdomain" setting to "Disabled" and confirm
3. After disabling, all requests to the `onrender.com` subdomain receive a 404 response
4. You can re-enable the subdomain at any time

### 4.7 CAA Records (If Applicable)

> Only needed if your domain already defines CAA records.

If your custom domain defines CAA records, make sure to include records for Render's certificate authorities:

```
api.quantistechnologies.co.zw IN CAA 0 issue "letsencrypt.org"
api.quantistechnologies.co.zw IN CAA 0 issue "pki.goog; cansignhttpexchanges=yes"
```

If using wildcard domains, also add `issuewild` records:

```
*.quantistechnologies.co.zw IN CAA 0 issuewild "letsencrypt.org"
*.quantistechnologies.co.zw IN CAA 0 issuewild "pki.goog; cansignhttpexchanges=yes"
```

---

## 🔄 Step 5: Update Application Code

### 5.1 Update Backend CORS Configuration

Update `backend/src/config/cors.config.ts`:

```typescript
const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://quantistechnologies.co.zw',
  'https://www.quantistechnologies.co.zw',
  'https://api.quantistechnologies.co.zw',
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_SITE_URL
].filter(Boolean) as string[];
```

### 5.2 Update Frontend API Configuration

Update `frontend/src/lib/api.ts`:

```typescript
const api = axios.create({ 
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.quantistechnologies.co.zw/api/v1',
  headers: {
    'Content-Type': 'application/json',
  }
})
```

### 5.3 Update Email Service

Update `backend/src/email/email.service.ts` to use the new domain in email templates:

```typescript
// Update email footer links
📧 info@quantistechnologies.co.zw | 🌐 www.quantistechnologies.co.zw
```

### 5.4 Update Documentation

Update all documentation files that reference old domains:
- `VERCEL_DEPLOYMENT.md`
- `ENVIRONMENT_CONFIG.md`
- `FRONTEND_ENV_SETUP.md`
- `RENDER_DEPLOYMENT_BACKEND.md`

---

## ✅ Step 6: Verify DNS Configuration

### Current DNS Status (Verified)

**Nameservers (Registered at ZISPA):**
- ns5.mydata.city (Authoritative - SOA S/N 2025121200)
- ns6.mydata.city (Authoritative - SOA S/N 2025121200)
- ✅ All nameservers are authoritative and serial numbers match

**Current DNS Records (as of 2025-12-12):**
```
quantistechnologies.co.zw. 3600 IN A     152.53.85.199
quantistechnologies.co.zw. 3600 IN AAAA 2a0a:4cc0:c0:2253::199
quantistechnologies.co.zw. 3600 IN MX   10 mail.quantistechnologies.co.zw
quantistechnologies.co.zw. 3600 IN TXT  "v=spf1 a mx include:relay.outboundspamprotection.com -all"
quantistechnologies.co.zw. 3600 IN NS   ns5.mydata.city
quantistechnologies.co.zw. 3600 IN NS   ns6.mydata.city
```

**Current Hostname Mappings:**
- `www.quantistechnologies.co.zw` → 152.53.85.199 (⚠️ Update to `ab64489d90636882.vercel-dns-017.com.` CNAME)
- `mail.quantistechnologies.co.zw` → 152.53.85.199 (✅ Email server - keep as is)
- `quantistechnologies.co.zw` → 152.53.85.199 (⚠️ Update to `216.198.79.1` A record)
- `api.quantistechnologies.co.zw` → (❌ Not configured - add CNAME to `grinite-tech.onrender.com`)

**Required DNS Updates:**
1. **Root Domain A Record:** Change from `152.53.85.199` to `216.198.79.1` (Vercel)
   - ⚠️ **Note:** The current A record (`152.53.85.199`) also serves the mail server
   - ✅ **Solution:** Ensure `mail.quantistechnologies.co.zw` has its own A record pointing to `152.53.85.199` (should already exist)
2. **WWW CNAME Record:** Add/Update to `ab64489d90636882.vercel-dns-017.com.` (Vercel)
3. **API CNAME Record:** Add new record pointing to `grinite-tech.onrender.com` (Render)

**Note:** The current A record (152.53.85.199) points to the mail server. When updating:

1. **Update root domain A record:** Change from `152.53.85.199` to `216.198.79.1` (Vercel)
   - **Important:** Before changing, verify that `mail.quantistechnologies.co.zw` has its own A record pointing to `152.53.85.199` to ensure email continues working
2. **Add/Update www CNAME:** Set to `ab64489d90636882.vercel-dns-017.com.` (Vercel)
3. **Add api CNAME:** Create new record pointing to `grinite-tech.onrender.com` (Render)
4. **Important for Render:** Do NOT add AAAA records for the api subdomain - Render uses IPv4 only and AAAA records can cause issues

**Dashboard Status Summary:**
- **Vercel:** Both domains show "Invalid Configuration"
  - Dashboard currently shows "Vercel DNS" tab with nameservers: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`
  - Can switch to "DNS Records" tab for custom nameserver option
  - Choose either nameserver approach or DNS records approach
- **Render:** Domain added but verification pending - waiting for CNAME record

### Next Steps (Choose Your Approach)

#### If Using Option A: Vercel Nameservers

1. **Copy nameservers from Vercel Dashboard:**
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
2. **Update nameservers at domain registrar (ZISPA)**
3. **Wait 24-48 hours** for propagation
4. **Vercel will automatically configure DNS**
5. **Still need to add API CNAME at mydata.city** (if you switch back to mydata.city nameservers) OR configure at Vercel DNS

#### If Using Option B: Custom Nameservers (Recommended)

1. **Log in to mydata.city DNS panel**
2. **Update Root Domain A Record:**
   - Find existing A record for `@` (currently `152.53.85.199`)
   - Change value to `216.198.79.1`
   - Verify `mail.quantistechnologies.co.zw` has its own A record to `152.53.85.199` (for email)
3. **Add/Update WWW CNAME Record:**
   - Add or update CNAME record for `www`
   - Set value to `ab64489d90636882.vercel-dns-017.com.`
4. **Add API CNAME Record:**
   - Add new CNAME record for `api`
   - Set value to `grinite-tech.onrender.com`
5. **Wait 5-10 minutes** for DNS propagation
6. **Verify in Vercel Dashboard:**
   - Go to Settings → Domains
   - Switch to "DNS Records" tab to see required records
   - Status should change from "Invalid Configuration" to "Valid"
   - SSL certificate will be automatically provisioned
7. **Verify in Render Dashboard:**
   - Go to Settings → Custom Domains
   - Click "Verify" button next to `api.quantistechnologies.co.zw`
   - Status should change to verified
   - TLS certificate will be automatically provisioned

**Current AAAA Record Note:**
- The existing AAAA record (2a0a:4cc0:c0:2253::199) is for the root domain and mail server
- This is fine to keep for email services
- When adding the api subdomain for Render, use only A or CNAME records (no AAAA)

### Check DNS Propagation

Use these tools to verify DNS is working:

1. **DNS Checker:** https://dnschecker.org
   - Enter `quantistechnologies.co.zw`
   - Check A records globally

2. **SSL Checker:** https://www.ssllabs.com/ssltest/
   - Verify SSL certificate is active

3. **Test from Command Line:**
   ```bash
   # Check A record
   nslookup quantistechnologies.co.zw
   
   # Check API subdomain
   nslookup api.quantistechnologies.co.zw
   
   # Check DNS records
   dig quantistechnologies.co.zw
   ```

---

## 🧪 Step 7: Test Your Setup

### 7.1 Test Frontend

1. **Visit:** https://quantistechnologies.co.zw
2. **Verify:** Site loads correctly
3. **Check:** SSL certificate is valid (green padlock)
4. **Test:** www redirect works (www.quantistechnologies.co.zw → quantistechnologies.co.zw)

### 7.2 Test Backend API

1. **Visit:** https://api.quantistechnologies.co.zw/api/v1/health
2. **Expected Response:**
   ```json
   {
     "status": "OK",
     "message": "Quantis Technologies API is running"
   }
   ```

### 7.3 Test CORS

1. **Open Browser Console** on https://quantistechnologies.co.zw
2. **Make API Request:**
   ```javascript
   fetch('https://api.quantistechnologies.co.zw/api/v1/health')
     .then(r => r.json())
     .then(console.log)
   ```
3. **Verify:** No CORS errors

---

## 🔐 Step 8: Security Best Practices

### 8.1 Force HTTPS

Both Vercel and Render force HTTPS by default. Verify:

- **Vercel:** Settings → Domains → Force HTTPS (enabled)
- **Render:** Settings → Force HTTPS (enabled)

### 8.2 Security Headers

Add security headers in `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}
```

### 8.3 Update CSP (Content Security Policy)

If using CSP, update to allow your new domain:

```
Content-Security-Policy: default-src 'self' https://quantistechnologies.co.zw https://api.quantistechnologies.co.zw
```

---

## 📝 Step 9: Update Environment Variables Summary

### Vercel (Frontend) Environment Variables:

```bash
NEXT_PUBLIC_API_URL=https://api.quantistechnologies.co.zw/api/v1
NEXT_PUBLIC_SITE_URL=https://quantistechnologies.co.zw
NODE_ENV=production
```

### Render (Backend) Environment Variables:

```bash
FRONTEND_URL=https://quantistechnologies.co.zw
ALLOWED_ORIGINS=https://quantistechnologies.co.zw,https://www.quantistechnologies.co.zw
NODE_ENV=production
DATABASE_URL=[your-database-url]
JWT_SECRET=[your-jwt-secret]
```

---

## 🐛 Troubleshooting

### Issue: Domain not resolving

**Solution:**
1. Check DNS propagation: https://dnschecker.org
2. Verify nameservers are correct at registrar
3. Wait 24-48 hours for full propagation
4. Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)

### Issue: SSL certificate not working

**Solution:**
1. Verify DNS A/CNAME records are correct
2. Wait 5-10 minutes after DNS is configured
3. Check SSL status in Vercel/Render dashboard
4. Force SSL renewal if needed

### Issue: CORS errors

**Solution:**
1. Verify `ALLOWED_ORIGINS` includes your domain
2. Check backend CORS configuration
3. Ensure frontend URL matches exactly (including https://)
4. Check browser console for exact error

### Issue: API not accessible

**Solution:**
1. Verify `api.quantistechnologies.co.zw` DNS record is correct
2. **Remove any AAAA records** for the api subdomain (Render uses IPv4 only)
3. Check Render service is running
4. Verify environment variables are set
5. Verify domain in Render Dashboard (click "Verify" button)
6. Wait a few minutes after DNS changes for propagation
7. Test API endpoint directly: `curl https://api.quantistechnologies.co.zw/api/v1/health`

### Issue: Domain verification fails in Render

**Solution:**
1. Wait 5-10 minutes after DNS changes for propagation
2. Clear public DNS caches (Google, Cloudflare, OpenDNS)
3. Verify DNS records are correct (use `dig api.quantistechnologies.co.zw CNAME`)
4. Ensure no AAAA records exist for the api subdomain
5. Check that CNAME record points to correct Render service subdomain (`grinite-tech.onrender.com`)
6. Try verification again after waiting

### Issue: Confusion about "grinite-tech.onrender.com already added"

**Common Misunderstanding:**
- ❌ **Wrong:** Adding `grinite-tech.onrender.com` as a DNS record itself
- ✅ **Correct:** Adding a CNAME record where `api` points TO `grinite-tech.onrender.com`

**What to do:**
1. **Don't add** `grinite-tech.onrender.com` as a DNS record - it already exists on Render's side
2. **Do add** a CNAME record:
   - Name: `api`
   - Value/Target: `grinite-tech.onrender.com`
3. **Verify** the CNAME is correct:
   ```bash
   dig api.quantistechnologies.co.zw CNAME
   # Should return: api.quantistechnologies.co.zw. IN CNAME grinite-tech.onrender.com.
   ```
4. If you see `grinite-tech.onrender.com` listed as a record in your DNS panel, that's likely incorrect - remove it and add the CNAME record instead

---

## 📞 Support Contacts

If you encounter issues:

1. **DNS Issues:** Contact mydata.city support
2. **Vercel Issues:** Vercel Support or [Documentation](https://vercel.com/docs)
3. **Render Issues:** Render Support or [Documentation](https://render.com/docs)

---

## ✅ Checklist

- [x] Nameservers configured at domain registrar (ns5.mydata.city, ns6.mydata.city)
- [x] Domain added to Vercel frontend project (`quantistechnologies.co.zw`, `www.quantistechnologies.co.zw`)
- [x] Domain added to Render backend service (`api.quantistechnologies.co.zw`)

**Choose DNS Configuration Approach:**

**Option A: Vercel Nameservers**
- [ ] Update nameservers at registrar to `ns1.vercel-dns.com`, `ns2.vercel-dns.com`
- [ ] Wait 24-48 hours for nameserver propagation
- [ ] Configure API subdomain (may need to switch back to mydata.city or use Vercel DNS)

**Option B: Custom Nameservers (Recommended)**
- [ ] **Root domain A record updated:** Change from `152.53.85.199` to `216.198.79.1` (Vercel)
- [ ] **WWW CNAME record added:** `www` → `ab64489d90636882.vercel-dns-017.com.` (Vercel)
- [ ] **API CNAME record added:** `api` → `grinite-tech.onrender.com` (Render)
- [ ] Verify `mail.quantistechnologies.co.zw` has its own A record to `152.53.85.199` (for email)

**Verification Steps:**
- [ ] **Vercel domain verification:** Wait for DNS propagation, then verify in Vercel Dashboard
- [ ] **Render domain verification:** Click "Verify" button in Render Dashboard after adding CNAME
- [ ] Environment variables updated in Vercel
- [ ] Environment variables updated in Render
- [ ] CORS configuration updated in backend
- [ ] Frontend API URL updated
- [ ] DNS propagation verified (24-48 hours)
- [ ] SSL certificates active (auto-provisioned after DNS verification)
- [ ] Frontend accessible at https://quantistechnologies.co.zw
- [ ] Backend API accessible at https://api.quantistechnologies.co.zw
- [ ] CORS working correctly
- [ ] All tests passing

---

## 🎉 Next Steps After Setup

1. **Update Marketing Materials:** Update all references to old domain
2. **Set Up Email:** Configure email forwarding if needed
3. **Monitor:** Set up monitoring/analytics for new domain
4. **Backup:** Document DNS configuration for future reference

---

**Last Updated:** 2025-12-12
**Domain:** quantistechnologies.co.zw
**Status:** DNS Configured - Nameservers Active

**DNS Verification Status:**
- ✅ Nameservers registered at ZISPA: ns5.mydata.city, ns6.mydata.city
- ✅ All nameservers authoritative with matching serial numbers (2025121200)
- ✅ A record configured: 152.53.85.199
- ✅ AAAA record configured: 2a0a:4cc0:c0:2253::199
- ✅ MX record configured: mail.quantistechnologies.co.zw (priority 10)
- ✅ SPF TXT record configured
- ⚠️ Next: Configure A/CNAME records for Vercel (frontend) and Render (backend API)



 


