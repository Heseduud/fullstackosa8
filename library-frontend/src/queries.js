import { gql } from '@apollo/client'

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name,
      born,
      bookCount,
      id
    }
  }
`

export const ALL_BOOKS = gql`
  query {
    allBooks {
      title,
      author {
        name
      },
      published,
      genres,
      id
    }
  }
`

export const BOOKS_BY_GENRE = gql`
  query booksByGenre($genre: String!) {
    allBooks(genre: $genre) {
      title,
      author {
        name
      },
      published,
      genres,
      id
    }
  }
`

export const ME = gql`
  query {
    me {
      username,
      favoriteGenre,
      id
    }
  }
`

export const CREATE_BOOK = gql`
  mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String]!) {
    addBook(
      title: $title,
      author: $author,
      published: $published,
      genres: $genres
    ) {
      title,
      author {
        name,
        born,
        id,
      },
      published,
      genres,
      id,
    }
  }
`

export const EDIT_BORN = gql`
  mutation editBorn($name: String!, $setBornTo: Int!) {
    editAuthor(
      name: $name,
      setBornTo: $setBornTo
    ) {
      name,
      bookCount,
      born,
      id
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    title
    published
    author {
      name
      id
    }
    genres
    id
  }
`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }

${BOOK_DETAILS}
`