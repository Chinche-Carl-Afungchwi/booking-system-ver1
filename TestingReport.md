# Booking System Security Test Report

This report documents the results of a security test conducted on the booking system and outlines the most critical issues identified, along with how they were fixed. The test was conducted using OWASP ZAP (Zed Attack Proxy).

---

## 1. Format String Error in Resource Registration

### **What is wrong?**
The `resource_name` parameter in the `POST /resources` request was vulnerable to a format string error. An attacker could exploit this to execute arbitrary code by injecting malicious input.

### **How did I find it?**
Using OWASP ZAP, I observed that unvalidated user input was directly passed into SQL queries in `resources.js`. The issue became apparent when testing payloads with special characters, which were processed without proper sanitization.

### **How should it work? / What was fixed?**
Input sanitization was implemented in the `registerResource` function. A `sanitizeInput` function was added to remove special characters and restrict the length of the `resource_name` and `resource_description` fields before they are stored in the database.

**Changes made:**
- Added a `sanitizeInput` function to clean user inputs.
- Used parameterized queries to handle database interactions safely.

---

## 2. Cross-Site Scripting (XSS) Weakness in JSON Responses

### **What is wrong?**
The application was vulnerable to XSS attacks due to unsafe data returned in JSON responses from `GET /resourcesList`. An attacker could inject malicious scripts that could be executed in the browser.

### **How did I find it?**
ZAP identified potential XSS vulnerabilities in JSON responses when testing user inputs containing malicious scripts (e.g., `<script>alert(1)</script>`). These inputs were stored and returned unescaped, allowing them to execute in the browser.

### **How should it work? / What was fixed?**
Output escaping was added to ensure that any data returned in JSON responses is safe. A `escapeForJSON` function was implemented to encode special characters in JSON outputs.

**Changes made:**
- Sanitized outputs in the `getResources` function by escaping characters like `<`, `>`, `&`, etc.
- Verified the integrity of JSON responses using manual and automated testing.

---

