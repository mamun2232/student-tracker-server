require("dotenv").config();
const express = require("express");
const cors = require("cors");

const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// email configartin
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const auth = {
  auth: {
    api_key: "1bbe62017e9942417f8bba3143aeccac-2bab6b06-9b59284a",
    domain: "sandbox009c918cfe6a486e92f0eef6d983b0ae.mailgun.org",
  },
};

const nodemailerMailgun = nodemailer.createTransport(mg(auth));
// middeleware
app.use(cors({
  origin: "http://localhost:3000"
}))
app.use(express.json());

// database configaretion
const uri =
  `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@mamun.rd1yf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// express server
async function run() {
  try {
    await client.connect();
    const userCollection = client.db("test").collection("information");

    app.post("/createUser", async (req, res) => {
      const users = req.body;
      console.log(users);
      const addedUser = await userCollection.insertOne(users);
      res.status(200).send({
        message: "Student Added Successfull",
      });
    });

    app.get("/user", async (req, res) => {
      const user = await userCollection.find({}).toArray();
      res.send(user);
    });

    app.put("/user/:id", async (req, res) => {
      const id = req.params.id;
      const updatedInfo = req.body;
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = {
        $set: updatedInfo,
      };
      const result = await userCollection.updateOne(filter, updateDoc, option);
      res.send(result);
    });

    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const deletedUser = await userCollection.deleteOne(query);
      res.send(deletedUser);
    });

    // seleted data send to mail
    app.put("/sendEmail/:id", async (req, res) => {
      const id = req.params.id

      const query = { _id: ObjectId(id) };
      const user = await userCollection.findOne(query)
      const {name , email , phone , hobby} = user
      nodemailerMailgun.sendMail(
        {
          from: "myemail@example.com",
          to: email,
          subject: "Student Information Send",
          text: `Hello ${name}. Your Email: ${email}, Phone: ${phone} and Your Hobby ${hobby} Verifay SuccessFull`,
        },
        (err, info) => {
          if (err) {
            console.log(err);
          } else {
            console.log(info);
          }
        }

      );
      const option = { upsert: true };
      const updateDoc = {
        $set: {"sendMail": true,}
      };
      const result = await userCollection.updateOne(query, updateDoc, option);
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hellow World");
});

app.listen(port, () => {
  console.log("server run with ", port);
});
