const express =require("express")
const route = require("./routes/route");
const mongoose = require("mongoose");
const app =express()

app.use(express.json());
app.use(express.urlencoded({extended:false}))

mongoose
  .connect(
    "mongodb+srv://santosh:Santosh24@cluster0.xy0vu.mongodb.net/group63?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log("database connected"), (error) => console.log(error);
  });

app.set("view engine" ,"ejs")

app.use("/", route);



app.listen(3000,()=>console.log("running on port"))