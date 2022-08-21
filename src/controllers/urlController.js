const urlModel = require("../models/urlModel");
const shortid = require("shortid");
const isUrlValid = require("url-validation");
const baseurl = "localhost:3000/";
//=====================================================redis====================================================================
const redis = require("redis");
const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
  18914,
  "redis-18914.c212.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("0DWEjKedH0nhdycI3EkRgdxPeMY3Cwrg", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const SETEX_ASYNC = promisify(redisClient.SETEX).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

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

    let cachedData = await GET_ASYNC(`${longUrl}`);
    cachedData = JSON.parse(cachedData);

    if (cachedData) {
      return res
        .status(200)
        .send({ status: true, msg: "cache", data: cachedData }); //response from cache
    }

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
    await SETEX_ASYNC(`${longUrl}`, 1000, JSON.stringify(data)); //storing data in cache

    res.status(201).send({ status: true, data: data });
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

    let cachedData = await GET_ASYNC(`${urlCode}`);
    cachedData = JSON.parse(cachedData);

    if (cachedData) {
      return res.status(302).redirect(cachedData.longUrl); //response from cache
    }

    const Urlt = await urlModel.findOne({ urlCode: urlCode });
    if (!Urlt)
      return res.status(404).send({ status: false, msg: "no data found" });

    await SETEX_ASYNC(`${Urlt.urlCode}`, 1000, JSON.stringify(Urlt)); //storing data in cache
    res.status(302).redirect(Urlt.longUrl);
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.messege });
  }
};

module.exports = { createUrl, getUrl };
