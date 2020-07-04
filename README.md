# trump-merch-abandon-cart

This script uses the puppeteer framework to repeatedly automatically load the cart full on Trump's Merch website https://shop.donaldjtrump.com without the need for a human and then abandons the cart. Such abandonment often ruins e-commerce metrics and costs companies trillions of dollars. This is an automated way to cause havoc to Trump's campaign.

### Dependencies

Run `npm install` to install all dependencies.

The browser runs in a headless state by default, all that is required is a CLI window.

### Running

To run a single cycle, run `node index.js`

To automatically loop cycles, run `node index.js --loop`

To add a threshold for a cart subtotal size, do `node index.js -t 69420` which will set a threshold at $69,420 USD to drop the cart.

### Metrics

Metrics are stored in `metrics.json` such as the largest cart dumped, the total number of cycles run, and the total amount dumped across every run.

### Updating

The Donald Trump Shopify Store may occasionally remove or add products. The list of valid product urls is stored at `scraper/producturls.txt` To update the list of URLs of products across the entire shopify store, enter:

```
cd scraper
rm producturls.txt
python3 shopify.py https://shop.donaldjtrump.com
```

This will delete the old list and download a new list via the scraper tool.

### Misc

Thank you for checking out this code, you can use it for whatever you want!
If you would like to contribute or submit issues, feel free to put in PRs or Issues :)