import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../queries'

const LoginForm = ({ setToken, setPage, show }) => {

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  const [login, { data }] = useMutation(LOGIN, 
    {
      onError: (e) => {
        // Render error someway
        setErr('Wrong username or password')
      }
    })

  useEffect(() => {
    if (data && data.login && data.login.value) {
      setToken(data.login.value)
      localStorage.setItem('gql-lib-utoken', data.login.value)
    }
  }, [data, setToken])

  const submit = async (event) => {
    event.preventDefault()
    login({ variables: { username: username, password: password }})
    
    setUsername('')
    setPassword('')
    
    setPage('authors')
  }

  if (!show) {
    return null
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div>
          username:
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
            />
        </div>
        <div>
          password:
          <input
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type='submit'>Login</button>
      </form>
      <div>
        {err}
      </div>
    </div>
  )
}

export default LoginForm