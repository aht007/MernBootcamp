/* Feature	        Mongoose	                              Plain MongoDB
Schema definition	 Required, enforced via mongoose.Schema	  Not enforced (schema-less)
Relations	         Use ObjectId + ref, .populate()	        Use manual ObjectId, $lookup
Validation	       Built-in and automatic	                  You do it manually
Inserts	           Can use object references easily	        Need to handle references manually
Joins	             .populate()	                            $lookup with aggregation
Middleware/Hooks	 Built-in (pre, post)	                    Not available */


const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const User = mongoose.model('User', UserSchema);

// Post model with reference to User
const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Post = mongoose.model('Post', PostSchema);

// Insertion

const user = await User.create({ name: 'Ahtasham', email: 'ahtasham@example.com' });

const post = await Post.create({
  title: 'My first blog',
  content: 'Hello world',
  author: user._id  // Reference via ObjectId
});


const posts = await Post.find().populate('author');
/*
[
  {
    title: "Hello World",
    content: "This is a post",
    author: {
      _id: "abc123",
      name: "Ahtasham",
      email: "ahtasham@example.com"
    }
  }
]
*/


// Achieving the same result without Mongoose

// Assume db is a connected instance
await db.collection('users').insertOne({ _id: new ObjectId("64a..."), name: "Ahtasham", email: "ahtasham@example.com" });
await db.collection('posts').insertOne({ title: "Hello World", content: "This is a post", author: new ObjectId("64a...") });

const result = await db.collection('posts').aggregate([
    {
      $lookup: {
        from: 'users',           // collection to join
        localField: 'author',    // field in 'posts'
        foreignField: '_id',     // field in 'users'
        as: 'authorDetails'
      }
    },
    { $unwind: '$authorDetails' }  // convert array to single object
  ]).toArray();
  
  /*
  [
    {
      title: "Hello World",
      content: "This is a post",
      author: ObjectId("64a..."),
      authorDetails: {
        _id: ObjectId("64a..."),
        name: "Ahtasham",
        email: "ahtasham@example.com"
      }
    }
  ]
  */
