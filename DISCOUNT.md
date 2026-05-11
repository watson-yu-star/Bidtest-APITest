"# discount" 
 ## 1 Clarifying questions you would ask the product owner / devs before starting.

     Tax/Shipping: Is the $100 threshold based on the subtotal before or after tax and shipping?
     Stacking: Can this discount be combined with other promo codes or category-specific discounts(like clearance product)?
     Rounding: How should we handle fractions of a cent (e.g., a $10.05 discount)? Do we round down or to the nearest cent?Visuals: Should the customer see the "potential discount" in the cart before they hit $100 to encourage more spending?

## 2 What you would need to change or add across the API, the UI, and the data model.

    Data Model:
    Add a discount_amount and original_subtotal field to the Order schema to audit what was actually paid versus the list price.
    
    API:
    Update the cart and order logic apply a 0.9 multiplier to the subtotal if it exceeds $100.Ensure the validation logic re-calculates this on the server to prevent "price injection" from the front end.
    
    UI:
    Cart Page: Add a line item for "Volume Discount (10%)" showing a negative value.
    Checkout: Ensure the "Total" reflects the discounted price clearly.

## 3 Your **test strategy** for this feature 
    Unit Tests:
      Test the calculation logic with boundary values: $99.99 (no discount), $100.00 (no discount? or starts here?), and $100.01 (discount applied).
    Integration Tests:
      Verify the API returns the correct total in the JSON response when multiple items are added to a cart.
    E2E Tests (Playwright):
      Scenario A: Add a $110 item → Verify discount is visible and total is $99.00.
      Scenario B: Add a $50 item → Verify no discount appears → Add another $60 item → Verify discount appears dynamically.
## 4  How you would validate that the feature doesn't break existing
    Order History:
      Verify that viewing old orders doesn't trigger the new logic (discounts should only apply to new transactions).
    Existing Promo:
      Run existing tests for promo codes to ensure the new auto-discount doesn't double-dip (unless intended).
    Turn Off feature:
      It should disable the new auto-discount.

## 5 Anything you'd want in place before shipping.
    Feature Flag:
      Deploy the code behind a toggle so we can turn the discount off immediately if a calculation error is discovered.
    Monitoring/Alerts: 
      Set up a dashboard to track the ratio of "Discounted Orders" vs "Normal Orders" to monitor the financial impact.
