const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
require('dotenv').config()
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const app = express();
const port = process.env.PORT || 3000;


app.use(cors({
  origin : ['http://localhost:5173']
}))
app.use(express.json())

app.use(cookieParser())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zrkwx23.mongodb.net/?retryWrites=true&w=majority`;
 
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const roomsCollection = client.db('hotelDB').collection('rooms')
    const myCollection = client.db('hotelDB').collection('mybooking')
    // My Booking Now part 
    app.post('/mybooking', async(req,res) => {
        const query = req.body
        const result = await myCollection.insertOne(query)
        res.send(result)
    })
    app.get('/mybooking', async(req,res) => {
      console.log(req.query.email);
      console.log('tooken owner info', req.user);
      if(req.user.email !== req.user.email){
        return res.status(403).send({message : 'Foorbiden'})
      }
      let query = {}
      if(req.query?.email){
        query = {email : req.query.email}
      }
        const result = await myCollection.find(query).toArray()
        res.send(result)
    })

    // all rooms data part 
    app.get('/rooms', async(req,res) => {
        const result = await roomsCollection.find().toArray()
        res.send(result)
    })
    app.get('/rooms/:id', async(req,res) => {
        const id = req.params.id
        const query = {_id : new ObjectId(id)}
        const result = await roomsCollection.findOne(query)
        res.send(result)
    })
 
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);

app.get('/', async(req,res) => {
    res.send('Browser Is Running Now')
})
app.listen(port, () => console.log('Server is Running on Port ||', port))
