# KYC Application – Enterprise User Guide

This guide provides comprehensive instructions for effectively using the KYC (Know Your Customer) Application. It is intended for enterprise users across all roles, including Makers, Checkers, and Administrators. The document outlines the procedures for accessing the platform, managing forms, executing role-specific tasks, and resolving common issues.

---

## 1. Accessing the Application

### Application URL

To access the application, navigate to: [https://kyc-app-4v1umc6r2-krishnas-projects-a7a5d054.vercel.app](https://kyc-app-4v1umc6r2-krishnas-projects-a7a5d054.vercel.app)

### Authentication

1. Use the profile menu in the top-right corner to switch between roles (Maker or Checker), as applicable.

---

## 2. Creating and Submitting a KYC Form (Maker Role)

### Creating a Form

1. Click **"New Form"** on the Dashboard.
2. Complete all required fields across the designated stages:
   - Personal Identification
   - Contact Information
   - Identity Documentation
   - Address Verification
3. Use the **"+ Add Section"** button to dynamically insert or remove form sections.
4. Configure conditional logic where applicable (e.g., reveal address fields if "Yes" is selected for a secondary address).

### Submitting the Form

1. Once all sections are completed, click **"Submit for Approval"**.
2. Upon confirmation, the form status will be updated to **Pending Review**.

---

## 3. Reviewing and Managing Submissions (Checker Role)

### Reviewing Forms

1. Switch to the **Checker** role via the profile dropdown.
2. From the Dashboard, view all forms assigned to you for review.
3. Select a form to inspect its contents.

### Taking Action

- Use the **Approve** or **Reject** options at the bottom of the form.
- You may include comments or request additional information as needed.
- A single approval from any assigned Checker is sufficient to finalize the form status as **Approved**.

---

## 4. Managing Existing Forms

### Viewing Submissions

- Navigate to the Dashboard to access forms categorized by status.
- Use the filtering and search tools to locate specific entries.

### Editing or Cloning Forms

- Approved, Rejected, or Pending Review forms can be cloned:
  - Click the **edit/copy** icon to duplicate the form.
  - A new editable draft will be generated; the original remains unchanged.
  - Modify and resubmit the new form as required.

---

## 5. Profile and Role Management

### Accessing Profile Details

- Click the avatar in the top-right navigation bar and select **"My Profile"**.
- View and edit profile information, including department, employee ID, and recent activities.

### Switching Roles

- Use the **"Switch Role"** function in the profile menu to toggle between **Maker** and **Checker** roles.

---

## 6. Form Status Indicators

| Icon | Status   | Description                          |
| ---- | -------- | ------------------------------------ |
| 🟡   | Pending  | Awaiting review and approval         |
| 🟢   | Approved | Reviewed and verified as compliant   |
| 🔴   | Rejected | Returned for revisions with comments |

---

## 7. Form Features and Field Types

### Available Field Types

1. **Text Fields**

2. **Date Fields**

   - Integrated calendar picker
   - Date format enforcement
   - Optional time selection

3. **Checkbox Fields**

   - Single checkbox for binary inputs
   - Multiple checkboxes for grouped selections

4. **Table Fields**

5. **Calculated Fields**

   - Automatically computed values
   - Formula-driven logic

### Field Configuration Options

1. **Required Fields**

   - Marked with a red asterisk (*)
   - Forms cannot be submitted unless completed
   - Visual alerts highlight incomplete required fields

2. **Field Validation**

   - Real-time input validation
   - Inline error messaging
   - Format-specific validation for fields like phone numbers and emails

3. **Draft Saving**

   - Auto-save during form completion
   - Manual draft save via "Save Draft" button
   - Resume editing from last save point
   - Draft status indicator displayed

4. **Form Preview**

   - Toggle between **Edit** and **Preview** modes
   - View final layout before submission
   - Verify completeness and conditional logic

5. **Visibility Conditions**

   - Conditional rendering based on field values
   - Contextual field-level validation
   - Dynamically displayed sections


---