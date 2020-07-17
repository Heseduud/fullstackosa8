import React, { useEffect, useState } from 'react'
import { useQuery, useLazyQuery } from '@apollo/client'
import { ME, BOOKS_BY_GENRE } from '../queries'

const Recommended = (props) => {
  const res = useQuery(ME)
  const [bBGres, {data}] = useLazyQuery(BOOKS_BY_GENRE, {fetchPolicy: "no-cache"})
  const [books, setBooks] = useState('')

  useEffect(() => {
    if (res.data) {
      bBGres({variables: {genre: res.data.me.favoriteGenre}})
    }
  }, [res, bBGres])

  useEffect(() => {
    if (data && data.allBooks) {
      setBooks(data.allBooks)
    }
  }, [data, books])

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

  return (
    <div>
      <h2>recommendations</h2>
      <p>books in your favorite genre {res.data.me.favoriteGenre}:</p>
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
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Recommended