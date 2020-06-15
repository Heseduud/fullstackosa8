const { ApolloServer, gql } = require('apollo-server')
const { v1: uuid } = require('uuid')
const mongoose = require('mongoose')

const Book = require('./models/book')
const Author = require('./models/author')

mongoose.set('useFindAndModify', false)
const MONGODB_URI = 'mongodb+srv://heseduud:PASSWORD@cluster0-ifmbn.mongodb.net/gql?retryWrites=true&w=majority'
const JWT_SECRET = 'VERY_SECRET_KEY_DO_NOT_LEAK'

mongoose.set('useCreateIndex', true)
console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to mongo')
  })
  .catch((err) => {
    console.log('error connecting to mongo: ', err)
  })

const typeDefs = gql`
  type Author {
    name: String!
    bookCount: Int!
    born: Int
    id: ID!
  }

  type Book {
    title: String!
    published: Int!
    author: Author
    genres: [String!]!
    id: ID!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`

const resolvers = {
  Query: {
    bookCount: async () => {
      const books = await Book.find({})
      return books.length
    },
    authorCount: async () => {
      const authors = await Author.find({})
      return authors.length
    },
    allBooks: async (root, args) => {
      if (args.author) {
        if (args.genre) {
          return books.filter(b => b.author === args.author).filter(b => b.genres.some(g => g === args.genre))
        }
        return books.filter(b => b.author === args.author)
      }

      if (args.genre) {
        return await Book.find({ genres: { $in: [args.genre] } }).populate('author')
      }

      return Book.find({})
    },
    allAuthors: () => Author.find({})
  },
  Author: {
    bookCount: async (root) => {
      const auth = await Author.findOne({ name: root.name })
      const booksByAuthor = await Book.find({ author: auth._id })
      return booksByAuthor.length
    }
  },
  Mutation: {
    addBook: async (root, args) => {
      const author = await Author.findOne({ name: args.author })

      // Author exists
      if (author) {
        const book = new Book({
          ...args,
          author: author
        })
        await book.save()
        return book
      }

      // Author doesn't exist
      const newAuthor = new Author({ name: args.author })
      await newAuthor.save()

      const book = new Book({
        ...args,
        author: await Author.findOne({ name: args.author })
      })
      await book.save()
      return book
    },
    editAuthor: async (root, args) => {
      const auth = await Author.findOne({ name: args.name })
      if (!auth) return null

      auth.born = args.setBornTo
      await auth.save()
      return auth
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})