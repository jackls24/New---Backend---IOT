const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white py-2">
      <ul className="flex justify-center space-x-6">
        <li>
          <a href="#" className="hover:text-yellow-400">
            Home
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-yellow-400">
            About
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-yellow-400">
            Contact
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
