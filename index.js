var myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);

var checkOutDidntLoad = false;

const {program} = require('commander');

program
  .option('-t, --threshold <threshold>', 'Threshold reached before before dropping cart')
  .option('--screenshot', 'Screenshots record breaking cart subtotals')
  .option('--short', 'Only runs 2 selected items. DEVELOPER ONLY!')
  .option('-l, --loop', 'Automatically loops script');
 // .option('-p, --pizza-type <type>', 'flavour of pizza');

  program.parse(process.argv);

  //if (program.threshold) console.log(`${program.threshold}`);

var cartThreshold;

//console.log(`${program.threshold}`)

if(`${program.threshold}`) {
    console.log(
        `Limiting to Maximum Cart Subtotal of ${program.threshold} USD.`
      );
      cartThreshold = parseFloat(`${program.threshold}`.replace(new RegExp('[$,]', 'g'), ''));
} else { cartThreshold = 0;}

const puppeteer = require('puppeteer');
const readline = require('readline');
const fs = require('fs');

var shuffle = require('shuffle-array');

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

var checkoutLoadstart;


var objMetricsEdit;
//Create Metrics File if it doesn't exist

metricsPath.set("planet", "Earth");
metricsPath.save();

var urlArray = [];

//Transfer txt file into array
lineReader.eachLine(urlPathGlobal, function(line) {
    urlArray.push(line);
    //Randomize array
    urlArray = shuffle(urlArray);
});

async function run () {
    //randomize array again
    urlArray = shuffle(urlArray);

    //browser on?
        //const browser = await puppeteer.launch({headless: false});
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({width: 3840, height: 2160});

    await page.setDefaultNavigationTimeout(0);
    await page.setDefaultTimeout(0);

    async function waitForCheckoutPage() {
        try {
            checkoutLoadstart = Date.now();
            await page.waitForSelector('html > body > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > main > div > div:nth-of-type(2) > form > div:nth-of-type(2) > div:nth-of-type(2) > div > div > div:nth-of-type(4) > label', {timeout: 7000});
            //await page.waitForSelector('#shopify-section-product > main > div:nth-of-type(1) > div > div:nth-of-type(1) > form > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(2) > div > span > span:nth-of-type(1) > span > span:nth-of-type(2)', {timeout: 7000});
            ////////////////////////////#shopify-section-product > main > div:nth-of-type(1) > div > div:nth-of-type(1) > form > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(2) > div > span > span:nth-of-type(1) > span > span:nth-of-type(2)
            checkOutDidntLoad = false;
            return true;
          } catch (e36652234) {
              //console.log(e36652234)
            console.log("Checkout page waiting for too long!");
            checkOutDidntLoad = true;
            //await page.screenshot({path: 'screenshots/toolongcheckout.png', fullPage: true});

            return false;
          }
    
}

    async function subtotal() {
        //Calculate total $$$ dumped
        try {
    checkoutAmount = await page.evaluate(() => document.querySelector('html > body > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > main > div > div:nth-of-type(2) > form > div:nth-of-type(2) > div:nth-of-type(4) > div:nth-of-type(2) > p:nth-of-type(1)').textContent);
    console.log('Subtotal: ' + checkoutAmount);
    subtotalSession = parseFloat(checkoutAmount.replace(new RegExp('[$,]', 'g'), ''));
    //checkOutDidntLoad = false;
    return checkoutAmount;
        }
        catch (checkoutformnotloading) {
            //bruh
        }
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
        //number of items selection dropdown click
        try {
            console.log("Attempting to load dropdown")
            await page.waitForSelector('#shopify-section-product > main > div.vp-80 > div > div.product-detail > form > div.info > div.product-options > div > div > span > span.selection > span > span.select2-selection__arrow'), {timeout: 7000};

          } catch {
              //if dropdown on product screen doesn't load, reload and start over...
            console.log('not found');
            await addNewItem(itemUrl);

            return;
          }

          await page.click("#shopify-section-product > main > div.vp-80 > div > div.product-detail > form > div.info > div.product-options > div > div > span > span.selection > span > span.select2-selection__arrow");

            console.log("dropdown selection clicked");
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
        //Click add to cart
        await page.click("html > body > div:nth-of-type(1) > div:nth-of-type(2) > div > main > div:nth-of-type(1) > div > div:nth-of-type(1) > form > div:nth-of-type(2) > div:nth-of-type(3) > button")
        console.log("clicked checkout")
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
      
        thresholdNotReached = true;
        for (const eachUrl of urlArray) {
            if (thresholdNotReached === true) {
                await addNewItem(eachUrl);
                if (cartThreshold == 0) {
                    //console.log("cartThreshold is 0")
                    console.log("Checkout Loaded " + (Date.now() - checkoutLoadstart) + "ms")
                } else {
                    //Confirm Checkout loaded
                    if(checkOutDidntLoad === false) {
                        console.log("Checkout Loaded " + (Date.now() - checkoutLoadstart) + "ms")
                        //console.log(parseFloat(await subtotal()));
                        //console.log("cartThreshhold "+ parseFloat(cartThreshold))
                         if (parseFloat(subtotalSession) >= parseFloat(cartThreshold)) {
                            console.log('threshold reached')
                            thresholdNotReached = false;
                            return;
                        }
                    }
                }           
            }
            //console.log(file);
        }
      }

      //Start going HAM
    if (myArgs.includes("--short")) {
    await addNewItem("https://shop.donaldjtrump.com/products/trump-pence-snowflake-gift-wrapping-paper");
    await addNewItem("https://shop.donaldjtrump.com/products/official-make-america-great-again-45th-president-hat-red");
} else {
    await shopifySpree();
    
}
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
while (true) {
              await run();
            }
}

if (myArgs.includes("--loop") || (myArgs.includes("-l"))) {
    console.log("Loop is enabled. Running until process stop command issued.")
    bringthepainon();
} else {
    run();
}
