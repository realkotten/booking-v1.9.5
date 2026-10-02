# Security Specification

## Data Invariants
1. User profiles are keyed by auth UID: `/users/{userId}` where `userId == request.auth.uid`.
2. Users can only update their own profile and cannot escalate their role to admin.
3. Appointments can be created by authenticated users or guest clients with required fields.
4. Admins can view and manage all appointments; users can view their own appointments.
5. Admin access is verified against runtime admin email `heiskottensbro@gmail.com` or admin record.

## Payloads Testing ("Dirty Dozen")
1. Non-authenticated user modifying user profile -> PERMISSION_DENIED
2. Authenticated user attempting to overwrite another user's profile -> PERMISSION_DENIED
3. User attempting to self-promote role to "admin" -> PERMISSION_DENIED
4. Payload with oversized strings exceeding max length -> PERMISSION_DENIED
5. Malformed document ID injection -> PERMISSION_DENIED
6. User reading another user's private profile document -> PERMISSION_DENIED
7. Blank required fields on appointment creation -> PERMISSION_DENIED
8. Spoofed userId on appointment creation -> PERMISSION_DENIED
9. Modifying immutable createdAt timestamp -> PERMISSION_DENIED
10. Unverified email spoofing admin -> PERMISSION_DENIED
11. Arbitrary extra shadow keys in user profile -> PERMISSION_DENIED
12. Status modification by unauthorized client -> PERMISSION_DENIED
