import express from "express";

const app = express();
const port = 4000;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("/questions", (req, res) => {
  try{

  }catch(error){
    console.error("")
  }
})

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
