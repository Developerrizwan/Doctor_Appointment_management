import React from 'react'
import './index.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import Appointment from './pages/Appointment'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import RoleRoute from './components/RoleRoute'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminDoctors from './pages/admin/AdminDoctors'
import AdminAppointments from './pages/admin/AdminAppointments'
import DoctorLayout from './pages/doctor/DoctorLayout'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import { TenantProvider } from './context/TenantContext'
import { DEFAULT_HOSPITAL_SLUG } from './api/axios'
import Landing from './pages/public/Landing'
import HospitalSignup from './pages/public/HospitalSignup'
import PlatformLogin from './pages/platform/PlatformLogin'
import PlatformDashboard from './pages/platform/PlatformDashboard'

// Everything under a hospital slug lives here; TenantProvider exposes the slug.
const TenantRoot = () => (
  <TenantProvider>
    <Outlet />
  </TenantProvider>
)

// App words that are NOT hospital slugs. A bare /login, /doctors, … (old
// bookmark or manual typing) forwards into the default hospital instead of
// being mistaken for a tenant slug.
const LEGACY_SEGMENTS = [
  'login', 'doctors', 'about', 'contact',
  'my-profile', 'my-appointments', 'appointment', 'admin', 'doctor',
]

const LegacyRedirect = () => {
  const location = useLocation()
  return (
    <Navigate
      to={`/${DEFAULT_HOSPITAL_SLUG}${location.pathname}${location.search}`}
      replace
    />
  )
}

// Patient-facing chrome (Navbar + Footer + centered container).
const PatientLayout = () => (
  <div className='mx-4 sm:mx-[10%]'>
    <Navbar />
    <Outlet />
    <Footer />
  </div>
)

const App = () => {
  return (
    <>
      <ScrollToTop />
      <ToastContainer position='bottom-right' autoClose={2500} hideProgressBar newestOnTop />
      <Routes>
        {/* Public marketing site (tenant-less) */}
        <Route path='/' element={<Landing />} />
        <Route path='/signup' element={<HospitalSignup />} />

        {/* Platform-owner console (tenant-less) */}
        <Route path='/platform/login' element={<PlatformLogin />} />
        <Route path='/platform' element={<PlatformDashboard />} />

        {/* Bare app paths (no slug) → forward into the default hospital. */}
        {LEGACY_SEGMENTS.map((seg) => (
          <Route key={seg} path={`/${seg}/*`} element={<LegacyRedirect />} />
        ))}

        <Route path='/:hospitalSlug' element={<TenantRoot />}>
          {/* Patient site */}
          <Route element={<PatientLayout />}>
            <Route index element={<Home />} />
            <Route path='doctors' element={<Doctors />} />
            <Route path='doctors/:speciality' element={<Doctors />} />
            <Route path='login' element={<Login />} />
            <Route path='about' element={<About />} />
            <Route path='contact' element={<Contact />} />
            <Route path='my-profile' element={<MyProfile />} />
            <Route path='my-appointments' element={<MyAppointments />} />
            <Route path='appointment/:docId' element={<Appointment />} />
          </Route>

          {/* Admin panel */}
          <Route
            path='admin'
            element={
              <RoleRoute role='admin'>
                <AdminLayout />
              </RoleRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path='doctors' element={<AdminDoctors />} />
            <Route path='appointments' element={<AdminAppointments />} />
          </Route>

          {/* Doctor panel */}
          <Route
            path='doctor'
            element={
              <RoleRoute role='doctor'>
                <DoctorLayout />
              </RoleRoute>
            }
          >
            <Route index element={<DoctorDashboard />} />
            <Route path='appointments' element={<DoctorAppointments />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App
