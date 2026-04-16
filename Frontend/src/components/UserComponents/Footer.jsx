import { Link } from "react-router-dom"; 
import IconComponent from "./Icon";

export default function Footer(){

    
    return (
      
    <footer className="bg-neutral-900 text-white py-12">
 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-red-800 to-red-900 rounded-lg flex items-center justify-center">
                  <IconComponent name="book" className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">LearnHub</span>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Empowering learners worldwide with quality education.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>
                  <Link to="/courses" className="hover:text-white transition-colors">
                    Browse Courses
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    For Instructors
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/contact-us" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-sm text-neutral-400">
            <p>&copy; 2025 LearnHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
}