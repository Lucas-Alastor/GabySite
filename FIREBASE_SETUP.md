# Firebase Setup Guide - UGCS By Gaby

This project is ready to use Firebase Firestore, Firebase Storage, and Firebase Authentication.

## What was added

- `firebase-config.js`: Firebase connection file.
- `admin.html`: private admin page with the same kawaii visual style.
- `admin.js`: login, image upload, Firestore save, list, and delete logic.
- Updated `app.js`: the public site now loads assets from Firestore when Firebase is configured.
- Local fallback assets: if Firebase is not configured or has no assets yet, the old local items still appear.

---

## 1. Create the Firebase project

1. Go to Firebase Console.
2. Click **Create a project**.
3. Choose a project name, for example: `gaby-portfolio`.
4. Google Analytics is optional for this portfolio.
5. Finish creating the project.

---

## 2. Register the web app

1. Inside your Firebase project, click the **Web** icon: `</>`.
2. Add an app nickname, for example: `Gaby Portfolio Website`.
3. Firebase will show a config object like this:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

4. Open `firebase-config.js` in this project.
5. Replace the placeholder values with your real Firebase config.

Important: newer Firebase projects usually use this Storage bucket format:

```txt
PROJECT_ID.firebasestorage.app
```

Older projects may use:

```txt
PROJECT_ID.appspot.com
```

Use exactly the value Firebase gives you.

---

## 3. Enable Firestore Database

1. In Firebase, go to **Build > Firestore Database**.
2. Click **Create database**.
3. Choose **Start in production mode**.
4. Choose a region close to your audience.
5. Create the database.

The website expects a collection named:

```txt
assets
```

You do not need to create it manually. The first admin upload will create it automatically.

Each asset document will look like this:

```js
{
  title: "Pink Shadow Twin Tails",
  description: "Black twin-tail hairstyle with pink highlights...",
  category: "hairs",
  tagOne: "Hair",
  tagTwo: "Kawaii",
  imageUrl: "https://...",        // first image / cover
  imageUrls: ["https://..."],     // all carousel images
  storagePath: "assets/uid/file-id.png",
  storagePaths: ["assets/uid/file-id.png"],
  ownerUid: "firebase-user-uid",
  ownerEmail: "admin@email.com",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 4. Enable Authentication

1. Go to **Build > Authentication**.
2. Click **Get started**.
3. Open the **Sign-in method** tab.
4. Enable **Email/Password**.
5. Go to **Users**.
6. Add a user manually for the admin, for example your email or Gaby's email.

The admin page does not allow public sign-up. It only logs in existing Firebase users.

---

## 5. Enable Storage

1. Go to **Build > Storage**.
2. Click **Get started**.
3. Create the default bucket.
4. Choose a region.

Note: depending on the current Firebase project rules and plan, Firebase may ask for the Blaze plan to enable Cloud Storage.

---

## 6. Firestore security rules

Recommended secure version:

```txt
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && request.auth.token.email in [
        "YOUR_EMAIL_HERE@gmail.com",
        "GABY_EMAIL_HERE@gmail.com"
      ];
    }

    function hasRequiredAssetFields() {
      return request.resource.data.keys().hasAll([
        "title",
        "description",
        "category",
        "tagOne",
        "imageUrl",
        "imageUrls",
        "storagePath",
        "storagePaths",
        "ownerUid",
        "createdAt",
        "updatedAt"
      ]);
    }

    function hasValidAssetData() {
      return request.resource.data.title is string
        && request.resource.data.title.size() > 0
        && request.resource.data.title.size() <= 80
        && request.resource.data.description is string
        && request.resource.data.description.size() > 0
        && request.resource.data.description.size() <= 220
        && request.resource.data.category in ["hairs", "plushies", "accessories", "others"]
        && request.resource.data.tagOne is string
        && request.resource.data.tagOne.size() > 0
        && request.resource.data.tagOne.size() <= 24
        && (!request.resource.data.keys().hasAny(["tagTwo"]) || (request.resource.data.tagTwo is string && request.resource.data.tagTwo.size() <= 24))
        && request.resource.data.imageUrl is string
        && request.resource.data.imageUrls is list
        && request.resource.data.imageUrls.size() >= 1
        && request.resource.data.imageUrls.size() <= 8
        && request.resource.data.storagePath is string
        && request.resource.data.storagePaths is list
        && request.resource.data.storagePaths.size() >= 1
        && request.resource.data.storagePaths.size() <= 8
        && (!request.resource.data.keys().hasAny(["sortOrder"]) || request.resource.data.sortOrder is number)
        && request.resource.data.ownerUid == request.auth.uid;
    }

    match /assets/{assetId} {
      allow read: if true;
      allow create: if isAdmin() && hasRequiredAssetFields() && hasValidAssetData();
      allow update: if isAdmin() && hasRequiredAssetFields() && hasValidAssetData();
      allow delete: if isAdmin();
    }
  }
}
```

Replace the emails with the real admin emails. Avoid using `allow write: if request.auth != null` permanently, because any authenticated user could modify your assets.

---

## 7. Storage security rules

Recommended secure version:

```txt
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    function isAdmin() {
      return request.auth != null && request.auth.token.email in [
        "YOUR_EMAIL_HERE@gmail.com",
        "GABY_EMAIL_HERE@gmail.com"
      ];
    }

    match /assets/{userId}/{fileName} {
      allow read: if true;
      allow create, update: if isAdmin()
        && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches("image/(jpeg|png|webp|gif)");
      allow delete: if isAdmin();
    }
  }
}
```

The code uploads files to `assets/{uid}/file-name`, so these rules prevent one user from writing to another user's folder and block non-image uploads.

---

## 8. How to run locally

Because this project now uses JavaScript modules, open it through a local server.

Recommended option:

1. Install the **Live Server** extension in VS Code.
2. Right-click `index.html`.
3. Click **Open with Live Server**.

Then open:

```txt
/admin.html
```

Example:

```txt
http://127.0.0.1:5500/admin.html
```

Do not test by double-clicking the HTML file, because browser module imports can fail with `file://`.

---

## 9. How to add a new item

1. Open `admin.html` through Live Server or your hosted domain.
2. Login with the Firebase admin email/password.
3. Fill in:
   - Title
   - Description
   - Category
   - Tags
   - Images for Carousel
4. Select one image for a normal card, or multiple images for a carousel. The first selected image becomes the cover.
5. Click **Add Asset**.
6. The public portfolio will show the new item automatically.
7. Use the ↑ and ↓ buttons in **Assets in Firebase** to change the order shown on the public site.

---

## 10. Recommended deploy options

You can host this site on:

- Firebase Hosting
- Netlify
- Vercel
- GitHub Pages

Firebase Hosting is the most integrated option because the project already uses Firebase.



---

## Extra security recommendations

- Do not create a public sign-up page for admins.
- Use strong admin passwords and enable multi-factor authentication on the Google account that owns the Firebase project.
- Keep the strict Firestore and Storage rules above before publishing.
- In Firebase Authentication, only create users that should access the admin panel.
- In production, consider enabling Firebase App Check to reduce abuse from scripts outside your real site.
- Never store service account keys or private Firebase Admin SDK credentials in this front-end project.
