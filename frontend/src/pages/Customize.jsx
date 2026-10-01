import React, { useContext, useRef } from 'react'
import Card from '../components/Card'
import image1 from "../assets/image1.webp"
import image2 from "../assets/image2.webp"
import image3 from "../assets/image3.png"
import image4 from "../assets/image4.webp"
import image6 from "../assets/image6.webp"
import { useNavigate } from 'react-router-dom'
import { BiImageAdd } from "react-icons/bi";
import { userDataContext } from '../context/UserContext'
import { IoMdArrowBack } from "react-icons/io";




const Customize = () => {
  const { backendImage, setBackendImage, frontendImage, setFrontendImage, selectedImage, setSelectedImage
  } = useContext(userDataContext)

  const navigate = useNavigate()

  const inputImage = useRef()
  const handleImage = (e) => {
    const file = e.target.files[0]
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
  }


  return (
    <div className='w-full h-screen bg-linear-to-t from-[black] to-[#030353] flex justify-center items-center flex-col p-5'>
         <IoMdArrowBack className='absolute top-7.5 teft-7.5 text-white cursor-pointer w-6.25 h-6.25 'onClick={()=>navigate("/")}/>
      <h1 className='text-white mb-7.5 text-7.5 text-center'>Select your<span className='text-blue-200'> Assistant Image</span> </h1>
      <div className='w-[90%] max-w-225 flex justify-center items-center flex-wrap gap-3.75'>
        <Card image={image1} />
        <Card image={image2} />
        <Card image={image3} />
        <Card image={image4} />
        <Card image={image6} />
        <div className={`w-17.5 h-35 lg:w-37.5 lg:h-62.5 bg-[#020220] border-2 border-[blue] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-4 hover:border-white flex items-center justify-center ${selectedImage == "input" ? "border-4 border-white shadow-2xl shadow-blue-950" : null}`} onClick={() => {
          inputImage.current.click()
          setSelectedImage("input")
          
        }}>

          {!frontendImage && <BiImageAdd className='text-white w-6.25 h-6.25' />

          }
          {frontendImage && <img src={frontendImage} className='h-full object-cover' />}



        </div>
        <input type="file" accept='image/*' ref={inputImage} hidden onChange={handleImage} />
      </div>
      {selectedImage && <button className='min-w-37.5 h-15 mt-7.5  text-black font-semibold cursor-pointer bg-white rounded-full text-4.75' onClick={() => navigate("/customize2")}>Next</button>}


    </div>
  )
}

export default Customize

