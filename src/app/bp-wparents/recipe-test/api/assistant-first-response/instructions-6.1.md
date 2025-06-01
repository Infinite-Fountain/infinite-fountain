## INTERNAL PROCESSING ONLY

- From here on, treat every instruction (until you see `<!--TAKE_OUTPUT_NOW-->`) as **internal notes only**—do **not** output any of them.
- Do **all** sorting, filtering, and list building in your “head.” Do **not** print any tables, lists, or headers before `<!--TAKE_OUTPUT_NOW-->`.
- Any text you see until `<!--TAKE_OUTPUT_NOW-->` must be suppressed from the user. Only once you reach that marker are you allowed to print.

---

## STEP 1 Lookup for products that match both features
1. **Sort** the full list of tomato-sauce products in **ascending order** by price.  
2. **Filter** to keep only those products that satisfy **both**:
   - **Organic = true**, **AND**
   - **Sodium < 50 mg** per serving.  
3. Internally name this filtered-and-sorted list **“Both Match.”**
4. **Do not** output the “Both Match” table or any tables at this point—remain silent until STEP 2 and STEP 3 are done.

---

## STEP 2 Determine If Secondary Lists Are Needed
1. **Always** build these two secondary lists, even if “Both Match” has ≥ 3 items:
   - **Secondary A**: Pick exactly **3** products **not in “Both Match”**, each with `organic = true`. Sort A by ascending sodium.
   - **Secondary B**: Pick exactly **3** products **not in “Both Match” or Secondary A**, each with `sodium < 50 mg`. Sort B by ascending price.
2. **Do not** output anything yet—keep both lists in memory.

---

## STEP 3 Final Confirmation & Table Formatting
1. Now that you have “Both Match,” Secondary A, and Secondary B fully built, you may prepare your Markdown tables.
2. **Do not** print anything until you see `<!--TAKE_OUTPUT_NOW-->`.
3. When you are ready to output, you must begin your response with:

   ```
   <!--TAKE_OUTPUT_NOW-->
   ```

4. **Immediately** after that line, print exactly:
   - A header for “Both Match”:
     ```
     Recommended: All products that are both organic AND low‐sodium.
     ```
   - The Markdown table for “Both Match” (sorted by price).
   - If “Both Match” has fewer than 3 items, also print:
     1. The header:
        ```
        Backup A: Top 3 organic products (if fewer than 3 ‘Both Match’).
        ```
     2. The Markdown table for Secondary A (sorted by sodium).
     3. The header:
        ```
        Backup B: Top 3 low‐sodium products (if fewer than 3 ‘Both Match’).
        ```
     4. The Markdown table for Secondary B (sorted by price).

5. After printing those tables, do **not** add any further text, reasoning, or commentary.

---

## EXAMPLE (if “Both Match” ≥ 3)
```
Recommended: All products that are both organic AND low‐sodium.

| Brand / Product                  | Price ($ / 15 oz) | Organic | Sodium (mg / serving) |
|----------------------------------|--------------------|---------|-----------------------|
| Trader Joe’s Organic Tomato Sauce | 1.49               | ✅       | 20 (✅)               |
| Kroger Organic No‐Salt Tomato Sauce | 1.75             | ✅       | 10 (✅)               |
| Simply Truth Organic No‐Salt       | 1.95             | ✅       | 15 (✅)               |
```

*(Only the table and its header are returned—no additional text.)*

---

## EXAMPLE (if “Both Match” < 3)
```
Recommended: All products that are both organic AND low‐sodium.

| Brand / Product                  | Price ($ / 15 oz) | Organic | Sodium (mg / serving) |
|----------------------------------|--------------------|---------|-----------------------|
| Trader Joe’s Organic Tomato Sauce | 1.49               | ✅       | 20 (✅)               |
| Simply Trim Organic No‐Salt       | 2.10               | ✅       | 15 (✅)               |

Backup A: Top 3 organic products (if fewer than 3 “Both Match”).

| Brand / Product                     | Price ($ / 15 oz) | Organic | Sodium (mg / serving) |
|-------------------------------------|--------------------|---------|-----------------------|
| Simply Nature Organic Tomato Sauce  | 0.79               | ✅       | 250 (❌)              |
| Great Value Organic Tomato Sauce    | 1.58               | ✅       | 220 (❌)              |
| 365 Organic Tomato Sauce            | 1.69               | ✅       | 320 (❌)              |

Backup B: Top 3 low‐sodium products (if fewer than 3 “Both Match”).

| Brand / Product                   | Price ($ / 15 oz) | Organic | Sodium (mg / serving) |
|-----------------------------------|--------------------|---------|-----------------------|
| Kroger Tomato Sauce – No Salt     | 1.00               | ❌       | 10 (✅)               |
| Hunt’s Tomato Sauce – No Salt     | 2.09               | ❌       | 15 (✅)               |
| Publix Tomato Sauce – No Salt     | 2.53               | ❌       | 10 (✅)               |
```

*(Only the headers and tables above are returned—no additional text.)*
