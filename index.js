var myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);

const Timeout =require( 'await-timeout');

var checkOutDidntLoad = false;

const {program} = require('commander');
var randomUseragent = require('random-useragent');

program
  .option('-t, --threshold <threshold>', 'Threshold reached before before dropping cart')
  .option('--screenshot', 'Screenshots record breaking cart subtotals')
  .option('--short', 'Only runs 2 selected items. DEVELOPER ONLY!')
  .option('--browser', 'Runs in GUI Chromium')
  .option('-l, --loop', 'Automatically loops script');
 // .option('-p, --pizza-type <type>', 'flavour of pizza');

  program.parse(process.argv);

  //if (program.threshold) console.log(`${program.threshold}`);

var cartThreshold;
var options = {blank: "blank"}

//console.log(`${program.threshold}`)

if(`${program.threshold}`) {
    console.log(
        `Limiting to Maximum Cart Subtotal of ${program.threshold} USD.`
      );
      cartThreshold = parseFloat(`${program.threshold}`.replace(new RegExp('[$,]', 'g'), ''));
} else { cartThreshold = 0;}

// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteerExtra = require('puppeteer-extra')
const puppeteer = require('puppeteer-extra')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

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

//var browser = {blank: "blank"};

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

    //puppeteer.use(StealthPlugin())

    const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--user-agent=' + randomUseragent.getRandom() // gets a random user agent string
    ];

    //browser on?
    if (myArgs.includes("--browser")) 
    {
        console.log("Running with browser")
       
            options = {
                args,
                headless: false,
                ignoreHTTPSErrors: true
            }
        } else {
        
             options = {
            args,
            headless: true,
            ignoreHTTPSErrors: true
            }
        
    }

    const browser = await puppeteer.launch(options);
        //
    
    const page = await browser.newPage();
    await page.setViewport({width: 3840, height: 2160});

    await page.setDefaultNavigationTimeout(0);
    await page.setDefaultTimeout(0);

    //enable request interception
    await page.setRequestInterception(true);

    //if screenshots disabled, disable font + image loading to make page slightly faster.
    page.on("request", r => {

        //check if --screenshot and --browser disabled
        if ((myArgs.includes("--screenshot") === false) && (myArgs.includes("--browser") === false)) {
            //check if incoming request is image or font.
            if (
                ["image", "font"].indexOf(r.resourceType()) !== -1 
              ) {
                  //block the request
                r.abort();
              } else {
                  //all other data can continue
                r.continue();
              }      
        }

      });

    //anti bot i think
    await page.goto("https://shop.donaldjtrump.com", {"waitUntil" : "networkidle0", timeout: 10000});

    //bravo six, going dark
    puppeteer.use(StealthPlugin())

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

            //await page.screenshot({path:'screenshot/checkouttimeout'});
            //const html = await page.content();
            //console.log(html);

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

            
            const timer = new Timeout();
            try {
              await Promise.race([
                await page.waitForSelector('#shopify-section-product > main > div.vp-80 > div > div.product-detail > form > div.info > div.product-options > div > div > span > span.selection > span > span.select2-selection__arrow'), {timeout: 7000},
                timer.set(7000, 'Timeout!')
              ]);
            } finally {
              timer.clear();
              //if dropdown on product screen doesn't load, reload and start over...
            }

          } catch {
              //if dropdown on product screen doesn't load, reload and start over...
            console.log('not found');
            //await addNewItem(itemUrl);

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
            //await addNewItem(itemUrl);
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
                    console.log("Checkout Took " + (Date.now() - checkoutLoadstart) + "ms")
                } else {
                    //Confirm Checkout loaded
                    if(checkOutDidntLoad === false) {
                        console.log("Checkout Took " + (Date.now() - checkoutLoadstart) + "ms")
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

async function wearebulletproof() {
    if (myArgs.includes("--loop") || (myArgs.includes("-l"))) {
        console.log("Loop is enabled. Running until process stop command issued.")
        await bringthepainon();
    } else {
        await run();
    }
}

wearebulletproof();
// puppeteer usage as normal
/*puppeteer.launch({ headless: true }).then(async browser => {
    console.log('Running tests..')
    const page = await browser.newPage()
    await page.goto('https://bot.sannysoft.com')
    await page.waitFor(5000)
    await page.screenshot({ path: 'screenshots/testresult.png', fullPage: true })
    await browser.close()
    console.log(`All done, check the screenshot. ✨`)
  })*/