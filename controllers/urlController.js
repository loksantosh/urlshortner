const urlModel = require("../models/urlModel");
const shortid = require("shortid");
const isUrlValid = require("url-validation");
const baseurl = "localhost:3000/";
//===========================================================PostApi==========================================================

const createUrl = async (req, res) => {
  try {
    let longUrl = req.body.longUrl;
       if (Object.keys(req.body).length == 0)
      return res
        .status(400)
        .send({ status: false, messege: "enter valid data" });

    if (!longUrl || longUrl.trim().length == 0)
      return res.status(400).send({ status: false, messege: "Url required" });

    longUrl = longUrl.trim();
    if (!isUrlValid(longUrl))
      return res
        .status(400)
        .send({ status: false, messege: "enter valid url" });

  const urlcheck = await urlModel.findOne({ longUrl: longUrl });
    if (urlcheck) return res.status(200).send({ url: urlcheck });

    let short = shortid.generate();
    let shortUrl = baseurl + short;
    let urlCode = short;

    req.body.urlCode = urlCode;
    req.body.shortUrl = shortUrl;

    const createUrl = await urlModel.create(req.body);
    let data = {
      longUrl: createUrl.longUrl,
      shortUrl: createUrl.shortUrl,
      urlCode: createUrl.urlCode,
    };

    res.status(201).redirect('/')
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.messege });
  }
};

//============================================================GetApi======================================================================

const getUrl = async (req, res) => {
  try {
    let urlCode = req.params.urlCode.trim();

    if (!shortid.isValid(urlCode))
      return res.status(400).send({
        status: false,
        message: "Please enter a valid urlCode",
      });

    const Urlt = await urlModel.findOne({ urlCode: urlCode });
    if (!Urlt)
      return res.status(404).send({ status: false, msg: "no data found" });
   res.status(302).redirect(Urlt.longUrl);
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.messege });
  }
};

module.exports = { createUrl, getUrl };
