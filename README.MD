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
