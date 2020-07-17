import React, { useState, useEffect } from 'react'
import { useQuery, useLazyQuery } from '@apollo/client'
import { ALL_BOOKS, BOOKS_BY_GENRE } from '../queries'
const _ = require('lodash')

const Books = (props) => {
  const res = useQuery(ALL_BOOKS)
  const [bBGRes, {loading, data}] = useLazyQuery(BOOKS_BY_GENRE, {fetchPolicy: "no-cache"})
  const [booksToShow, setBooksToShow] = useState('')

  useEffect(() => {
    if (res.data && res.data.allBooks) {
      setBooksToShow(res.data.allBooks)
    }
  }, [res])

  useEffect(() => {
    if (data && data.allBooks) {
      setBooksToShow(data.allBooks)
    }
  }, [loading, data])
  
  if (!props.show) {
    return null
  }

  if (res.loading || !res.data) {
    return (
      <div>
        loading...
      </div>
    )
  }

  const getBBG = (genre) => {
    bBGRes({ variables: { genre: genre }})
  }

  let books = res.data.allBooks

  let genres = []
  _.forEach(books, (book) => {
    // console.log(book.genres)
    genres = _.uniq(genres.concat(book.genres))
  })

  return (
    <div>
      <h2>books</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {booksToShow.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
        <p>Filter books with genre:</p>
        {genres.map(g => 
          <button key={g} onClick={() => getBBG(g)}>{g}</button>
          )}
        <button onClick={() => setBooksToShow(res.data.allBooks)}>All books</button>
      </div>
    </div>
  )
}

export default Books