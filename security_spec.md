# Security Specification - KAGZ Wilderness Experience

This document details the security model, access control invariants, and testing specification for the Firestore database behind the KAGZ website and Concierge Portal.

## 1. Data Invariants

1. **Destinations**:
   - Access: Anyone can read (get/list). Only authenticated admins can write (create/update/delete).
   - Validation: Must have a valid alphanumeric/hyphenated string `id`. Allowed and required keys must be strictly validated.
   - Limits: All text fields must fit within their `maxLength` bounds (e.g. `name` <= 100).

2. **Tours**:
   - Access: Anyone can read. Only authenticated admins can write.
   - Validation: Must have `destination` and `name` fields.
   - Limits: Fields must fit within defined volumetric bounds.

3. **Blogs / Articles**:
   - Access: Anyone can read. Only authenticated admins can write.
   - Validation: Must have `title` and `id` fields.

4. **Enquiries**:
   - Access: Anyone can create (submit contact/plan forms). No one can read them except authenticated admins.
   - Validation: Must include `id`, `name`, and a valid `email` format.
   - Limits: `message` cannot exceed 2000 characters.

## 2. The "Dirty Dozen" Malicious Payloads

The following payloads attempt to break the rules of security, identity, and integrity and must return `PERMISSION_DENIED`:

### P1: Destination without required id
```json
{
  "name": "Invalid Destination",
  "tagline": "No ID specified"
}
```

### P2: Destination with name exceeding 100 characters
```json
{
  "id": "too-long-dest",
  "name": "ThisIsAVeryLongNameThatExceedsTheMaximumAllowedCharactersOfOneHundredCharactersLimitToTriggerAValidationErrorAndBeDeniedByOurStrictSecurityRules"
}
```

### P3: Destination with shadow / unauthorized keys
```json
{
  "id": "shadow-dest",
  "name": "New Destination",
  "maliciousAdminField": true
}
```

### P4: Tour with missing required destination field
```json
{
  "id": "tour-no-dest",
  "name": "Missing Destination Tour"
}
```

### P5: Tour with unauthorized extra fields
```json
{
  "id": "tour-shadow",
  "name": "Tour With Shadow Fields",
  "destination": "kenya",
  "isApproved": true
}
```

### P6: Article with missing title
```json
{
  "id": "article-no-title",
  "category": "Safari Tips"
}
```

### P7: Article with ultra-long excerpt
```json
{
  "id": "long-article",
  "title": "Safari Magic",
  "excerpt": "This is an excerpt designed to exceed the maximum characters allowed. This is an excerpt designed to exceed the maximum characters allowed. This is an excerpt designed to exceed the maximum characters allowed. This is an excerpt designed to exceed the maximum characters allowed. This is an excerpt designed to exceed the maximum characters allowed. This is an excerpt designed to exceed the maximum characters allowed. This is an excerpt designed to exceed the maximum characters allowed."
}
```

### P8: Enquiry with message exceeding 2000 characters
```json
{
  "id": "long-enquiry",
  "name": "Alice",
  "email": "alice@gmail.com",
  "message": "[Repeating text to exceed 2000 characters limit...]"
}
```

### P9: Enquiry missing email
```json
{
  "id": "no-email-enquiry",
  "name": "Bob",
  "message": "Hello there"
}
```

### P10: Editing immutable Enquiry ID after creation
```json
{
  "id": "changed-id-during-update",
  "name": "Bob"
}
```

### P11: Unauthenticated user attempting to write destinations
```json
{
  "id": "hack-dest",
  "name": "Hacked Destination"
}
```

### P12: Unauthenticated user attempting to list/read enquiries
`get /enquiries/some-enquiry-id` -> Should fail with PERMISSION_DENIED.

## 3. Rules Implementation Strategy
We enforce access patterns:
- Admins are authenticated staff members. For our portal, we check if `request.auth.token.email` or UID matches the admin concept.
- Anonymous and unauthenticated requests can write enquiries (create only) but cannot list or delete them.
