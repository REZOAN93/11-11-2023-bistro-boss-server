const express = require('express')
const cors = require('cors')
const app = express()
const port=process.env.PORT||5000
const jwt = require('jsonwebtoken');

app.use(cors())
app.use(express.json())
require('dotenv').config()

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.S3_BUCKET}:${process.env.SECRET_KEY}@cluster0.lh0lzsv.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();
    const database = client.db("BistroBoss");
    const menuCollection = database.collection("menuCollection");
    const reviewCollection= database.collection("reviewCollection");
    const cartCollection= database.collection("cartCollection");
    const userCollection= database.collection("userCollection");

    // JWT Related API
    app.post('/jwt',async(req,res)=>{
      const user=req.body
      const token=jwt.sign(user,process.env.ACCESS_TOKEN,{ expiresIn: '1h' })
      res.send({token})
    })


    // Verify token middeleware

    const verifytoken=(req,res,next)=>{
      console.log('Inside Verify token',req.headers.authorization)
      if (!req.headers?.authorization) {
        return res.status(401).send({message:'Forbidden Access'})
      }
     const token=req.headers.authorization.split(' ')[1]
    
    jwt.verify(token,process.env.ACCESS_TOKEN,(err,decoded)=>{
      if (err) {
        return res.status(401).send({message:'Forbidden Access'})
      }
      req.decoded=decoded
      next()
    })
    }



    // users Related APi

    app.get('/users',verifytoken,async(req,res)=>{
      const result=await userCollection.find().toArray()
      res.send(result)
    })

    app.delete('/users/:id',async(req,res)=>{
      const deleteId=req.params.id;
      const query = { _id: new ObjectId(deleteId) };
      const result = await userCollection.deleteOne(query);
      res.send(result)
      console.log(result)
    })

    app.patch('/users/admin/:id',async(req,res)=>{
      const id=req.params.id;
      const filter={_id:new ObjectId(id)}
      const updatedDocs={
        $set:{
          role:'admin'
        }
      }
      const result=await userCollection.updateOne(filter,updatedDocs);
      res.send(result)
    })

    app.post('/users',async(req,res)=>{
      const user=req.body;
      const query={
        email:user.email
      }
      const existingUser=await userCollection.findOne(query)
      if (existingUser) {
        return res.send({message:'user already exists',insertedId:null})
      }
      const result=await userCollection.insertOne(user)
      res.send(result)
      console.log(result)
    })


    app.get('/menu',async(req,res)=>{
        const cursor = menuCollection.find();
        const data=await cursor.toArray()
        res.send(data)
    })
    app.get('/reviews',async(req,res)=>{
        const cursor = reviewCollection.find();
        const data=await cursor.toArray()
        res.send(data)
    })

    // cart collection
   app.post('/carts',async(req,res)=>{
      const cartItem=req.body;
      const result = await cartCollection.insertOne(cartItem);
     res.send(result)
     console.log(result)
   })

   app.get('/carts',async(req,res)=>{
    const email=req.query.email;
    const query={email:email}
    const cursor = cartCollection.find(query);
    const data=await cursor.toArray()
    res.send(data)
   })


   app.delete('/carts/:id',async(req,res)=>{
    const deleteID=req.params.id
    const query = { _id: new ObjectId(deleteID) };
    const result = await cartCollection.deleteOne(query);
    res.send(result)
    console.log(result)
   })

    // Nameing convention
    // app.get('/users')
    // app.get('/users/:id')
    // app.post('/users')
    // app.put('/users/:id')
    // app.patch('/users/:id')
    // app.delete('/users/:id')

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// app.get('/products/:id', function (req, res, next) {
//   res.json({msg: 'This is CORS-enabled for all origins!'})
// })

app.listen(port, function () {
  console.log('CORS-enabled web server listening on port 80')
})