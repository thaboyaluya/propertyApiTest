const puppeteer = require('puppeteer')
const catchAsync = require('../utils/catchAsync');
const cheerio=require('cheerio')




exports.welcome=catchAsync (async (req,res) => {
  res.status(200).json({
    message:'welcome'
  })
});

exports.lagos=catchAsync (async (req,res) => {

  // Start a Puppeteer session with:
  // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
  // - no default viewport (`defaultViewport: null` - website page will in full width and height)
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  // Open a new page
  const page = await browser.newPage();



  await page.setRequestInterception(true);
  const blockedTypes = new Set(["image", "video"]);
  page.on("request", (req) => {
    if (blockedTypes.has(req.resourceType())) {
      req.abort();
    } else req.continue();
  });
  


  await page.goto("https://propertypro.ng/property-for-sale/in/lagos/?search=Lagos&auto=Lagos&type=&bedroom=&min_price=&max_price=", {
    waitUntil: "domcontentloaded",
  });

const pageData=await page.evaluate(()=>{
  return {
    html:document.documentElement.innerHTML
  }
})


const $=cheerio.load(pageData.html)
let data = []
var result = $('.onpage-filters p b').text()
$(".property-listing").each((i, elem) => {
  data.push(
    {
      title: $(elem).find('.pl-title h3 a').text(),
      thumbnail: [
        $(elem).find('img').attr("data-src"),
      ],
      imgs: $(elem).find('img[data-src]').map((_, imageEl) => $(imageEl).data('src')).get(),
      features: $(elem).find('.pl-badge-left ul li').map((_, El) => $(El).text()).get(),
      address: $(elem).find('.pl-title p').text(),
      price: $(elem).find('.pl-price h3').text().trim(),
      PID: $(elem).find('.pl-price p').text().replace("PID : ", ""),
      amenities: $(elem).find('.pl-price h6').text().trim(),
      addedDate: $(elem).find('.date-added').text(),
      badge: $(elem).find('.pg-badge').text().trim(),
      phoneNumber: $(elem).find('.pl-footer-right a').attr("href").replace("tel: ", ""),
      whatsapp: $(elem).find('.pl-footer-right .ms-2').attr("href"),
      agent: "https://www.propertypro.ng" + $(elem).find('.pl-footer-left a').attr('href'),
      agentName: $(elem).find(".flex-grow-1").text().trim(),
      link: "https://www.propertypro.ng" + $(elem).find('.slider div a').attr('href'),
      details: [
        {
          info: $(elem).find('.pl-title h6 a').eq(0).text()
        },
        {
          info: $(elem).find('.pl-title h6 a').eq(1).text()
        }
      ],
    }
  )
})
const currentPage = Number(req.query.page) || '';
  
  // Display the quotes
  res.status(200).send({
    status: 'success',
    results: data.length,
    currentPage,
    total: Number(result),
    properties: data,
  })

  // Click on the "Next page" button
  //await page.click(".pager > .next > a");

  // Close the browser
  await browser.close();
});



