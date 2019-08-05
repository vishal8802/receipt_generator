const express = require("express");
const multer = require("multer");
const puppeteer = require("puppeteer");
const fs = require("fs");
var browser, page;

var cors = require("cors");

const app = express();

app.use(cors());

const PORT = process.env.PORT || 7777;

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);

app.use("/", express.static(__dirname + "/public"));

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads");
  },
  filename: function(req, file, cb) {
    cb(null, `image.png`);
  }
});

var upload = multer({ storage: storage });

app.post("/upload", upload.single("image"), async (req, res) => {
  await createHTMLinvoice(req.body);
  await create_PDF_PNG_invoice(req.body.filetype);
  console.log(req.body);
  // res.send({ file: req.file, req: req.body });
  if (req.body.filetype == "pdf") res.download("invoice.pdf");
  else res.download("invoice.png");
});

async function createHTMLinvoice(data) {
  let content = `
  <html>
  <body style="text-align: center">
    <h2 style="margin: 30px">logo here</h2>
    <h4 style="margin: 20px">Receipt No : ${data.invoice_id}</h4>
    <p style="margin: 20px">
      We have received an amount of Rs.${data.amount} from ${data.uname}, R/O ${
    data.address
  } on ${new Date()}
    </p>

    <p style="margin: 10px">thank you</p>

    <img
      style="margin: 10px"
      src="./uploads/image.png"
      alt="image not available"
      width="200px"
    />
  </body>
  </html>`;

  fs.writeFile("./htmlinvoice.html", content, function(err) {
    if (err) throw err;
  });
}

async function create_PDF_PNG_invoice(filetype) {
  browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true
  });
  page = await browser.newPage();
  var pagePath = `${__dirname}/htmlinvoice.html`;
  var thispage = await page.goto(`file:${pagePath}`, {
    waitUntil: "networkidle2"
  });
  await page.emulateMedia("print");
  if (filetype == "pdf") {
    await page.pdf({
      path: "invoice.pdf",
      format: "A4",
      printBackground: true,
      landscape: false,
      margin: { top: "0", right: "0", bottom: "0", left: "0" }
    });
  }

  if (filetype == "png") await page.screenshot({ path: "invoice.png" });
  await browser.close();
}

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
