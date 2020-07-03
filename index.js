var myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);

const puppeteer = require('puppeteer');
const readline = require('readline');
const fs = require('fs');

const lineReader = require('line-reader');
const { exit } = require('process');
//Promise = require('bluebird');

const jsonfile = require('jsonfile')

const urlPathGlobal = "scraper/producturls.txt"
const metricsPathGlobal = "metrics.json";
const editJsonFile = require("edit-json-file");
let metricsPath = editJsonFile(`${__dirname}/metrics.json`);
var subtotalSession = 0;

var objReadMetricsGlobal;


var objMetricsEdit;
//Create Metrics File if it doesn't exist

metricsPath.set("planet", "Earth");
metricsPath.save();

var urlArray = [];

//Transfer txt file into array
lineReader.eachLine(urlPathGlobal, function(line) {
    urlArray.push(line);
});

async function run () {
    //browser on?
        //const browser = await puppeteer.launch({headless: false});
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({width: 3840, height: 2160});

    await page.setDefaultNavigationTimeout(0);
    await page.setDefaultTimeout(0);

    async function waitForCheckoutPage() {
        try {
            await page.waitForSelector('html > body > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > main > div > div:nth-of-type(2) > form > div:nth-of-type(2) > div:nth-of-type(2) > div > div > div:nth-of-type(4) > label', {timeout: 7000});
            return true;
          } catch (e36652234) {
              //console.log(e36652234)
            console.log("Checkout page waiting for too long!");
            //await page.screenshot({path: 'screenshots/toolongcheckout.png', fullPage: true});
            return false;
          }
    
}

    async function subtotal() {
        //Calculate total $$$ dumped
    checkoutAmount = await page.evaluate(() => document.querySelector('html > body > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > main > div > div:nth-of-type(2) > form > div:nth-of-type(2) > div:nth-of-type(4) > div:nth-of-type(2) > p:nth-of-type(1)').textContent);
    console.log('Subtotal: ' + checkoutAmount);
    subtotalSession = parseFloat(checkoutAmount.replace(new RegExp('[$,]', 'g'), ''));
    return checkoutAmount;
    }

    async function repeatNetworkErr(sendItemUrl) {
        try {
            await page.goto(sendItemUrl, {"waitUntil" : "networkidle0", timeout: 10000});
          } catch (e) {
            repeatNetworkErr(sendItemUrl)
          }
    }

    async function addNewItem(itemUrl) {
       try {
        console.log("loading: " + itemUrl);
        await repeatNetworkErr(itemUrl);
        console.log("went to " + itemUrl);
       //await page.screenshot({path: 'screenshots/trump1.png', fullPage: true});
        //number of items selection dropdown click
        try {
            await page.waitForSelector('#shopify-section-product > main > div.vp-80 > div > div.product-detail > form > div.info > div.product-options > div > div > span > span.selection > span > span.select2-selection__arrow');

          } catch {
              //if dropdown on product screen doesn't load, reload and start over...
            console.log('not found');
            await addNewItem(itemUrl);

            return;
          }

          await page.click("#shopify-section-product > main > div.vp-80 > div > div.product-detail > form > div.info > div.product-options > div > div > span > span.selection > span > span.select2-selection__arrow");

            console.log("dropdown selection clicked");
        //await page.screenshot({path: 'screenshots/trump2.png', fullPage: true});
        //Maximum number of item in cart
        try {
            await page.waitForSelector('html > body > span > span > span:nth-of-type(2) > ul > li:last-child');

          } catch {
              //if last elem dropdown on product screen doesn't load, reload and start over...
            console.log('not found');
            await addNewItem(itemUrl);

            return;
          }


        await page.click("html > body > span > span > span:nth-of-type(2) > ul > li:last-child")
        console.log("clicked last child")
        //await page.screenshot({path: 'screenshots/trump3.png', fullPage: true});
        //Click add to cart
        await page.click("html > body > div:nth-of-type(1) > div:nth-of-type(2) > div > main > div:nth-of-type(1) > div > div:nth-of-type(1) > form > div:nth-of-type(2) > div:nth-of-type(3) > button")
        console.log("clicked checkout")
        //await page.screenshot({path: 'screenshots/trump1.png', fullPage: true});
        //await page.screenshot({path: 'screenshots/trump4.png', fullPage: true});
        try {
            await page.waitForNavigation({ waitUntil: 'networkidle0', timeout:20000});

          } catch {
              //if checkout screen doesn't load, reload and start over...
            console.log('checkout not loading, skip');
            //await addNewItem(itemUrl);

            return;
          }
        
        if(await waitForCheckoutPage()) {await subtotal();} else {
            //await addNewItem(itemUrl)
        
        return;
        };
        
        //await page.waitForNavigation({ waitUntil: 'networkidle0' });
       } catch (e) {
            console.log("Error! noooooo");
            console.log(e);
            console.log('trying again...');
            await addNewItem(itemUrl);
            return;
       }
    }

     
    //Add all items

    async function shopifySpree () {
      
        for (const eachUrl of urlArray) {
            //console.log(file);
          await addNewItem(eachUrl);
        }
      }

      //Start going HAM
    await shopifySpree();
    //await addNewItem("https://shop.donaldjtrump.com/products/trump-pence-snowflake-gift-wrapping-paper");
    //await addNewItem("https://shop.donaldjtrump.com/products/official-make-america-great-again-45th-president-hat-red");
    //Additional $25 contribution
    
    //await page.click("html > body > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > main > div > div:nth-of-type(2) > form > div:nth-of-type(2) > div:nth-of-type(2) > div > div > div:nth-of-type(4) > input");

    await subtotal();

    newSubtotalAmountCalc = 0;

        if(metricsPath.get("totalSubtotalDumped") == null) {
            //If totalSubtotalDumped Doesn't exist, create it
            newSubtotalAmountCalc = subtotalSession
            metricsPath.set("totalSubtotalDumped",subtotalSession)
        } else 
        {
            //Add to previous total
            newSubtotalAmountCalc = subtotalSession + metricsPath.get("totalSubtotalDumped");
            metricsPath.set("totalSubtotalDumped",newSubtotalAmountCalc)
        }
        
        //How many times run
        if(metricsPath.get("totalCyclesRun") == null) {
            metricsPath.set("totalCyclesRun",1)  
        } else {
        metricsPath.set("totalCyclesRun",metricsPath.get("totalCyclesRun") + 1)
        }

        //Record Cart
        if(metricsPath.get("biggestCartEver") == null || subtotalSession > metricsPath.get("biggestCartEver")) {
            //only set new cart record if cart record is empty or if current cart is bigger than previous cart
            metricsPath.set("biggestCartEver",subtotalSession)  
            //screenshot if argv is --screenshot
            if (myArgs.includes("--screenshot")) {
                await page.screenshot({path: 'screenshots/trumpcartrecord.png', fullPage: true});
            }

        }

        //Write new Metrics
        metricsPath.save();

    //await page.screenshot({path: 'screenshots/trump' + Date.now() + '.png', fullPage: true});
    console.log("Dumping Cart...")
    await browser.close();
    console.log("Cart Dumped Successfully")
}

//console.log('myArgs: ', myArgs);

async function bringthepainon() {
   /* switch (myArgs[0]) {
        case '--loop':
            while (true)  async _ => {
                await run();
                break;
            }
        default:
            run();
        }*/
        await run();
}

bringthepainon()
