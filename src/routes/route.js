const express = require("express");
const { createUrl, getUrl } = require("../controllers/urlController");
const router = express.Router();

//=====================RestApis==========================================================
router.post("/url/shorten", createUrl);
router.get("/:urlCode", getUrl);

//==================Globalroute===========================================================

router.all("/**", function (req, res) {
  res.status(404).send({
    status: false,
    msg: "The api you request is not available",
  });
});

module.exports = router;
