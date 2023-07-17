const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
// json web token
app.use(express.json());
app.use(cors());

async function run() {
  try {
    mongoose.connect(process.env.MONGODB_URL);

    const Schema = mongoose.Schema;
    const _schema = {
      name: String,
    };

    const UserSchema = new Schema(_schema);
    const UserModal = mongoose.model("usercollections", UserSchema);

    const addUser = () => {
      const user = new UserModal({
        name: "user",
      });
      user.save();
      return user;
    };

    app.get("/add", (req, res) => {
      const user = addUser();
      res.send({ data: user });
    });
  } catch (err) {
    console.log(err);
  }

  app.get("/", (req, res) => {
    res.send({ message: "Server is running" });
  });
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("Server is running on port ", port);
});
