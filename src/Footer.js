import React from 'react'

const Footer = () => {
const year = new Date();
  return (
    <div>co &copy; {year.getFullYear()} </div>
  )
}

export default Footer