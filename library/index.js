const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
const { v1: uuid } = require('uuid')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

mongoose.set('useFindAndModify', false)
const MONGODB_URI = 'mongodb+srv://heseduud:PSSWRD@cluster0-ifmbn.mongodb.net/gql?retryWrites=true&w=majority'
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
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

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
    me: User
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
    createUser(
      username: String!
      favoriteGenre: String
    ): User
    login (
      username: String!
      password: String!
    ): Token
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

      return Book.find({}).populate('author')
    },
    allAuthors: () => Author.find({}),
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Author: {
    bookCount: async (root) => {
      const auth = await Author.findOne({ name: root.name })
      const booksByAuthor = await Book.find({ author: auth._id })
      return booksByAuthor.length
    }
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      const author = await Author.findOne({ name: args.author })
      // Authentication
      if (!currentUser) {
        throw new AuthenticationError('not authorized')
      }

      // Author exists
      if (author) {
        const book = new Book({
          ...args,
          author: author
        })

        try {
          await book.save()
        } catch (err) {
          throw new UserInputError(err.message, {
            invalidArgs: args,
          })
        }
        
        return book
      }

      // Author doesn't exist
      const newAuthor = new Author({ name: args.author })
      try {
        await newAuthor.save()
      } catch (err) {
        throw new UserInputError(err.message, {
          invalidArgs: args
        })
      }

      const book = new Book({
        ...args,
        author: await Author.findOne({ name: args.author })
      })

      try {
        await book.save()
      } catch (err) {
        throw new UserInputError(err.message, {
          invalidArgs: args
        })
      }
      
      return book
    },
    editAuthor: async (root, args, { currentUser }) => {

      // Authentication
      if (!currentUser) {
        throw new AuthenticationError('not autorized')
      }

      const auth = await Author.findOne({ name: args.name })
      if (!auth) return null

      auth.born = args.setBornTo

      try {
        await auth.save()
      } catch (err) {
        throw new UserInputError(err.message, {
          invalidArgs: args
        })
      }
      
      return auth
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })

      try {
        await user.save()
      } catch (err) {
        throw new UserInputError(err.message, { invalidArgs: args })
      }

      return user
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'root') {
        throw new UserInputError('wrong creds on login')
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }

      const token = {
        value: jwt.sign(userForToken, JWT_SECRET)
      }

      return token
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const dcToken = jwt.verify(auth.substring(7), JWT_SECRET)
      const currentUser = await User.findById(dcToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})