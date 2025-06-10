import React from 'react';
import { Heart, Award, Users, Clock, Star, Crown } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-amber-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-white/80 rounded-full shadow-lg backdrop-blur-sm">
              <Crown className="w-6 h-6 text-amber-600" />
              <span className="text-amber-800 font-semibold">Since 1943</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-6">
              Delhi Wala Halwai
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Eight decades of sweetening lives with authentic Indian mithai, 
              crafted with pure desi ghee and boundless love
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full">
              <Heart className="w-5 h-5 text-orange-600" />
              <span className="text-orange-800 font-medium">Our Heritage</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-800">A Sweet Legacy Born in Hisar</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              In 1943, when India was finding its voice, <strong>Ram Chander Shambhu Dayal</strong> began 
              a journey that would sweeten generations. With nothing but passion and the finest desi ghee, 
              he laid the foundation of what would become a beloved name in authentic Indian sweets.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Today, under the loving guidance of <strong>Viney and Rahul Bansal</strong>, we continue 
              this beautiful tradition, ensuring every bite carries the warmth of home and the richness 
              of our heritage.
            </p>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-orange-200 to-amber-200 rounded-3xl p-8 shadow-2xl">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-white/80 rounded-2xl backdrop-blur-sm">
                  <div className="text-3xl font-bold text-orange-600">80+</div>
                  <div className="text-sm text-gray-600">Years of Excellence</div>
                </div>
                <div className="text-center p-4 bg-white/80 rounded-2xl backdrop-blur-sm">
                  <div className="text-3xl font-bold text-amber-600">8000+</div>
                  <div className="text-sm text-gray-600">Weddings Sweetened</div>
                </div>
                <div className="text-center p-4 bg-white/80 rounded-2xl backdrop-blur-sm col-span-2">
                  <div className="text-2xl font-bold text-orange-600">∞</div>
                  <div className="text-sm text-gray-600">Countless Festivals Celebrated</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specialties Section */}
      <div className="bg-white/50 backdrop-blur-sm py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-4">
              <Star className="w-5 h-5 text-amber-600" />
              <span className="text-amber-800 font-medium">Our Specialties</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Heritage Flavors</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every sweet tells a story, every bite carries tradition
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Motichoor Ladoo",
                description: "Golden pearls of joy, melting softly with every bite",
                gradient: "from-yellow-400 to-orange-400"
              },
              {
                name: "Kaju Katli",
                description: "Silvered diamonds of cashew perfection",
                gradient: "from-gray-300 to-gray-400"
              },
              {
                name: "Gulab Jamun",
                description: "Rose-scented spheres of pure bliss",
                gradient: "from-rose-400 to-pink-400"
              }
            ].map((sweet, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${sweet.gradient} mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 text-center mb-2">{sweet.name}</h3>
                  <p className="text-gray-600 text-center text-sm leading-relaxed">{sweet.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">What Makes Us Special</h2>
          <p className="text-lg text-gray-600">The ingredients of our success</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Award className="w-8 h-8" />,
              title: "Pure Desi Ghee",
              description: "Only the finest, purest ghee touches our sweets"
            },
            {
              icon: <Clock className="w-8 h-8" />,
              title: "Time-Honored Recipes",
              description: "80-year-old recipes passed down through generations"
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: "Family Tradition",
              description: "Every sweet made with the love of family"
            }
          ].map((value, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                {value.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Trusted & Certified
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">FSSAI Certified</h3>
              <p className="text-orange-100 text-lg">10852006000031</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">GST Registered</h3>
              <p className="text-orange-100 text-lg">06EWFPB8259H1ZD</p>
            </div>
          </div>
          <p className="text-orange-100 mt-8 text-lg leading-relaxed">
            Your trust is our most precious ingredient. Every sweet is crafted under 
            the highest standards of quality and hygiene.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Ready to Taste Tradition?
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Join thousands of families who have made us part of their celebrations. 
            Let us sweeten your special moments with our authentic flavors.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;