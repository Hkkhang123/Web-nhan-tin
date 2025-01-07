import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'  
import { Camera, Mail, User } from 'lucide-react'

const Profile = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore()
  const [selectedImg, setSelectedImg] = useState(null)

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className='pt-20'>
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Thông tin cá nhân</h1>
            <p className="mt-2">Thông tin cá nhân của bạn</p>
          </div>

          {/*Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img src={selectedImg || authUser.profilePic || "/avatar.png"} alt="Profile"
                  className='size-32 rounded-full object-cover border-4' />
              <label 
                htmlFor="avatar-upload" 
                className={`absolute bottom-0 right-0
                            bg-base-content hover:scale-105
                            p-2 rounded-full cursor-pointer
                            transition-all duration-200
                            ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}`}
                          >
                  <Camera className="w-5 h-5 text-base-200" /> 
                  <input 
                    type="file"
                    id='avatar-upload'
                    className='hidden'
                    accept='image/*'
                    onChange={handleImageUpload}
                    disabled={isUpdatingProfile} /> 
                </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Nhấn vào biểu tượng camera để cập nhật ảnh đại diện"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className='w-4 h-4' />
                Họ tên
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {authUser?.fullName}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className='w-4 h-4' />
                Địa chỉ email
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {authUser?.email}
              </p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Thông tin tài khoản</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700 ">
                <span>Là thành viên từ ngày</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Trạng thái tài khoản</span>
                <span className='text-green-500'>Hoạt động</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile