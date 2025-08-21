# Project Setup Notes

## 🔗 Model Link

* Eraser workspace: [https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)

## 📝 Your Original Notes (kept verbatim)

```
you cannot push the empty folder directly so to push empty folder which will be used in future u add a empty file in that folder as git generally tracks the files not folder
```

```
always use pritter to keep the format clearn and stable
```

---

## 📂 Empty Folders in Git

Git does not track empty folders—only files. To keep a folder for future use (e.g., `uploads/`, `logs/`, `tmp/`), add a placeholder file.

### Steps

```bash
mkdir -p uploads logs tmp

touch uploads/.gitkeep
touch logs/.gitkeep
touch tmp/.gitkeep

git add uploads/.gitkeep logs/.gitkeep tmp/.gitkeep
git commit -m "chore: keep empty folders with .gitkeep"
```

> Convention: Use a file named `.gitkeep` (or `.keep`). It has no special meaning to Git; it's just a clearly named placeholder.

### Example Structure

```
project-root/
├─ uploads/
│  └─ .gitkeep
├─ logs/
│  └─ .gitkeep
├─ tmp/
│  └─ .gitkeep
└─ README.md
```

---

## 🎨 Code Formatting with Prettier

*(Your note says "pritter" — the tool is **Prettier**.)*

### Install (per project)

```bash
npm install --save-dev prettier
```

### Create a basic Prettier config (optional but recommended)

```bash
printf '{\n  "singleQuote": true,\n  "trailingComma": "all"\n}\n' > .prettierrc
```

### Add handy scripts to `package.json`

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

### Run Prettier

```bash
npm run format
# or
npx prettier --write .
```

---

## ⚡ Optional: Auto-Format on Commit (Husky + lint-staged)

Keep your repo consistently formatted by formatting just the staged files on each commit.

### Install

```bash
npm install --save-dev husky lint-staged
```

### Add to `package.json`

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,json,css,md}": "prettier --write"
  }
}
```

### Enable Husky and add a pre-commit hook

```bash
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

---

## ✅ Summary

* The Eraser **Model Link** is listed above for quick reference.
* Empty folders are kept in Git using placeholder files like `.gitkeep`.
* Use **Prettier** to keep formatting clean and stable across the project, and optionally automate it with Husky + lint-staged.
````
why to use app.use(express.urlencoded({extended:true}))
extended: false →
Uses the Node.js querystring library.

Can only parse simple key-value pairs.

Example:name=Sandesh&age=21
→ { name: "Sandesh", age: "21" }

extended: true →
Uses the qs library.

Can parse nested objects & arrays in form data.

Example:

user[name]=Sandesh&user[age]=21


→ { user: { name: "Sandesh", age: "21" } }
````
````



app.use(express.static("public"));
```

is used to **serve static files** from a folder.

---

### 🔎 What are static files?

Files that don’t change dynamically — like:

* **HTML** pages
* **CSS** files
* **JavaScript (frontend)** files
* **Images, videos, PDFs, fonts, icons**

---

### 📌 Example

Suppose your project has this structure:

```
project/
│
├── public/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── images/
│       └── logo.png
│
├── server.js
```

And in `server.js` you write:

```js
app.use(express.static("public"));
```

Now, if you start the server:

* `http://localhost:5000/index.html` → serves `public/index.html`
* `http://localhost:5000/style.css` → serves `public/style.css`
* `http://localhost:5000/images/logo.png` → serves `public/images/logo.png`

Basically, Express maps everything inside **`public`** folder directly to a URL.

---

### ⚡ Why use it?

1. To serve frontend assets (HTML/CSS/JS/images).
2. No need to create routes for each file manually.
3. Useful in **fullstack apps** (backend + frontend in one project).

---

👉 So, **`express.static("public")`** = “Make my `public` folder available to the browser.”

---

````


```js
app.use(cookieParser());
```

is used to **parse cookies** attached to the client’s request and make them easily accessible in Express.

---

### 🔎 What are cookies?

* **Small pieces of data** stored in the user’s browser.
* Sent back with every request to the server.
* Often used for:

  * Session tracking (login state)
  * Authentication tokens (JWT, session ID)
  * Preferences (theme, language, cart items)

---

### 📌 Without `cookie-parser`

Cookies are sent in the **request headers** like this:

```
Cookie: username=Sandesh; token=abc123
```

In Express, without `cookie-parser`, you’d have to manually parse this string.

---

### 📌 With `cookie-parser`

After adding:

```js
const cookieParser = require("cookie-parser");
app.use(cookieParser());
```

all cookies are available in `req.cookies` as a nice JavaScript object:

```js
// Example request: Cookie: username=Sandesh; token=abc123

app.get("/", (req, res) => {
  console.log(req.cookies);
  // Output: { username: "Sandesh", token: "abc123" }
  res.send("Cookies parsed!");
});
```

---

### ⚡ Extra feature

You can also use a **secret** for signed cookies:

```js
app.use(cookieParser("mySecretKey"));
```

Then you can set signed cookies and verify integrity (to ensure the client hasn’t tampered with them).

---

👉 So in short:

* `cookieParser()` = middleware that **reads cookies from requests** and puts them in `req.cookies`.
* Makes handling auth, sessions, preferences, etc. much easier.

---


