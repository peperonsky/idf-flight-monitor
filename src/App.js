import React, { useState, useEffect } from 'react'
import './App.css'

function VisualComponent({ altitude, his, adi }) {
    return (
      <div>
        <div style={{ height: 200, width: 40, background: '#eee', position: 'relative' }}>
          <div style={{
            position: 'absolute',
            bottom: 0,
            height: `${altitude / 3000 * 100}%`,
            width: '100%',
            background: 'blue'
          }} />
        </div>
        <div style={{
          width: 200,
          height: 200,
          borderRadius: '50%',
          border: '1px solid black',
          position: 'relative',
          marginTop: 20
        }}>
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 2,
            height: '40%',
            background: 'black',
            transformOrigin: 'bottom center',
            transform: `translate(-50%, -100%) rotate(${his}deg)`
          }} />
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' }}>0</div>
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)' }}>180</div>
          <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}>270</div>
          <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}>90</div>
        </div>
        <div style={{ marginTop: 20, color: adi === 0 ? 'blue' : 'green', fontWeight: 'bold' }}>
          ADI: {adi}
        </div>
      </div>
    )
}

function App() {
  const [data, setData] = useState([])
  const [altitude, setAltitude] = useState('')
  const [his, setHis] = useState('')
  const [adi, setAdi] = useState('')
  const [editId, setEditId] = useState(null)
  const [mode, setMode] = useState('TEXT')
  const [views, setViews] = useState([])

  const fetchData = () => {
    fetch('/data')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error(err))
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = e => {
    e.preventDefault()
    const body = { altitude: Number(altitude), his: Number(his), adi: Number(adi) }
    if (editId) {
      fetch(`/data/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
        .then(res => res.json())
        .then(() => {
          fetchData()
          setEditId(null)
        })
    } else {
      fetch('/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
        .then(res => res.json())
        .then(() => fetchData())
    }
    setAltitude('')
    setHis('')
    setAdi('')
  }

  const handleDelete = id => {
    fetch(`/data/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => fetchData())
  }

  const handleEdit = item => {
    setEditId(item._id)
    setAltitude(item.altitude)
    setHis(item.his)
    setAdi(item.adi)
  }

  const handleCancel = () => {
    setEditId(null)
    setAltitude('')
    setHis('')
    setAdi('')
  }

  const addView = () => {
    setViews([...views, { id: Date.now(), type: mode }])
  }

  const removeView = id => {
    setViews(views.filter(view => view.id !== id))
  }

  return (
    <div className="App">
      <h1>Data from API</h1>
      {data.map(item => (
        <div className="data-box" key={item._id}>
          <p>Altitude: {item.altitude}</p>
          <p>HIS: {item.his}</p>
          <p>ADI: {item.adi}</p>
          <p>Timestamp: {new Date(item.timestamp).toLocaleString()}</p>
          <button onClick={() => handleEdit(item)}>Edit</button>
          <button onClick={() => handleDelete(item._id)}>Delete</button>
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <label>Altitude:</label>
        <input type="number" value={altitude} onChange={e => setAltitude(e.target.value)} placeholder="Altitude" />
        <label>HIS:</label>
        <input type="number" value={his} onChange={e => setHis(e.target.value)} placeholder="HIS" />
        <label>ADI:</label>
        <input type="number" value={adi} onChange={e => setAdi(e.target.value)} placeholder="ADI" />
        <button type="submit">{editId ? 'Update' : 'Submit'}</button>
        {editId && <button type="button" onClick={handleCancel}>Cancel</button>}
      </form>
      <div className="mode-buttons">
        <button onClick={() => setMode('TEXT')}>TEXT</button>
        <button onClick={() => setMode('VISUAL')}>VISUAL</button>
        <button onClick={addView}>+</button>
      </div>
      <div className="view-panel">
        {views.map(view => (
          <div className="view-box" key={view.id}>
            <button onClick={() => removeView(view.id)}>-</button>
            {view.type === 'TEXT' ? (
              <div>
                <p>Altitude: {altitude}</p>
                <p>HIS: {his}</p>
                <p>ADI: {adi}</p>
              </div>
            ) : (
              <VisualComponent altitude={altitude} his={his} adi={adi} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
