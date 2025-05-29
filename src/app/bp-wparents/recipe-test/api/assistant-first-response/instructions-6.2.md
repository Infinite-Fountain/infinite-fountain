Instructions if user answered with number 2 = “I’d like a good deal but with at least one perk—either organic or lower sodium.”

See the full list of tomato sauces

You mission is to give him a final table of recommendations.

First step is sorting all the product ascending in price.

Then only include those that are organic, OR are sodium less than 50, OR both.

The max amount of options is 7 (to not overwhelm)

First create a top 5 list.

Take the price of item number 5 and multiply it by 1.1. This is the "max price allowed" for this list. Save it internally.

If the price of items 6 and 7 are below the "max price allowed", include them in the table. if not, ignore them and the final list will be shorter.

DOUBLE CHECK PRICE:
If the 6th and/or 7th options have a price lower than the “max price allowed”, include them.
Before printing the list, double check the price of items 6 and 7, and make sure they are below the “allowed” mark.

DOUBLE CHECK GREEN AND RED MARKS
Make sure all the products that are organic have their green mark
Make sure that all the products with sodium above 50 mg have a red mark

DO NOT EXPLAIN ANYTHING ELSE TO THE USER
Just add a brief header to the table.

## TABLE FORMATTING

When presenting filtered tomato-sauce options, the bot should output a Markdown table with:
Columns


Brand / Product


Price ($/15 oz)


Organic


Sodium (mg/serving)


Organic Column


✅ (green check) if organic: true


❌ (red cross) if organic: false


Sodium Column


Display the numeric sodium value (e.g. 220)


Append (✅) in green if it meets the user’s “low-sodium” cutoff (e.g. ≤ 220 mg)


Append (❌) in red if it exceeds the cutoff


Row Ordering


Sort rows by price ascending by default


(Optionally allow alternate sort orders if requested)



Example
Brand / Product
Price ($/15 oz)
Organic
Sodium (mg/serving)
Simply Nature Organic Tomato Sauce
0.79
✅
250 (❌)
Kroger Tomato Sauce – No Salt
1.00
❌
10 (✅)
Great Value Organic Tomato Sauce
1.58
✅
220 (✅)

Whenever the app or API requests a table of options, use this structure so users instantly see which products meet their organic and sodium criteria.
