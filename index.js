const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
require('dotenv').config()
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;


app.use(cors())
app.use(express.json())




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
    app.get('/mybooking', async(req,res) => {
        const result = await myCollection.find().toArray()
        res.send(result)
    })

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
