import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import AuthImagePattern from '../components/AuthImagePattern'
import toast from 'react-hot-toast'

const DangKy = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setformData] = useState({
    fullName: "",
    email: "",
    password: "",
  })

  const {signup, isSigningUp} = useAuthStore()

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Vui lòng nhập họ tên")
    if (!formData.email.trim()) return toast.error("Vui lòng nhập email")
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Email không đúng định dạng")
    if (!formData.password) return toast.error("Vui lòng nhập mật khẩu")
    if (formData.password.length < 6) return toast.error("Mật khẩu phải ít nhất 6 ký tự")
    if (!/[a-zA-Z]/.test(formData.password)) return toast.error("Mật khẩu phải chứa ít nhất một chữ cái")
    if (!/^[A-Z]/.test(formData.password)) return toast.error("Chữ cái đầu của mật khẩu phải viết hoa")
    
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const success = validateForm()
    if(success === true) signup(formData)
  }
  return (
    <div className='min-h-screen grid lg:grid-cols-2'>
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
        <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className='size-6 text-primary'/>
              </div>
              <h1 className="text-2xl font-bold mt-2">Tạo tài khoản</h1>
              <p className="text-base-content/60">Bắt đầu với tài khoản miễn phí</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className="form-control">
              <label className="label">
                <span className='label-text font-medium'>Họ tên</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className='size-5 text-base-content/40'/>
                </div>
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10`}
                  placeholder='Họ và tên'
                  value={formData.fullName}
                  onChange={(e) => setformData({ ...formData, fullName: e.target.value})} 
                />
              </div>
            </div>

            <div className="form-control">
              <label className='label'>
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className='size-5 text-base-content/40' />
                </div>
                <input 
                  type="email" 
                  className={`input input-bordered w-full pl-10`}
                  placeholder='Email của bạn'
                  value={formData.email}
                  onChange={(e) => setformData({ ...formData, email: e.target.value})} />
              </div>
            </div>

            <div className="form-control">
              <label className='label'>
                <span className="label-text font-medium">Mật khẩu</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className='size-5 text-base-content/40' />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className={`input input-bordered w-full pl-10`}
                  placeholder='Mật khẩu'
                  value={formData.password}
                  onChange={(e) => setformData({ ...formData, password: e.target.value})} />
                <button type='button' className='absolute inset-y-0 right-0 pr-3 flex items-center' onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff className='size-5 text-base-content/40' />
                  ): (
                    <Eye className='size-5 text-base-content/40' />
                  )}
                </button>
              </div> 
            </div>

            <button type='submit' className='btn btn-primary w-full' disabled={isSigningUp}>
              {isSigningUp ? (
                <>
                  <Loader2 className='size-5 animate-spin' />
                  Đang tải
                </>
              ) : (
                "Tạo tài khoản"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Đã có tài khoản?{" "}
              <Link to="/dangnhap" className='link link-primary'>
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
      <AuthImagePattern
        title="Tham gia cộng đồng của chúng tôi"
        subtitle="Kết nối với bạn bè, chia sẻ khoảnh khắc và giữ liên lạc với bạn bè của bạn" />
    </div>
  )
}

export default DangKy