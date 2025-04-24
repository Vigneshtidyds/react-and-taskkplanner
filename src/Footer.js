import React from 'react'

const Footer = () => {
const year = new Date();
  return (
    <div>copy &copy; {year.getFullYear()} </div>
  )
}

export default Footer