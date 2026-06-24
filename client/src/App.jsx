import { Routes, Route } from 'react-router-dom'
import CreateTrip from './pages/CreateTrip'
import TripView from './pages/TripView'
import AdminView from './pages/AdminView'
import TripLanding from './pages/TripLanding'
import Highlights from './pages/Highlights'
import TripStory from './pages/TripStory'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CreateTrip />} />
      <Route path="/view/:id" element={<TripLanding />} />
      <Route path="/trip/:id" element={<TripView />} />
      <Route path="/trip/:id/highlights" element={<Highlights />} />
      <Route path="/trip/:id/story" element={<TripStory />} />
      <Route path="/admin/:id" element={<AdminView />} />
    </Routes>
  )
}
