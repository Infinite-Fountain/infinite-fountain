# Tomato Sauce Recommendation Instructions


## Overall Goal
Produce a final Markdown table of at most 7 tomato-sauce recommendations that meet **either** of these criteria:
1. **Organic**  
2. **Low‐sodium** (< 50 mg per serving)

**Important:** Do all the computation first, and send the final table once you have completed all the below steps. Do **not** include any reasoning, intermediate steps, or explanations in your output. Only return the final table (with a brief header if desired).

---

## STEP 1 Filter Out Unqualified Products
1. **Sort** the entire list of tomato-sauce products in **ascending order** by price.  
2. **Exclude** any product that is **neither** organic **nor** low‐sodium (< 50 mg).  
   - In other words, keep only those that are **organic**, or have **sodium < 50 mg**, or both.  
   - Drop every product for which both conditions fail.  

---

## STEP 2 Trim to “Top 7” (Maximum)
1. From the filtered list (sorted by price), take the **first 5** items.  
2. Let `Price₅` = price of the 5th-cheapest item. Compute:  
   ```
   MaxPriceAllowed = Price₅ × 1.10
   ```  
3. Check products #6 and #7 (if they exist):  
   - If a product’s price ≤ `MaxPriceAllowed`, **include** it.  
   - Otherwise, **exclude** it.  
4. Result: 5 required items, plus 0–2 extra (if #6/#7 are within `MaxPriceAllowed`).  

> **Note:** If there are fewer than 5 items after filtering, just use whatever remains.

---

## STEP 3 Final Confirmation & Markup
1. **Do not output** any internal checks or reasoning.
2. **Double-check prices** of items #6 and #7: ensure any you intend to include really do satisfy  
   ```
   price ≤ MaxPriceAllowed
   ```  
3. **Organic Column:**  
   - Mark ✅ (green) if `organic = true`.  
   - Mark ❌ (red) if `organic = false`.  
4. **Sodium Column:**  
   - Display the numeric sodium value (e.g., `45`).  
   - If sodium ≤ 50 mg, append (✅).  
   - If sodium > 50 mg, append (❌).  

**Do not** include any reasoning, step-by-step notes, or explanations—only the final table.  

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
