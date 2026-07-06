import React from 'react'
import Body from './Body'

 interface Book {
 params: Promise<{ bookId: string }> 
}

const page = async ({params}:Book) => {
     const param = await params
     
  return (
    <Body params={param}/>
  )
}

export default page