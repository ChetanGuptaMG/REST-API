const express = require('express')
const { getDb, connectToDb } = require('./db')
const { ObjectId } = require('mongodb')

// init app & middleware
const app = express()

let db

app.use(express.json());

connectToDb((err) => {
  if(!err){
    app.listen('3000', () => {
      console.log('app listening on port 3000')
    })
    db = getDb()
  }
})

// routes
app.get('/books', (req, res) => {
  const page = req.query.p || 0
  const bookperpage = 2
  let books = []

  db.collection('books')
    .find()
    .sort({author: 1})
    .skip(page*bookperpage)
    .limit(bookperpage)
    .forEach(book => books.push(book))
    .then(() => {
      res.status(200).json(books)
    })
    .catch(() => {
      res.status(500).json({error: 'Could not fetch the documents'})
    })
})

app.get('/books/:id',(req, res)=>{

  if (ObjectId.isValid(req.params.id)){
    db.collection('books')
    .findOne({_id: new ObjectId(req.params.id)})
    .then(doc => {
      res.status(200).json(doc)
    })
    .catch(err =>{
      res.status(500).json({error: 'could not fetch the document'})
    })
  } else{
    res.status(500).json({error: 'object id is not valid'})
  }
 
})

app.post('/books', (req, res) => {
  const book = req.body;
  db.collection('books')
    .insertOne(book)
    .then(result => {
      res.status(201).json(result);
    })
    .catch(err => {
      res.status(500).json({ error: `Could not create new document: ${err.message}` });
    });
});

app.delete('/books/:id',(req, res)=>{

  if (ObjectId.isValid(req.params.id)){
    db.collection('books')
    .deleteOne({_id: new ObjectId(req.params.id)})
    .then(doc => {
      res.status(200).json(doc)
    })
    .catch(err =>{
      res.status(500).json({error: 'could not delete the document'})
    })
  } else{
    res.status(500).json({error: 'object id is not valid'})
  }
 
})

app.patch('/books/:id',(req, res)=>{
  const updates =req.body

  if (ObjectId.isValid(req.params.id)){
    db.collection('books')
    .updateOne({_id: new ObjectId(req.params.id)},{$set: updates})
    .then(result => {
      res.status(200).json(result)
    })
    .catch(err =>{
      res.status(500).json({error: 'could not update the document'})
    })
  } else{
    res.status(500).json({error: 'object id is not valid'})
  }
 
})