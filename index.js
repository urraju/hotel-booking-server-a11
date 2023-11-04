const { MongoClient, ServerApiVersion } = require('mongodb');
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
 
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
 
    await client.close();
  }
}
run().catch(console.dir);

app.get('/', async(req,res) => {
    res.send('Browser Is Running Now')
})
app.listen(port, () => console.log('Server is Running on Port ||', port))
