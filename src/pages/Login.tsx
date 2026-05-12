import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Mail, Lock, ArrowRight } from 'lucide-react'
import { useApp } from '../providers/AppProvider'
import { Button, Input } from '../components/ui'

export default function Login() {
  const navigate = useNavigate()
  const { login, isAuthLoading } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email) {
      setError('Email is required')
      return
    }
    
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError('Login failed. Please try again.')
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg mb-4">
            <Building2 size={32} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">EC Project Tracker</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            KESARI INFRABUILD PVT. LTD.
          </p>
        </div>
        
        {/* Login Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kesariprojects.com"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            
            <Button
              type="submit"
              className="w-full h-11"
              isLoading={isAuthLoading}
            >
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-xs text-muted-foreground">
              Use any email ending with @kesariprojects.com for Admin access
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Environmental Compliance Management System
        </p>
      </motion.div>
    </div>
  )
}
