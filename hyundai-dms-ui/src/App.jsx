import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  const [message, setMessage] = useState("Connecting to Backend...")

  useEffect(() => {
    axios.get('http://localhost:8080/api/test/status')
      .then(res => setMessage(res.data))
      .catch(err => setMessage("Backend Connection Fail ho chuka hai!"))
  }, [])

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Hyundai DMS Foundation</h1>
      <p>abhi ka Status: <strong>{message}</strong></p>
    </div>
  )
}

export default App