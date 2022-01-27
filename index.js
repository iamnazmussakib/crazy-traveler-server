const express = require('express');
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');
const cors = require('cors');
const fileUpload = require('express-fileupload');

require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(fileUpload());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u0mil.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const database = client.db("crazytraveler");
        const blogCollections = database.collection("blogs");
        const userCollections = database.collection("users");

        // // Get Api 
        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const blogs = { _id: ObjectId(id) };
            const result = await blogCollections.findOne(blogs);
            console.log(result);
            res.json(result);
        })
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await userCollections.findOne(query);
            let isAdmin = false;
            if (result?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

        app.get('/blogs', async(req, res) => {
            const cursor = blogCollections.find({});
            const blogs = await cursor.toArray();
            res.json(blogs);
        })
        app.get('/users', async(req, res) => {
            const cursor = userCollections.find({});
            const users = await cursor.toArray();
            res.json(users);
        })

        // // Post Api
        app.post('/users', async(req, res) => {
            const users = req.body;
            const result = await userCollections.insertOne(users);
            res.json(result);
        })
        app.post('/blogs', async(req, res) => {
            const title = req.body.title;
            const date = req.body.date;
            const desc = req.body.desc;
            const address = req.body.address;
            const time = req.body.time;
            const ratings = req.body.ratings;
            const expense = req.body.expense;
            const status = req.body.status;
            const img = req.files.image;
            const imgData = img.data;
            const encodedData = imgData.toString('base64');
            const imgBuffer = Buffer.from(encodedData, 'base64');
            const blog = {
                title,
                date,
                desc,
                address,
                time,
                ratings,
                expense,
                image: imgBuffer,
                status
            }
            const result = await blogCollections.insertOne(blog)
            res.json(result)
        })

        //Put Api
        app.put('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const updateInfo = req.body;
            console.log(updateInfo);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: 'approved'
                }
            }
            const result = await blogCollections.updateOne(filter, updateDoc, options);
            console.log(result);

            res.json(result);
        })
        // Delete Api
        app.delete('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const deletedItem = { _id: ObjectId(id) };
            const result = await blogCollections.deleteOne(deletedItem);
            res.json(result);
        })


        console.log('DB conected');
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`server is running on http://localhost:${port}`)
})