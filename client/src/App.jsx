import React, { useEffect } from 'react'
import Navbar from './components/Navbar'
import { Routes, Route, Navigate } from 'react-router-dom'
import TrangChu from './pages/TrangChu'
import DangKy from './pages/DangKy'
import DangNhap from './pages/DangNhap'
import CaiDat from './pages/CaiDat'
import Profile from './pages/Profile'
import { useAuthStore } from './store/useAuthStore'
import { Loader } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import { useThemeStore } from './store/useThemeStore'

const App = () => {
  const {authUser, checkAuth, isCheckingAuth, onlineUsers} = useAuthStore()

  const { theme } = useThemeStore()

  console.log({onlineUsers})
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  console.log({ authUser })

  if(isCheckingAuth && !authUser) return (
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin"/>
    </div>
  )
  return (
    <div data-theme={ theme }>
      <Navbar/>

      <Routes>
        <Route path='/' element={authUser ? <TrangChu /> : <Navigate to="/dangnhap" />} />
        <Route path='/dangky' element={!authUser ? <DangKy /> : <Navigate to="/"/>} />
        <Route path='/dangnhap' element={!authUser ? <DangNhap /> : <Navigate to="/"/>} />
        <Route path='/caidat' element={<CaiDat />} />
        <Route path='/profile' element={authUser? <Profile /> : <Navigate to="/dangnhap"/>} />

      </Routes>

      <Toaster />
    </div>
  )
}

export default App