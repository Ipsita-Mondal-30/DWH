import Image from 'next/image';
import React from 'react';
import Navbar from './Navbar'; // Adjust the import path if Navbar is in a different directory

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      
      {/* ✅ Navbar Added */}

      <Navbar />

      <div className="mt-15" />

      {/* Header Section with Enhanced Design */}
      <div className="relative text-center py-20 px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/30 to-transparent"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-4">
            Celebrating Deliciousness
          </h1>
          <h2 className="text-4xl md:text-5xl font-bold text-amber-700 mb-8">
            Since 1943
          </h2>
          <div className="flex justify-center items-center gap-4 mb-12">
            <div className="w-16 h-1 bg-gradient-to-r from-transparent to-amber-600"></div>
            <div className="w-8 h-8 bg-amber-600 rotate-45 rounded-sm"></div>
            <div className="w-16 h-1 bg-gradient-to-l from-transparent to-amber-600"></div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Column - Enhanced Image */}
          <div className="flex justify-center relative">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-2xl blur-xl transform rotate-6"></div>
              <Image
  src="/dwhh.png" 
  alt="Ram Chander Shambhu Dayal - Founder 1943"
  width={320}
  height={320}
  className="relative w-80 h-80 object-cover rounded-2xl shadow-2xl border-4 border-white"
/>
              <div className="absolute -bottom-4 -right-4 bg-amber-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                Est. 1943
              </div>
            </div>
          </div>

          {/* Right Column - Enhanced Story Text */}
          <div className="space-y-8 text-gray-700 leading-relaxed">
            <div className="border-l-4 border-amber-600 pl-6">
              <p className="text-lg font-light">
                Our story began with <strong className="text-amber-800">Ram Chander Shambhu Dayal</strong>, who founded Delhi Wala Halwai in 1943 with a vision to create authentic Indian sweets that reflect the purity, flavor, and richness of India&rsquo;s cultural heritage. What started as a small sweet-making establishment in the heart of Hisar, Haryana, has grown into a cherished tradition spanning over seven decades.
              </p>
            </div>

            <p className="text-lg font-light">
              Guided by a deep passion for authentic, high-quality sweets made with pure desi ghee, our founder set out with a singular goal: to create desserts that remind you of home—where love, quality, and tradition are infused in every bite. This legacy of excellence continues under the leadership of the Bansal family today.
            </p>

            <p className="text-lg font-light">
              Over the years, we have had the honor of sweetening countless celebrations, from intimate family gatherings to grand festivals. Our commitment to using only the finest, locally-sourced ingredients and traditional recipes passed down through generations has made us a trusted name for <span className="text-amber-700 font-semibold">over 8000 weddings</span> and countless festivals across the region.
            </p>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border-l-4 border-amber-500">
              <p className="text-lg font-light">
                Today, under the guidance of <strong className="text-amber-800">Viney Bansal (CEO)</strong> and <strong className="text-amber-800">Rahul Bansal (Managing Director)</strong>, we blend modern management practices with age-old craftsmanship, ensuring every sweet maintains the authenticity and quality that has defined us since 1943.
              </p>
            </div>
          </div>
        </div>

        {/* Creative Heritage Specialties Section */}
        <div className="mt-24">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-4">
              Our Heritage Specialties
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Each sweet tells a story of tradition, crafted with love and perfected over generations
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-100/50 via-transparent to-orange-100/50 rounded-3xl"></div>
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6 py-12 px-8">
              {[
                'Besan - moong ladoo',
                'Gajar barfi - gajarpaak',
                'Peda - imarti',
                'Sooji halwa - makhanbada',
              ].map((sweet, index) => (
                <div key={index} className="text-center group cursor-pointer">
                  <div className="relative">
                    <p className="text-lg font-semibold text-amber-800 group-hover:text-orange-700 transition-colors duration-300 relative">
                      {sweet}
                    </p>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-amber-600 to-orange-600 group-hover:w-full transition-all duration-300"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Contact Section */}
        <div className="mt-24">
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-800 to-orange-700 rounded-3xl shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10 text-center p-12 text-white">
              <h3 className="text-3xl font-bold mb-8">Visit Our Sweet Haven</h3>
              
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="space-y-2">
                  <h4 className="font-semibold text-amber-200">Location</h4>
                  <p className="text-amber-100">Hisar, Haryana</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-amber-200">Call Us</h4>
                  <p className="text-amber-100">+91 90340 33999</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-amber-200">Email</h4>
                  <p className="text-amber-100">info@delhiwala-halwai.com</p>
                </div>
              </div>

              <div className="border-t border-white/20 pt-8">
                <p className="text-xl font-semibold text-amber-200 mb-2">
                &ldquo;Taste the Tradition. Experience the Love.&rdquo;
                </p>
                <p className="text-amber-100">
                  Delhi Wala Halwai — Your Sweet Destination Since 1943
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;