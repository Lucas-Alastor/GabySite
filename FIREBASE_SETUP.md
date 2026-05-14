# Firebase Setup Guide - UGCS By Gaby

This project uses Firebase Authentication, Firestore Database and Firebase Storage.

## Collections/documents used

### Assets

The admin panel saves portfolio items in:

```txt
assets/{assetId}
```

### Home content

The admin panel saves the editable Home page content in:

```txt
siteContent/home
```

The public site reads both locations automatically.

---

## Firestore security rules

Use this version after replacing the example emails with the real admin emails:

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

    function hasValidHomeData() {
      return request.resource.data.brandName is string
        && request.resource.data.brandName.size() <= 40
        && request.resource.data.heroEyebrow is string
        && request.resource.data.heroEyebrow.size() <= 80
        && request.resource.data.heroTitle is string
        && request.resource.data.heroTitle.size() <= 110
        && request.resource.data.heroHighlight is string
        && request.resource.data.heroHighlight.size() <= 60
        && request.resource.data.heroDescription is string
        && request.resource.data.heroDescription.size() <= 320
        && request.resource.data.primaryButtonText is string
        && request.resource.data.primaryButtonText.size() <= 32
        && request.resource.data.primaryButtonUrl is string
        && request.resource.data.primaryButtonUrl.size() <= 260
        && request.resource.data.secondaryButtonText is string
        && request.resource.data.secondaryButtonText.size() <= 32
        && request.resource.data.profileName is string
        && request.resource.data.profileName.size() <= 60
        && request.resource.data.profileRole is string
        && request.resource.data.profileRole.size() <= 80
        && request.resource.data.profileButtonText is string
        && request.resource.data.profileButtonText.size() <= 32
        && request.resource.data.profileButtonUrl is string
        && request.resource.data.profileButtonUrl.size() <= 260
        && request.resource.data.profileImageUrl is string
        && request.resource.data.profileImageUrl.size() <= 1000;
    }

    match /assets/{assetId} {
      allow read: if true;
      allow create: if isAdmin() && hasRequiredAssetFields() && hasValidAssetData();
      allow update: if isAdmin() && hasRequiredAssetFields() && hasValidAssetData();
      allow delete: if isAdmin();
    }

    match /siteContent/home {
      allow read: if true;
      allow create, update: if isAdmin() && hasValidHomeData();
      allow delete: if false;
    }
  }
}
```

---

## Storage security rules

Use this version after replacing the example emails with the real admin emails:

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

    match /site/home/{userId}/{fileName} {
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

---

## Notes

- The admin project uses `index.html`, so it opens directly from its deploy URL.
- The public project reads the Home content from `siteContent/home` and the assets from `assets`.
- If `siteContent/home` does not exist yet, the public site uses the original local Home texts and image.
- The Home profile image is uploaded to `site/home/{uid}/...`.
- Asset images are uploaded to `assets/{uid}/...`.
