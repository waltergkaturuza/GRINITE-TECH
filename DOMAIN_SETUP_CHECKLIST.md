# Quick Domain Setup Checklist - quantistechnologies.co.zw

## ✅ Pre-Deployment Checklist

### 1. Domain Registrar Configuration
- [ ] Logged into domain registrar
- [ ] Updated nameservers to:
  - ns1.mydata.city
  - ns2.mydata.city
  - ns3.mydata.city
  - ns4.mydata.city
- [ ] Saved changes
- [ ] Waited 24-48 hours for DNS propagation

### 2. DNS Configuration at mydata.city
- [ ] Logged into mydata.city DNS panel
- [ ] Added A record for `@` (root domain) → Vercel IP
- [ ] Added CNAME record for `www` → cname.vercel-dns.com
- [ ] Added A/CNAME record for `api` → Render IP or CNAME
- [ ] Set TTL to 3600 (1 hour)

### 3. Vercel Frontend Setup
- [ ] Added domain `quantistechnologies.co.zw` to Vercel project
- [ ] Added domain `www.quantistechnologies.co.zw` to Vercel project
- [ ] Updated environment variables:
  - `NEXT_PUBLIC_API_URL=https://api.quantistechnologies.co.zw/api/v1`
  - `NEXT_PUBLIC_SITE_URL=https://quantistechnologies.co.zw`
- [ ] Verified SSL certificate is active (green padlock)
- [ ] Tested site loads at https://quantistechnologies.co.zw

### 4. Render Backend Setup (or Vercel)
- [ ] Added custom domain `api.quantistechnologies.co.zw` to Render service
- [ ] Updated environment variables:
  - `FRONTEND_URL=https://quantistechnologies.co.zw`
  - `ALLOWED_ORIGINS=https://quantistechnologies.co.zw,https://www.quantistechnologies.co.zw`
- [ ] Verified SSL certificate is active
- [ ] Tested API at https://api.quantistechnologies.co.zw/api/v1/health

### 5. Code Updates (Already Done ✅)
- [x] Backend CORS configuration updated
- [x] Frontend API configuration updated
- [x] Email service updated
- [x] Documentation updated
- [x] Security headers added

### 6. Testing
- [ ] Frontend loads: https://quantistechnologies.co.zw
- [ ] www redirect works: www.quantistechnologies.co.zw → quantistechnologies.co.zw
- [ ] API health check: https://api.quantistechnologies.co.zw/api/v1/health
- [ ] CORS working (no errors in browser console)
- [ ] SSL certificates valid (green padlock)
- [ ] All forms and API calls working

### 7. DNS Verification
- [ ] Checked DNS propagation: https://dnschecker.org
- [ ] Verified A records globally
- [ ] Verified CNAME records
- [ ] Tested from command line: `nslookup quantistechnologies.co.zw`

---

## 🔗 Quick Links

- **DNS Checker:** https://dnschecker.org
- **SSL Checker:** https://www.ssllabs.com/ssltest/
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Render Dashboard:** https://dashboard.render.com

---

## 📝 Environment Variables Summary

### Vercel (Frontend)
```bash
NEXT_PUBLIC_API_URL=https://api.quantistechnologies.co.zw/api/v1
NEXT_PUBLIC_SITE_URL=https://quantistechnologies.co.zw
```

### Render (Backend)
```bash
FRONTEND_URL=https://quantistechnologies.co.zw
ALLOWED_ORIGINS=https://quantistechnologies.co.zw,https://www.quantistechnologies.co.zw
```

---

## 🆘 Troubleshooting

**Domain not resolving?**
→ Check DNS propagation, wait 24-48 hours

**SSL not working?**
→ Wait 5-10 minutes after DNS config, verify DNS records

**CORS errors?**
→ Check ALLOWED_ORIGINS includes your domain exactly

**API not accessible?**
→ Verify api subdomain DNS record, check Render service status

---

**For detailed instructions, see:** `CUSTOM_DOMAIN_SETUP.md`






