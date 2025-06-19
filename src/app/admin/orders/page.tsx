import AdminOrders from '@/components/AdminOrders'
import Navbar from '@/components/Navbar'
import React from 'react'

function AdminOrdersPag() {
  return (
    <div>
      <Navbar />
      <section className='mt-24'>
        <AdminOrders />
        </section>
    </div>
  )
}

export default AdminOrdersPag