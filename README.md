# FormToGoogleSheet

Submit HTML form data straight to a Google Sheet. No API keys, no server, no database — just a Google Sheet and a `<script>` tag.

## Install

```bash
npm install form-to-google-sheet
```

Or use a CDN — no install needed:

```html
<script src="https://unpkg.com/form-to-google-sheet"></script>
```

Or with jsdelivr:

```html
<script src="https://cdn.jsdelivr.net/npm/form-to-google-sheet"></script>
```

## How It Works

```
Browser form  ──POST──▶  Google Apps Script (free)  ──▶  Google Sheet
```

Google Apps Script acts as a tiny serverless endpoint that lives inside your spreadsheet. You deploy it once, get a URL, and POST to it from anywhere.

---

## Setup (5 minutes)

### 1. Prepare your Google Sheet

Open your sheet and add **column headers** in Row 1.  
The header names must match the keys you send from your form.

| name | email | message |
|------|-------|---------|
|      |       |         |

> If the sheet is empty (no headers), the script will auto-create headers from the first submission's keys.

### 2. Add the Apps Script

1. In your Google Sheet go to **Extensions → Apps Script**.
2. Delete any code in the editor and paste the contents of [`Code.gs`](Code.gs).
3. If your tab is not called `Sheet1`, update the `SHEET_NAME` variable at the top.
4. Click **💾 Save**.

### 3. Deploy as a Web App

1. In the Apps Script editor click **Deploy → New deployment**.
2. Click the gear icon next to **Select type** and choose **Web app**.
3. Set:
   - **Description**: anything you like
   - **Execute as**: **Me**
   - **Who has access**: **Anyone**
4. Click **Deploy**.
5. Authorize the script when prompted (it needs permission to edit *your* sheet).
6. Copy the **Web app URL** — it looks like:  
   `https://script.google.com/macros/s/AKfycb.../exec`

### 4. Add to Your Project

**With npm / a bundler (React, Next.js, Vite, etc.):**

```js
import FormToSheet from "form-to-google-sheet";

FormToSheet.init("https://script.google.com/macros/s/YOUR_ID/exec");
```

**With a CDN / script tag (plain HTML):**

```html
<script src="https://unpkg.com/form-to-google-sheet"></script>
<script>
  FormToSheet.init("https://script.google.com/macros/s/YOUR_ID/exec");
</script>
```

---

## Usage

### Option A: Bind to a `<form>`

```html
<form id="contact-form">
  <input name="name"    required />
  <input name="email"   required />
  <textarea name="message"></textarea>
  <button type="submit">Send</button>
</form>

<script src="form-to-sheet.js"></script>
<script>
  FormToSheet.init("YOUR_APPS_SCRIPT_URL");
  FormToSheet.bind("#contact-form", {
    onSuccess: () => alert("Saved!"),
    onError:   (err) => console.error(err),
    resetOnSuccess: true,           // default: true
  });
</script>
```

### Option B: Submit Programmatically

```js
FormToSheet.init("YOUR_APPS_SCRIPT_URL");

// single row
FormToSheet.submit({ name: "Ada", email: "ada@example.com" })
  .then(console.log);

// multiple rows at once
FormToSheet.submit([
  { name: "Ada",   email: "ada@example.com" },
  { name: "Grace", email: "grace@example.com" },
]);
```

### Option C: Use in React

```jsx
import { useRef } from "react";
import FormToSheet from "form-to-google-sheet";

FormToSheet.init("YOUR_APPS_SCRIPT_URL");

export default function ContactForm() {
  const formRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(formRef.current));
    await FormToSheet.submit(data);
    alert("Done!");
    formRef.current.reset();
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" required />
      <button type="submit">Send</button>
    </form>
  );
}
```

Tip: call `FormToSheet.init(url)` once at app startup (e.g. in `main.jsx`) instead of per-component if you prefer.

---

## API

| Method | Description |
|--------|-------------|
| `FormToSheet.init(url)` | Set the Apps Script deployment URL. Call once. |
| `FormToSheet.submit(data)` | Send a row (`{}`) or rows (`[{}, ...]`). Returns a `Promise`. |
| `FormToSheet.bind(selector, opts)` | Auto-wire a `<form>` element. Options: `onSuccess`, `onError`, `resetOnSuccess`. |

---

## Notes

- **No API key required.** The Google Apps Script web app handles auth.
- **CORS**: The library uses `mode: "no-cors"` so it works from any origin. The trade-off is you can't read the response body — but the row still gets written. If the fetch doesn't throw, it worked.
- **Rate limits**: Google Apps Script allows ~20,000 calls/day on a free Google account. More than enough for contact forms and small apps.
- **Security**: Anyone with the URL can POST to your sheet. For production, consider adding a shared secret or honeypot field in the Apps Script.
