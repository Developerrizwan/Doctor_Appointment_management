import React from 'react'
import { assets } from '../assets/assets'

const WhyCard = ({ title, children }) => (
  <div className='border rounded-lg px-8 md:px-10 py-8 flex flex-col gap-4 text-sm hover:bg-blue-600 hover:text-white transition-all duration-300 cursor-pointer'>
    <b className='text-base'>{title}</b>
    <p>{children}</p>
  </div>
)

const About = () => {
  return (
    <div className='py-8'>
      {/* Heading */}
      <div className='text-center text-2xl pt-4 text-gray-600'>
        <p>
          ABOUT <span className='text-gray-800 font-semibold'>US</span>
        </p>
      </div>

      {/* Intro */}
      <div className='my-10 flex flex-col md:flex-row gap-12'>
        <img className='w-full md:max-w-[360px] rounded-lg' src={assets.about_image} alt='About Prescripto' />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600 leading-6'>
          <p>
            Welcome to <b>Prescripto</b>, your trusted partner in managing your healthcare
            needs conveniently and efficiently. We understand the challenges people face
            when scheduling doctor appointments and keeping track of their health records.
          </p>
          <p>
            Prescripto brings together a curated network of qualified doctors across
            specialities — from General Physicians to Neurologists — and lets you book,
            manage, pay for, and review your appointments, all in one place. Whether it's
            your first visit or ongoing care, we're here to support you every step of the way.
          </p>
          <b className='text-gray-800'>Our Vision</b>
          <p>
            Our vision is to create a seamless healthcare experience for every user. We aim
            to bridge the gap between patients and doctors, making it easier for you to
            access the care you need, when you need it.
          </p>
        </div>
      </div>

      {/* Why choose us */}
      <div className='text-xl my-4'>
        <p className='text-gray-600'>
          WHY <span className='text-gray-800 font-semibold'>CHOOSE US</span>
        </p>
      </div>

      <div className='flex flex-col md:flex-row mb-20'>
        <WhyCard title='EFFICIENCY'>
          Streamlined appointment scheduling that fits into your busy lifestyle — book a
          verified doctor in just a few clicks.
        </WhyCard>
        <WhyCard title='CONVENIENCE'>
          Access a trusted network of doctors by speciality, view your booking history, and
          manage payments from anywhere.
        </WhyCard>
        <WhyCard title='PERSONALIZATION'>
          Keep your profile and medical preferences in one place, with timely updates on the
          status of every appointment.
        </WhyCard>
      </div>
    </div>
  )
}

export default About
