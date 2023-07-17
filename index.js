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

    // add user
    const addUser = () => {
      const user = new UserModal({
        name: "user",
      });
      user.save();
      return user;
    };

    // get a user
    const getAUser = async () => {
      const lastUser = await UserModal.findOne({ name: "user" });
      return lastUser;
    };
    // get all user
    const getAllUser = async () => {
      const lastUser = await UserModal.find({});
      return lastUser;
    };
    // update user
    const updateUser = async (name, user) => {
      const filter = { name };
      const update = { ...user };
      const updateUser = await UserModal.findOneAndUpdate(filter, update);
      return updateUser;
    };
    // delete user
    const deleteUser = async (name) => {
      const filter = { ...name };
      const updateUser = await UserModal.deleteOne(filter);
      return updateUser;
    };

    app.get("/add", (req, res) => {
      const user = addUser();
      res.send({ data: user });
    });

    app.get("/update", async (req, res) => {
      const user = await updateUser("user", { name: "user 01" });
      res.send({ data: user });
    });

    app.get("/delete", async (req, res) => {
      const user = await deleteUser({ name: "user 01" });
      res.send({ data: user });
    });
    app.get("/get", async (req, res) => {
      const user = await getAUser();
      res.send({ data: user });
    });
    app.get("/getall", async (req, res) => {
      const user = await getAllUser();
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
