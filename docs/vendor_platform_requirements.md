# Vendor Platform Requirements & Data Mapping

This document consolidates the platform's vendor registration requirements, admin fields, display rules, and pending tasks.

## 1. Company Info

| Tag | Field Name (Registration / Admin) | Public View | Required | Premium | Notes & To Do |
|:---|:---|:---:|:---:|:---:|:---|
| **1** | Business Name / slug | Yes | **Yes** | | |
| **2** | Primary Category | Yes | **Yes** | | |
| **3** | Other Categories | Yes | | **Yes** | |
| **5** | Email Address | Yes | **Yes** | | |
| **6** | Phone | Yes | | | |
| **8** | Website / Website URL | Yes | | **Yes** | Standardize to Website |
| **12** | Address | Yes | | | |
| **10** | Region / location text | Yes | **Yes** | | Standardize to Region |
| **11** | City | Yes | **Yes** | | Standardize to "City/Wedding Center"; For Public view, City comes before Region |
| **13** | Business Description / About Us | Yes | | | Standardize to "What Makes Us Unique" |
| **19** | Affiliations | Yes | | | |
| **20** | Social Media / Social Links | Yes | | **Yes** | Standardize to Social Media |
| **15** | Logo | Yes | **Yes** | | |
| **14** | Cover Photo | Yes | **Yes** | | |
| **23** | Themes | Yes | | | Standardize to Themes Specialization; Add All / Any |

---

## 2. Admin Info

| Tag | Field Name | Public View | Notes & To Do |
|:---|:---|:---:|:---|
| **4** | Plan | No | Allow submission of docs just like in "Claim This vendor": add date of expiry required field; not editable/deletable |
| **7** | SEC / DTI | No | |
| **9** | Contact Person | No | Standardize to Contact Person 1 |
| | Position / Designation | No | |
| | Contact Person | No | Standardize to Contact Person 2 |
| | Position / Designation | No | |
| **17** | Admin email / Contact Email | No | Standardize to Admin Email 1 |
| **17a** | [Admin email 2] | No | Standardize to Admin Email 2 |
| **17b** | [Admin email 3] | No | Standardize to Admin Email 3 |
| **18** | Admin phone / Contact Phone | No | Standardize to Admin Phone 1 |
| **18a** | [Admin phone 2] | No | Standardize to Admin Phone 2 |
| **18b** | [Admin phone 3] | No | Standardize to Admin Phone 3 |
| **16** | Credit/Debit card number | No | Not mandatory for now; follow payment gateway protocol after choosing plan |

---

## 3. Once Logged In Features
> **Note:** *"Submit and log in again to add promos, pics, and vid links"*

| Tag | Feature | Public View | Premium | Notes |
|:---|:---|:---:|:---:|:---|
| **24** | Promos | Yes | **Yes** | Full page shows |
| **25** | Albums | Yes | **Yes** | Full page shows |
| | Pics | Yes | | |
| | Videos | Yes | | |

---

## 4. T&M Info

| Tag | Field Name | Public View | Rules / Editable By | Notes & To Do |
|:---|:---|:---:|:---|:---|
| **22** | Document Verification | Yes | Must be editable only by T&M | **Standardize to "Professional Status" radio boxes:**<br>• **VERIFIED** (With DTI / SEC / BIR docs submitted) - *Blue check badge*<br>• **Verification In Progress** (Awaiting submission of docs: up to 1 month from registration) - *Yellow text*<br>• **Community Recognized** (Known in the community as legit/trustworthy) - *Pink check badge*<br>• **Established Professional** (At least 10 years in business) - *Green "10" badge*<br><br>*(Note: Tooltips/descriptions will appear when hovered)* |
| **24** | Reviews | Yes | Must be editable only by T&M | |
| **24** | Business Docs Submitted | Yes | Must be editable only by T&M | |

---

## 5. Other Requirements & Next Phases

1. **Location Formatting:** Add Region beside City under Business Name in Public View.
2. **QR Code:** Add QR Code feature in Public View.
3. **Metrics Tracking:** Investigate adding metrics (Number of inquiries, times viewed per day/month, etc.).
4. **Marketplace Provision:** Prepare provision for Marketplace (Next Phase).
5. **Editing Previews:** Allow vendors to Preview their public page while editing.
