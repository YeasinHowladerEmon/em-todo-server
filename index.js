const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const nodemailer = require("nodemailer");

const port = process.env.PORT || 5000;
const { MongoClient } = require("mongodb");

//midelware

app.use(express.json());
app.use(cors());

// 25 or 465 or 587 or

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3xzol.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

console.log(uri);
const run = async () => {
  try {
    await client.connect();
    const database = client.db(`${process.env.DB_NAME}`);
    const employeesData = database.collection("employees");

    //post

    app.post("/addEmploy", async (req, res) => {
      const result = await employeesData.insertOne(req.body);
      res.send(!!result.insertedId);
    });
    app.post("/addMoreEmploy", async (req, res) => {
      const result = await employeesData.insertMany(req.body);
      res.send(!!result.insertedId);
    });

    // sendEmail

    app.post("/sendEmail", async (req, res) => {
      let text = req.body;
      const transport = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        }
      });

      await transport.sendMail({
        from: process.env.MAIL_FROM,
        to: "test@test.com",
        subject: `${text.subject}`,
        html: `<div className="email" style="border: 1px solid black;
                padding: 20px;
                font-family: sans-serif;
                line-height: 2;
                font-size: 20px;
                ">
                <h2>here is your email</h2>
                <p>${text.body}</p>
                <p>all the best, Boss</p>
                </div>`
      });
    });

    //get
    app.get("/employees", async (req, res) => {
      const data = await employeesData.find({}).toArray();
      res.send(data);
    });

    console.log("database connect");
  } catch (err) {
    console.log("error", err);
  } finally {
    // await client.close();
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("hey boss");
});

app.listen(port, () => {
  console.log("server is running", port);
});
