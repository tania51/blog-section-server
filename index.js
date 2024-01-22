const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT | 3002;

// middleware
app.use(cors())
app.use(express.json())



const uri = process.env.DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const blogCollection = client.db('blogSection').collection('blogs')
    const userCollection = client.db('blogSection').collection('user')

    // jwt api
    app.post('/jwt', async(req, res) => {
      const query = req.body;
      const token = jwt.sign(query, process.env.ACCESS_SECRET_TOKEN, {expiresIn: '1hr'})
      res.send( {token} )
    })

    // middlewares
    const verifyToken = (req, res, next) => {
      if(!req.headers.authorization) {
        return res.status(401).send({message: 'unauthorized access'})
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded) => {
        if(err) {
          return res.status(401).send({message: 'unauthorized access'})
        }
        req.decoded = decoded;
        next();
      })
      // next();
    }

    // users api
    app.get('/all-blog', verifyToken, async(req, res) => {
      const result = await blogCollection.find().toArray();
      res.send(result)
    })

    // save user data using post method
    app.post('/user', async(req, res) => {
      const query = req.body;
      const result = userCollection.insertOne(query);
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Welcome To Blog Section Site!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})