import { Outlet } from "react-router"
import Header from './Header'
import Footer from "./Footer"
import { useAuth } from "../store/authStore"
import { useEffect } from "react"


function RootLayout() {

  const checkAuth = useAuth((state) => state.checkAuth)

    useEffect(()=>{
      checkAuth()
    },[])
    
  return (
    <div>
      <Header/>
      <div className="min-h-screen mx-32">
        <Outlet/>
      </div>
      <Footer/>
    </div>
  )
}

export default RootLayout