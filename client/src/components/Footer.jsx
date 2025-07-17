import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-black text-black dark:text-white font-nt border-t border-primary py-6 px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs md:text-sm">
        <div className="text-primary mb-4 md:mb-0">
          Cadremarkets | Copyright 2025 | +20 112-196-8459 | Cairo, Egypt and everywhere
        </div>
        <div className="flex gap-2 md:gap-4 text-black dark:text-white underline text-xs md:text-sm">
          <Link to="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
          <span className="text-black dark:text-white">|</span>
          <Link to="/terms-of-service" className="hover:text-primary">Terms of Service</Link>
          <span className="text-black dark:text-white">|</span>
          <Link to="/return-policy" className="hover:text-primary">Return Policy</Link>
          <span className="text-black dark:text-white">|</span>
          <Link to="/support" className="hover:text-primary">Support</Link>
        </div>
      </div>
    </footer>
  );
}