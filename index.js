const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
require('dotenv').config()
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const app = express();
const port = process.env.PORT || 3000;


app.use(cors({
  origin : ['http://localhost:5173'],
  credentials : true
}))
app.use(express.json())
app.use(cookieParser())

// token genarate part 
const logger = (req,res, next) => {
  console.log(req.method, req.url);
  next()
}
// verify token part 
const verifyToken = (req,res, next) => {
  const token = req.cookies.token
  console.log('token in the middle wayer', token);
  if(!token) {
    return res.status(401).send({message : 'UnAuthorized access'})
  }
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if(err){
      return res.status(401).send({message : 'Unauthorizes Access'})
    }
    req.user = decoded
    next()
  })
}


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
    const reviewCollection = client.db('hotelDB').collection('review')
    const featureCollection = client.db('hotelDB').collection('featurerRoom')
    const testimonialCollection = client.db('hotelDB').collection('testimonial')

    // Token post 
    app.post('/jwt', async(req,res) => {
      const user = req.body
      const token = jwt.sign(user, process.env.SECRET, {expiresIn : '1hr'})
      res
      .cookie('token', token, {
        httpOnly : true,
        secure : true,
        sameSite : 'none'
      })
      .send({success : true})
    })
    app.post('/logout', async(req,res) => {
      const user = req.body
      console.log('logged user', user);
      res
      .clearCookie('token', {maxAge : 0})
      .send({success : true})
    })

    // testimonial part 

    app.get('/testimonial', async(req,res) => {
      const result = await testimonialCollection.find().toArray()
      res.send(result)
    })

    // Features Room part 
    app.get('/featurerRoom', async(req,res) => {
      const result = await featureCollection.find().toArray()
      res.send(result)
    })
    
    // review post get data part
    app.post('/review', async(req,res) => {
      const query = req.body
      const result = await reviewCollection.insertOne(query)
      res.send(result)
    })
    app.get('/review', async(req,res) => {
        const result = await reviewCollection.find().toArray()
        res.send(result)
    })


    // My Booking Now part 
    app.post('/mybooking', async(req,res) => {
        const query = req.body
        const result = await myCollection.insertOne(query)
        res.send(result)
    })
    app.get('/mybooking', logger, verifyToken, async(req,res) => {
      console.log(req.query.email);
      console.log('tooken owner info', req.user);
      if(req.user.email !== req.user.email){
        return res.status(403).send({message : 'Foorbiden'})
      }
      let query = {}
      if(req.query?.email){
        query = {userEmail : req.query.email}
      }
        const result = await myCollection.find(query).toArray()
        res.send(result)
    })
    app.get('/mybooking/:id', async(req,res) => {
      // if(req.user.email !== req.user.email){
      //   return res.status(403).send({message : 'Foorbiden'})
      // }
      const id = req.params.id
      const query = {_id : new ObjectId(id) }
      const result = await myCollection.findOne(query)
      res.send(result)
    })
    app.delete('/mybooking/:id', async(req,res) => {
       const id = req.params.id
       const query = {_id : new ObjectId(id)}
       const result = await myCollection.deleteOne(query)
       res.send(result)
    })

    app.put('/mybooking/:id', async(req,res) => {
      const id = req.params.id
      const filter = {_id : new ObjectId(id)}
      const updateDate = req.body
      const finalUpdate = {$set : 
        {bookingTime : updateDate.time}
       }
      const result = await myCollection.updateOne(filter,finalUpdate)
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
