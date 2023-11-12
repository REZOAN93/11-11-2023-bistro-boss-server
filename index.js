const express = require('express')
const cors = require('cors')
const app = express()
const port=process.env.PORT||5000

app.use(cors())
app.use(express.json())
require('dotenv').config()

const { MongoClient, ServerApiVersion } = require('mongodb');
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

    app.get('/menu',async(req,res)=>{
        const cursor = menuCollection.find();
        const data=await cursor.toArray()
        res.send(data)
    })

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