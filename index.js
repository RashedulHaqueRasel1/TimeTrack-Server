require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;


// middle Ware

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fcxten6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


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


        // Mongo DB collection 
        const watchCollection = client.db("TimeTrack").collection("watch");


        app.get("/watches", async (req, res) => {
            try {
                const {
                    sort = "lowToHigh",
                    brandName = "",
                    categoryName = "",
                    minPrice = 0,
                    maxPrice = 100000,
                    page = 1,
                    limit = 5,
                } = req.query;

                // console.log(search)

                const filterQuery = {
                    brandName: brandName || { $exists: true },
                    categoryName: categoryName || { $exists: true },
                    price: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) },
                };


                let sortQuery;
                if (sort === "lowToHigh") {
                    sortQuery = { price: 1 };
                } else if (sort === "highToLow") {
                    sortQuery = { price: -1 };
                } else if (sort === "latestAdded") {
                    sortQuery = { creationDate: -1, creationTime: -1 };
                }

                const watches = await watchCollection
                    .find(filterQuery)
                    .sort(sortQuery)
                    .skip((page - 1) * limit)
                    .limit(parseInt(limit))
                    .toArray();

                const total = await watchCollection.countDocuments(filterQuery);

                res.send({ watches, total });
            } catch (error) {
                res.status(500).json({ error: "Something went wrong" });
            }
        });



        console.log("TimeTrack successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("TimeTrack Server is Running")

})

app.listen(port, () => {
    console.log(`TimeTrack Server is Running is on port :${port}`)

})