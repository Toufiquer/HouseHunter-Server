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
const createJWT = async (email) => {
  const token = await jwt.sign({ email }, process.env.TOKEN_SECRET);
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
    // user Schema
    const _schema = {
      userName: { type: String, require: true, unique: false },
      phone: { type: String, require: true, unique: false },
      email: { type: String, require: true, unique: true },
      password: { type: String, require: true, unique: false },
      userRole: { type: String, require: true, unique: false },
    };

    const _houseSchema = {
      email: { type: String, require: true, unique: false },
      address: { type: String, require: true, unique: false },
      city: { type: String, require: true, unique: false },
      bedrooms: { type: String, require: true, unique: false },
      bathrooms: { type: String, require: true, unique: false },
      roomSize: { type: String, require: true, unique: false },
      picture: { type: String, require: true, unique: false },
      availabilityDate: { type: String, require: true, unique: false },
      rentPerMonth: { type: String, require: true, unique: false },
      phoneNumber: { type: String, require: true, unique: false },
      description: { type: String, require: true, unique: false },
    };

    const UserSchema = new Schema(_schema);
    const HouseSchema = new Schema(_houseSchema);
    const UserModal = mongoose.model("usercollections", UserSchema);
    const HouseModal = mongoose.model("housecollections", HouseSchema);

    // add houses
    const addHouses = (data) => {
      const house = new HouseModal({
        email: data.email,
        address: data.address,
        city: data.city,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        roomSize: data.roomSize,
        picture: data.picture,
        availabilityDate: data.availabilityDate,
        rentPerMonth: data.rentPerMonth,
        phoneNumber: data.phoneNumber,
        description: data.description,
      });
      house.save();
      return house;
    };

    // add user
    const addUser = (data) => {
      const user = new UserModal({
        userName: data.name,
        phone: data.phone,
        email: data.email,
        password: data.password,
        userRole: data.userRole,
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
    // Log In api
    app.post("/usersLogIn", async (req, res) => {
      const body = req.body;
      // check exist or not
      const user = await getAUser({ email: body.email });
      if (user?.userName) {
        const dbUserPassword = cryptr.decrypt(user.password);
        if (dbUserPassword === body.password) {
          const token = await createJWT(user.email);
          res.send({ data: user, isError: false, token });
        } else {
          res.send({
            data: {},
            isError: true,
            message: "Password does't match",
          });
        }
      } else {
        res.send({ data: {}, isError: true, message: "User does't exist" });
      }
    });
    // Registration
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
          const token = await createJWT(user.email);
          res.send({ data: user, isError: false, token });
        } catch (err) {
          // throw new Error();
          res.send({ data: {}, isError: true, message: "Ops! try again" });
        }
      }
    });

    // add house
    app.post("/houses", async (req, res) => {
      const data = req.body;
      try {
        const house = addHouses(data);
        res.send({ data: user, isError: false });
      } catch (err) {
        // throw new Error();
        res.send({ data: {}, isError: true, message: "Ops! try again" });
      }
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
