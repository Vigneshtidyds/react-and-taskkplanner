import React from 'react'

const Content = () => {
    function random(){
        const value = ["Vicky","Ruban","Vel",2,3,4,5,6,7,8,90,214,345,567,678,234,456,235]
        const name = Math.floor(Math.random()*value.length)
        return value[name]
      }
    return (
        <main><div>Welcome {random()} </div></main>
    )
}

export default Content