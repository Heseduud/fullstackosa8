import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { ALL_AUTHORS, EDIT_BORN } from '../queries'
import Select from 'react-select'

const Authors = (props) => {
  const res = useQuery(ALL_AUTHORS)
  const [ editBorn ] = useMutation(
    EDIT_BORN,
    {refetchQueries: [{ query: ALL_AUTHORS }]}
    )

  const [ born, setBorn ] = useState('')
  const [ selected, setSelected ] = useState('')

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

  const authors = res.data.allAuthors

  const submit = async (event) => {
    event.preventDefault()
    editBorn({ variables: { name: selected.value, setBornTo: born }})
    setBorn('')
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>

      {props.token && <div>
        <h2>Set birthyear</h2>
        <form onSubmit={submit}>
          <div>
            name:
            <Select
              value={selected}
              onChange={(selectedOption) => {
                setSelected(selectedOption)
              }}
              options={authors.map(a => {
                let rObj = {value: '', label: ''}
                rObj = {...rObj, value: a.name, label: a.name}
                return rObj
              })}
            />
          </div>
          <div>
            born:
            <input
              value={born}
              onChange={({ target }) => setBorn(Number(target.value))}
            />
          </div>
          <button type='submit'>Update author</button>
        </form>
      </div>}
    </div>
  )
}

export default Authors
