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
        // const ordersCollection = database.collection("orders");
        // const usersCollection = database.collection("users");
        // const reviewsCollection = database.collection("reviews");

        // // Get Api 
        // app.get('/blogs', async (req, res) => {
        //     const products = blogCollections.find({});
        //     const result = await products.toArray();
        //     res.send(result);
        // })
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
        // app.get('/orders', async (req, res) => {
        //     const orders = ordersCollection.find({});
        //     const result = await orders.toArray();
        //     res.send(result);
        // })
        // app.get('/orders', async (req, res) => {
        //     const email = req.query.email;
        //     console.log(email);
        //     const query = { email: email };
        //     const myOrders = ordersCollection.find(query);
        //     const result = await myOrders.toArray();
        //     res.send(result);
        // })
        // app.get('/reviews', async (req, res) => {
        //     const reviews = reviewsCollection.find({});
        //     const result = await reviews.toArray();
        //     res.send(result);
        // })

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
                status: false
            }
            const result = await blogCollections.insertOne(blog)
            res.json(result)
        })

        // app.post('/orders', async (req, res) => {
        //     const orders = req.body;
        //     const result = await ordersCollection.insertOne(orders);
        //     res.json(result);
        // })
        // app.post('/users', async (req, res) => {
        //     const addUser = req.body;
        //     const result = await usersCollection.insertOne(addUser);
        //     res.json(result);
        // })
        // app.post('/reviews', async (req, res) => {
        //     const reviews = req.body;
        //     const result = await reviewsCollection.insertOne(reviews);
        //     res.json(result);
        // })
        // app.post('/blogs', async (req, res) => {
        //     const addPd = req.body;
        //     const result = await blogCollections.insertOne(addPd);
        //     res.json(result);
        // })
        // // Put Api
        // app.put('/users/admin', async (req, res) => {
        //     const user = req.body;
        //     const filter = { email: user.email };
        //     const updateDoc = { $set: { role: 'admin' } }
        //     const result = await usersCollection.updateOne(filter, updateDoc);
        //     res.json(result);
        // })
        // app.put('/orders/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const updateInfo = req.body;
        //     console.log(updateInfo);
        //     const filter = { _id: ObjectId(id) };
        //     const options = { upsert: true };
        //     const updateDoc = {
        //         $set: {
        //             status: 'Shipped'
        //         }
        //     }
        //     const result = await ordersCollection.updateOne(filter, updateDoc, options);
        //     console.log(result);

        //     res.json(result);
        // })
        // // Delete Api
        // app.delete('/orders/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const deletedItem = { _id: ObjectId(id) };
        //     const result = await ordersCollection.deleteOne(deletedItem);
        //     res.json(result);
        // })
        // app.delete('/blogs/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const deletedItem = { _id: ObjectId(id) };
        //     const result = await blogCollections.deleteOne(deletedItem);
        //     res.json(result);
        // })


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