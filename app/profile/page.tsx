"use client"

import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");

  return (
    <div className="min-h-screen bg-[#fcfbf8] flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-xl bg-white/90 border border-[#e9e2ce] rounded-2xl shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-[#1c180d] mb-1">Profile Settings</h1>
        <p className="text-[#9e8747] mb-6">Manage your profile, account info, and preferences.</p>
        <Avatar className="h-20 w-20 mb-4 bg-gradient-to-br from-[#fac638] to-[#e6b332]">
          <AvatarFallback className="bg-gradient-to-br from-[#fac638] to-[#e6b332] text-[#1c180d] text-2xl font-bold">
            {user?.username?.slice(0, 2).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="w-full flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1c180d] mb-1">Username</label>
            <Input
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled
              className="bg-[#faf7ee] border-[#e9e2ce] text-[#1c180d]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1c180d] mb-1">Email</label>
            <Input
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled
              className="bg-[#faf7ee] border-[#e9e2ce] text-[#1c180d]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1c180d] mb-1">Points</label>
            <Input
              value={user?.points || 0}
              disabled
              className="bg-[#faf7ee] border-[#e9e2ce] text-[#1c180d] font-semibold"
            />
          </div>
        </div>
        <Button className="w-full mt-6 mb-2 bg-gradient-to-r from-[#fac638] to-[#e6b332] text-[#1c180d] font-semibold" disabled>
          Change Password
        </Button>
        <Button className="w-full bg-[#1c180d] text-white font-semibold" disabled>
          Save Changes
        </Button>
      </div>
    </div>
  );
} 