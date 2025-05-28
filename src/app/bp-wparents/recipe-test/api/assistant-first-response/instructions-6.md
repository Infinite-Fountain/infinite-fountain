The user had options, you will respond depending on his answer:

## Answered: “I care about both low salt and organic, even if that means paying more (up to about $2.00 to $2.50… vs $1.00 to $1.50).”

See the full list of tomato sauces

You mission is to give him a final table of recommendations.

create a “both match” list. ascending in price. all have to be organic AND lower than 50 mg sodium

If the list is smaller than 3 products. Then print the list with a relevant header explaining that this is the recommended list because…

And print 2 secondary lisst, with a header clearly explaining that is a backup because we had few options.

The first secondary list:

-has 3 products
-does not include the products from the “both match” list
-has to be all organic
-is ordered by ascending sodium level 

The other secondary list:
-has 3 products
-does not include the products from the “both match” list
-all are 50 mg or less of sodium
-is ordered by ascending price


DOUBLE CHECK GREEN AND RED MARKS
Make sure all the products that are organic have their green mark
Make sure that all the products with sodium above 50 mg have a red mark

## Answered: “I’d like a good deal but with at least one perk—either organic or lower sodium.”

See the full list of tomato sauces

You mission is to give him a final table of recommendations.

The first filter you have to do is, all the products have to be either organic or less than 50 mg in salt.

As “good deal” is his priority, make the list ascending in price.


The max amount of options is 7 (to not overwhelm)

First create a top 5 list.

Take the price of item number 5 and multiply it by 1.1. This is the max price allowed for this list.

DOUBLE CHECK PRICE:
If the 6th and/or 7th options have a price lower than the “allowed”, include them.
Before printing the list, double check the price of items 6 and 7, and make sure they are below the “allowed” mark.

DOUBLE CHECK GREEN AND RED MARKS
Make sure all the products that are organic have their green mark
Make sure that all the products with sodium above 50 mg have a red mark

## answered: “I want the cheapest sauce I can find (under $1.20), even if it has high sodium (salt) or is not organic.”

See the full list of tomato sauces

You mission is to give him a final table of recommendations.

Create a list ascending in price. Ignoring any other variable.

If the list is smaller than 3 products. Then print the list with a relevant header explaining that this is the recommended list because…

The max amount of options is 7 (to not overwhelm)

First create a top 5 list.

Take the price of item number 5 and multiply it by 1.1. This is the max price allowed for this list.

DOUBLE CHECK PRICE:
If the 6th and/or 7th options have a price lower than the “allowed”, include them.
Before printing the list, double check the price of items 6 and 7, and make sure they are below the “allowed” mark.

DOUBLE CHECK GREEN AND RED MARKS
Make sure all the products that are organic have their green mark
Make sure that all the products with sodium above 50 mg have a red mark

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
