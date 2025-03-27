import { MongoClient } from 'mongodb'
import { getEmbedding } from './get-embeddings.js'

// Data to embed
const memories = [ 
    "Ania lost her favorite teddy bear on a trip to the mall.",
    "Ania was nervous and excited for her first day of school. She held her mother’s hand tightly before stepping into the classroom.",
    "Ania’s friends surprised her with a cake at the park. She had no idea they had planned it.",
    "Ania fell multiple times before she finally managed to balance and ride her bike without training wheels.",
    "Ania's pet goldfish, Bubbles, passed away. She buried it in the backyard with a small ceremony.",
    "Ania won first place in her school’s spelling bee competition after weeks of practice.",
    "Ania got separated from her mother in a crowded marketplace and was found by a kind vendor.",
    "Ania was afraid of the deep end but eventually learned to float during her first swimming lesson.",
    "A long drive to Fujairah with snacks, music, and endless laughter made for an unforgettable family road trip.",
    "Ania met a girl at the park who would later become her best friend.",
    "Ania rode a camel for the first time and tried sandboarding on a school trip to the desert.",
    "Ania built a fort for the first time with her grandmother, making a mess but having fun.",
    "Ania got her first pet kitten and spent hours playing with it in the backyard.",
    "Ania watched the fireworks on New Year’s Eve with her family, mesmerized by the colors in the sky.",
    "Ania dressed up as a monster for Halloween and went trick-or-treating with her friends.",
    "Ania performed in a school play and forgot her lines but managed to improvise.",
    "Ania made a handmade birthday card for her mother and felt proud when she saw her smile.",
    "Ania visited the beach with her cousins, built sandcastles, and collected seashells."
]

async function run() {
    // Connect to your Atlas cluster
    const client = new MongoClient(process.env.ATLAS_CONNECTION_STRING)
    
    try {
        await client.connect()
        const db = client.db("brain")
        const collection = db.collection("memories")
        console.log("Generating embeddings and inserting documents...")
        const insertDocuments = []
        await Promise.all(memories.map(async memory => {
            // Check if the document already exists
            const existingDoc = await collection.findOne({ memory: memory })
            // Generate an embedding using the function that you defined
            var embedding = await getEmbedding(memory)
              
            // Add the document with the embedding to array of documents for bulk insert
            if (!existingDoc) {
                insertDocuments.push({
                    memory: memory,
                    embedding: embedding
                })
            }
        }))
        // Continue processing documents if an error occurs during an operation
        const options = { ordered: false }
        // Insert documents with embeddings into Atlas
        const result = await collection.insertMany(insertDocuments, options)  
        console.log("Count of documents inserted: " + result.insertedCount) 
    } catch (err) {
        console.log(err.stack)
    }
    finally {
        await client.close()
    }
}
run().catch(console.dir)