import Image from 'next/image';
import React from 'react';

const AboutUs = () => {

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header Section */}
      <div className="text-center py-16 px-8">
        <h1 className="text-5xl md:text-6xl font-bold text-amber-800 mb-4">
          Celebrating Deliciousness
        </h1>
        <h2 className="text-4xl md:text-5xl font-bold text-amber-700 mb-8">
          Since 1943
        </h2>
        <div className="w-32 h-1 bg-amber-600 mx-auto mb-12"></div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column - Image */}
          <div className="flex justify-center">
            <img
              width={800}
              height={800}
              src="./dwhh.png" 
              alt="Ram Chander Shambhu Dayal - Founder 1943" 
              className="w-80 h-80 object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Right Column - Story Text */}
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p className="text-lg">
              Our story began with <strong>Ram Chander Shambhu Dayal</strong>, who founded Delhi Wala Halwai in 1943 with a vision to create authentic Indian sweets that reflect the purity, flavor, and richness of India's cultural heritage. What started as a small sweet-making establishment in the heart of Hisar, Haryana, has grown into a cherished tradition spanning over seven decades.
            </p>

            <p className="text-lg">
              Guided by a deep passion for authentic, high-quality sweets made with pure desi ghee, our founder set out with a singular goal: to create desserts that remind you of home—where love, quality, and tradition are infused in every bite. This legacy of excellence continues under the leadership of the Bansal family today.
            </p>

            <p className="text-lg">
              Over the years, we have had the honor of sweetening countless celebrations, from intimate family gatherings to grand festivals. Our commitment to using only the finest, locally-sourced ingredients and traditional recipes passed down through generations has made us a trusted name for over 8000 weddings and countless festivals across the region.
            </p>

            <p className="text-lg">
              At the age of our founder's vision reaching maturity, we continue to expand our reach while staying true to our original values. Today, under the guidance of <strong>Viney Bansal (CEO)</strong> and <strong>Rahul Bansal (Managing Director)</strong>, we blend modern management practices with age-old craftsmanship, ensuring every sweet maintains the authenticity and quality that has defined us since 1943.
            </p>
          </div>
        </div>

        {/* Bottom Section - Our Specialties */}
        <div className="mt-20 text-center">
          <h3 className="text-3xl font-bold text-amber-800 mb-8">Our Heritage Specialties</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              'Motichoor Ladoo',
              'Gajar Burfi', 
              'Gulab Jamun',
              'Kalakand',
              'Doodh Peda',
              'Kaju Katli',
              'Sooji Halwa',
              'Besan Ladoo'
            ].map((sweet, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                <p className="font-semibold text-amber-700">{sweet}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-16 text-center bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-amber-800 mb-6">Visit Us Today</h3>
          <div className="space-y-3 text-gray-700">
            <p className="flex items-center justify-center gap-2">
              <span className="text-amber-600">📍</span>
              <span>Hisar, Haryana</span>
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="text-amber-600">📞</span>
              <span>+91 90340 33999</span>
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="text-amber-600">✉️</span>
              <span>info@delhiwala-halwai.com</span>
            </p>
          </div>
          <div className="mt-6">
            <p className="italic text-amber-700 font-medium">
              "Taste the Tradition. Experience the Love."
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Delhi Wala Halwai — Your Sweet Destination Since 1943
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;