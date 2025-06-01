## INTERNAL PROCESSING ONLY

- Treat every instruction until you see `<!--TAKE_OUTPUT_NOW-->` as **internal notes only**—do **not** output them.
- Perform **all** sorting, filtering, and list building in your “head.” Do **not** print any tables, lists, or headers before `<!--TAKE_OUTPUT_NOW-->`.
- Suppress all content up to and including this point from the user.

---

## STEP 1 Identify Products That Match Both Features
1. **Sort** the full list of tomato-sauce products in **ascending order** by price.  
2. **Filter** to keep only those products where:  
   - **Organic = true**, **AND**  
   - **Sodium < 50 mg** per serving.  
3. Internally name this filtered‑and‑sorted list **“Both Match.”**  
4. **Do not** output anything yet—proceed to STEP 2.

---

## STEP 2 Build Secondary Lists (Always Required)
Create two additional lists, regardless of how many items are in “Both Match”:

- **Secondary A**  
  - Exactly **3** products **not in “Both Match.”**  
  - Each must have `organic = true`.  
  - Sort by **ascending sodium**.

- **Secondary B**  
  - Exactly **3** products **not in “Both Match” or Secondary A.**  
  - Each must have `sodium < 50 mg`.  
  - Sort by **ascending price**.

Keep both lists internal; do **not** output yet.

---

## STEP 3 Final Confirmation & Table Formatting
1. Ensure you now have three lists: “Both Match,” Secondary A, Secondary B.  
2. **Do not** print anything until you see `<!--TAKE_OUTPUT_NOW-->`.  
3. When ready, start your response with **exactly**:


4. **Immediately** after that token, output—in this exact order:  

   1. Header:  
      ```
      Recommended: All products that are both organic AND low‑sodium.
      ```  
   2. Markdown table for **Both Match** (sorted by price).  
   3. Header:  
      ```
      In case the first list is too short, I am giving you also:
      *Top 3 organic products (but with higher salt)*
      ```  
   4. Markdown table for **Secondary A** (sorted by sodium).  
   5. Header:  
      ```
      Aslo, I am giving you:
      *Top 3 low salt products (but not organic)*
      ```  
   6. Markdown table for **Secondary B** (sorted by price).

5. After printing the three tables, output **nothing else**—no reasoning, commentary, or extra lines.

---

### Table Template (use for all three tables)

| Brand / Product | Price ($ / 15 oz) | Organic | Sodium (mg / serving) |
|-----------------|-------------------|---------|-----------------------|
| _Example_       | 1.23              | ✅/❌   | 45 (✅) / 220 (❌)     |

- **Organic column:** ✅ if `organic = true`, ❌ if `organic = false`.  
- **Sodium column:** show the numeric value, then (✅) if ≤ 50 mg, else (❌).

---

<!--TAKE_OUTPUT_NOW-->

<!-- Nothing above this token will be shown to the user. The model must print the three tables here and stop. -->
