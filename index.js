const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
// password protection
const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.TOKEN_SECRET);
// json web token
app.use(express.json());
app.use(cors());

// password protection
// const encryptedString = cryptr.encrypt("bacon");
// const decryptedString = cryptr.decrypt(encryptedString);

// jwt
// var token = jwt.sign({ foo: "bar" }, "shhhhh");

// create jwt
const createJWT = (email) => {
  const token = jwt.sign({ email }, process.env.TOKEN_SECRET);
  return token;
};

// check jwt
const checkJWT = (key) => {
  const email = jwt.verify(key, process.env.TOKEN_SECRET);
  return email;
};

async function run() {
  try {
    mongoose.connect(process.env.MONGODB_URL);

    const Schema = mongoose.Schema;
    const _schema = {
      userName: { type: String, require: true, unique: false },
      phone: { type: String, require: true, unique: false },
      email: { type: String, require: true, unique: true },
      password: { type: String, require: true, unique: false },
    };

    const UserSchema = new Schema(_schema);
    const UserModal = mongoose.model("usercollections", UserSchema);

    // add user
    const addUser = (data) => {
      const user = new UserModal({
        userName: data.name,
        phone: data.phone,
        email: data.email,
        password: data.password,
      });
      user.save();
      return user;
    };

    // get a user
    const getAUser = async (email) => {
      const lastUser = await UserModal.findOne(email);
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

    app.post("/users", async (req, res) => {
      const body = req.body;

      // check exist or not
      const user = await getAUser({ email: body.email });
      if (user?.userName) {
        res.send({ data: {}, isError: true, message: "User already exist" });
      } else {
        try {
          body.password = cryptr.encrypt(body.password);
          const user = addUser(body);
          user.token = createJWT(user.email);
          res.send({ data: user, isError: false });
        } catch (err) {
          // throw new Error();
          res.send({ data: {}, isError: true, message: "Ops! try again" });
        }
      }
    });

    app.get("/update", async (req, res) => {
      const user = await updateUser("user", { name: "user 01" });
      res.send({ data: user });
    });

    app.get("/delete", async (req, res) => {
      const user = await deleteUser({ name: "user 01" });
      res.send({ data: user });
    });
    app.get("/users/:email", async (req, res) => {
      const body = req.body;
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
