const express = require("express");
const route = require("./routes/route");
const mongoose = require("mongoose");
const app = express();
const Port = process.env.Port || 3000;

app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://santosh:Santosh24@cluster0.xy0vu.mongodb.net/group63?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log("database connected"), (error) => console.log(error);
  });

app.use("/", route);

app.listen(Port, () => {
  console.log("Server running on Port " + (process.env.Port || 3000));
});
