# 🛍️ RakibMart - E-Commerce Website

Developed by **Md Rakib Hassan Rony**

Next.js + PostgreSQL (Drizzle ORM) দিয়ে তৈরি সম্পূর্ণ e-commerce platform।

- **Public Store:** `/` (কাস্টমারদের জন্য)
- **Admin Panel:** `/admin` (Username: `admin`, Password: `admin123`)

---

## 🚀 ফ্রি Hosting গাইড (Vercel + Neon)

### ধাপ ১: Database তৈরি (Neon - ফ্রি)
1. [neon.tech](https://neon.tech) এ যান → GitHub দিয়ে Sign up করুন
2. **Create Project** ক্লিক করুন
3. **Connection String** কপি করুন (দেখতে এমন: `postgresql://user:pass@xxx.neon.tech/dbname`)

### ধাপ ২: Vercel এ Deploy (ফ্রি)
1. [vercel.com](https://vercel.com) এ যান → GitHub দিয়ে Sign up করুন
2. **Add New → Project** → এই repo select করুন
3. **Environment Variables** এ যোগ করুন:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Neon থেকে কপি করা connection string |
| `JWT_SECRET` | যেকোনো লম্বা random text |

4. **Deploy** ক্লিক করুন

### ধাপ ৩: Database Table তৈরি
আপনার কম্পিউটারে এই folder এ terminal খুলে (একবারই লাগবে):

```bash
npm install
```

তারপর `.env` নামে একটা file বানান এই content দিয়ে:

```
DATABASE_URL=আপনার-neon-connection-string
```

তারপর চালান:

```bash
npx drizzle-kit push
```

### ধাপ ৪: Sample Data
আপনার live website এর homepage একবার visit করলেই sample products + admin user অটো তৈরি হয়ে যাবে।

---

## 🚚 Steadfast Courier (Optional)

Live courier entry এর জন্য Vercel এ আরো ২টা Environment Variable যোগ করুন:

| Name | Value |
|------|-------|
| `STEADFAST_API_KEY` | Steadfast portal থেকে |
| `STEADFAST_SECRET_KEY` | Steadfast portal থেকে |

না দিলে Simulation mode এ চলবে (mock tracking code)।

---

## 💻 Local এ চালাতে

```bash
npm install
npm run dev
```

Website: http://localhost:3000
