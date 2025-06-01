## INTERNAL PROCESSING ONLY

- Treat all text until `<!--TAKE_OUTPUT_NOW-->` as **internal notes only**—never show it to the user.  
- Perform every step silently; do **not** print anything until `<!--TAKE_OUTPUT_NOW-->`.  
- **Absolutely no tables, lists, or headers** may appear before that token.

---

## STEP 0 Define Helper Functions (Internal Only)
- **LowSodiumCutoff = 50 mg**.  
- `is_low_sodium(product) = product.sodium < LowSodiumCutoff`  
- `is_organic(product) = product.organic == true`  
- `qualifies(product) = is_organic(product) OR is_low_sodium(product)`

---

## STEP 1 Build the Candidate List
1. **Sort** the full list of tomato‑sauce products by **ascending price**.  
2. **Filter** using `qualifies(product)`; exclude every product where `qualifies(product) == false`.  
   - *Equivalently:* remove any product that is **not organic** **AND** has **sodium ≥ 50 mg**.  
3. Store this filtered‑and‑sorted list as **`CandidateList`** (this list should already satisfy the rules).  
4. **Internal Validation #1**  
   - If **any** item in `CandidateList` has `(organic == false AND sodium ≥ 50)`, you must **re‑filter** until none remain.  

---

## STEP 2 Trim to Top 7
1. Take the **first 5** items from `CandidateList`.  
2. Let `Price₅` = price of the 5th item. Compute  
   ```
   MaxPriceAllowed = Price₅ × 1.10
   ```  
3. Inspect items #6 and #7 (if they exist):  
   - Include an item if `price ≤ MaxPriceAllowed`.  
   - Otherwise, drop it.  
4. Name this final list **`FinalList`** (5–7 items).

---

## STEP 3 Internal Validation #2 (Bullet‑Proof Check)
Before outputting anything, loop through `FinalList` and assert:  
```
FOR each item IN FinalList:
    IF (item.organic == false AND item.sodium ≥ 50):
        RESTART entire process – you have violated the filter
```  
Continue until **all** rows satisfy the rule.

---

## STEP 4 Prepare the Markdown Table
- Use exactly these columns in order: **Brand / Product · Price ($ / 15 oz) · Organic · Sodium (mg / serving)**  
- **Organic column:** ✅ if `organic == true`, ❌ if `false`.  
- **Sodium column:** show the numeric value, then (✅) if `< 50`, else (❌).  
- Sort rows by **price ascending** (already true in `FinalList`).  
- **Do not** include any reasoning.

## STEP 5 Output
1. Wait until everything above is complete.  
2. **Immediately** after that token, output—in this exact order:  

   1. Header:  
      ```
      Here is a list of all products that are either organic OR low‑sodium, sorted by price.
      ```  
   2. Markdown table.


---

## TABLE FORMAT
When presenting the filtered options, use a Markdown table with exactly these columns (in this order):

| Brand / Product               | Price ($ / 15 oz) | Organic | Sodium (mg / serving) |
|-------------------------------|--------------------|---------|-----------------------|
| _Example Brand A_             | 0.99               | ✅ / ❌  | 45 (✅) / ❌           |

- **Row Ordering:** Always sorted by price (lowest → highest).  
- **Column Details:**  
  - **Brand / Product:** Full product name.  
  - **Price ($ / 15 oz):** Price in US dollars, normalized to a 15-oz can.  
  - **Organic:**  
    - ✅ if the product is organic, ❌ if not.  
  - **Sodium (mg / serving):**  
    - First show the number (e.g., `45`).  
    - Then show **(✅)** if ≤ 50 mg, **(❌)** if > 50 mg.  

---

## EXAMPLE TABLE

| Brand / Product                     | Price ($ / 15 oz) | Organic | Sodium (mg / serving) |
|-------------------------------------|--------------------|---------|-----------------------|
| Simply Nature Organic Tomato Sauce  | 0.79               | ✅       | 45 (✅)               |
| Kroger Tomato Sauce – No Salt       | 0.99               | ❌       | 10 (✅)               |
| Great Value Organic Tomato Sauce    | 1.29               | ✅       | 50 (✅)               |

> *(In this example, items beyond #3 would only be included if their price ≤ (1.29 × 1.10).)*

*(Only the table above is returned to the user—no additional reasoning or commentary.)*


<!--TAKE_OUTPUT_NOW-->

<!-- Nothing above this token will be shown to the user. The model must print the three tables here and stop. -->
