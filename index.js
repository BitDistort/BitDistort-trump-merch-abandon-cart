const puppeteer = require('puppeteer');
const readline = require('readline');
const fs = require('fs');

const lineReader = require('line-reader');
Promise = require('bluebird');

urlPathGlobal = "scraper/producturls.txt"

var urlArray = [];

lineReader.eachLine(urlPathGlobal, function(line) {
    urlArray.push(line);
});

async function run () {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({width: 3840, height: 2160});

    async function waitForCheckoutPage() {
    await page.waitForSelector('html > body > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > main > div > div:nth-of-type(2) > form > div:nth-of-type(2) > div:nth-of-type(2) > div > div > div:nth-of-type(4) > label');
    }

    async function addNewItem(itemUrl) {
        await page.goto(itemUrl, {"waitUntil" : "networkidle0"});
        console.log("went to " + itemUrl);
       // await page.screenshot({path: 'screenshots/trump1.png', fullPage: true});
        //number of items selection dropdown click
        await page.click("#shopify-section-product > main > div.vp-80 > div > div.product-detail > form > div.info > div.product-options > div > div > span > span.selection > span > span.select2-selection__arrow");
        //await page.screenshot({path: 'screenshots/trump2.png', fullPage: true});
        //Maximum number of item in cart
        await page.click("html > body > span > span > span:nth-of-type(2) > ul > li:last-child")
        //await page.screenshot({path: 'screenshots/trump3.png', fullPage: true});
        //Click add to cart
        await page.click("html > body > div:nth-of-type(1) > div:nth-of-type(2) > div > main > div:nth-of-type(1) > div > div:nth-of-type(1) > form > div:nth-of-type(2) > div:nth-of-type(3) > button")
        //await page.screenshot({path: 'screenshots/trump1.png', fullPage: true});
        //await page.screenshot({path: 'screenshots/trump4.png', fullPage: true});
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await waitForCheckoutPage();
    }

        //run add new item on every single product.
      urlArray.forEach(async (element) => await addNewItem(element));

    //await addNewItem("https://shop.donaldjtrump.com/products/trump-pence-snowflake-gift-wrapping-paper");
   // await addNewItem("https://shop.donaldjtrump.com/products/official-make-america-great-again-45th-president-hat-red");
    //Additional $25 contribution
    
    //await page.click("html > body > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > main > div > div:nth-of-type(2) > form > div:nth-of-type(2) > div:nth-of-type(2) > div > div > div:nth-of-type(4) > input");

    //Calculate total $$$ dumped
    checkoutAmount = await page.evaluate(() => document.querySelector('html > body > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > main > div > div:nth-of-type(2) > form > div:nth-of-type(2) > div:nth-of-type(4) > div:nth-of-type(2) > p:nth-of-type(1)').textContent);
    console.log('Subtotal: ' + checkoutAmount);
    await page.screenshot({path: 'screenshots/trump.png', fullPage: true});
    console.log("Dumping Cart...")
    browser.close();
    console.log("Cart Dumped Successfully")
}
run();