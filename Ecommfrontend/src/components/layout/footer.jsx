export default function Footer() {

  return (

    <footer className="bg-[#172337] text-gray-300 mt-16">

      {/* TOP SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">

        {/* ABOUT */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm uppercase">
            About
          </h3>

          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Contact Us</li>
            <li className="hover:text-white cursor-pointer">About Us</li>
            <li className="hover:text-white cursor-pointer">Careers</li>
            <li className="hover:text-white cursor-pointer">Press</li>
            <li className="hover:text-white cursor-pointer">Corporate Information</li>
          </ul>
        </div>

        {/* HELP */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm uppercase">
            Help
          </h3>

          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Payments</li>
            <li className="hover:text-white cursor-pointer">Shipping</li>
            <li className="hover:text-white cursor-pointer">Cancellation & Returns</li>
            <li className="hover:text-white cursor-pointer">FAQ</li>
            <li className="hover:text-white cursor-pointer">Report Infringement</li>
          </ul>
        </div>

        {/* POLICY */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm uppercase">
            Policy
          </h3>

          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Return Policy</li>
            <li className="hover:text-white cursor-pointer">Terms Of Use</li>
            <li className="hover:text-white cursor-pointer">Security</li>
            <li className="hover:text-white cursor-pointer">Privacy</li>
            <li className="hover:text-white cursor-pointer">Sitemap</li>
          </ul>
        </div>

        {/* SOCIAL */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm uppercase">
            Social
          </h3>

          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Facebook</li>
            <li className="hover:text-white cursor-pointer">Twitter</li>
            <li className="hover:text-white cursor-pointer">Instagram</li>
            <li className="hover:text-white cursor-pointer">YouTube</li>
          </ul>
        </div>

        {/* MAIL */}
        <div className="col-span-2">

          <h3 className="text-white font-semibold mb-4 text-sm uppercase">
            Mail Us:
          </h3>

          <p className="text-sm leading-6">
            ShopEase Pvt Ltd,
            <br />
            Building Alyssa, Begonia &
            <br />
            Clove Embassy Tech Village,
            <br />
            Bengaluru, Karnataka,
            <br />
            India - 560103
          </p>

        </div>

      </div>

      {/* MIDDLE BORDER */}
      <div className="border-t border-gray-700"></div>

      {/* BOTTOM SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">

        {/* LEFT */}
        <div className="flex flex-wrap items-center gap-6">

          <div className="flex items-center gap-2 hover:text-white cursor-pointer">
            🛍️ Become a Seller
          </div>

          <div className="flex items-center gap-2 hover:text-white cursor-pointer">
            📢 Advertise
          </div>

          <div className="flex items-center gap-2 hover:text-white cursor-pointer">
            🎁 Gift Cards
          </div>

          <div className="flex items-center gap-2 hover:text-white cursor-pointer">
            ❓ Help Center
          </div>

        </div>

        {/* CENTER */}
        <div className="text-center text-gray-400">
          © 2026 ShopEase.com
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 text-2xl">

          <span className="hover:scale-110 transition cursor-pointer">
            💳
          </span>

          <span className="hover:scale-110 transition cursor-pointer">
            🏦
          </span>

          <span className="hover:scale-110 transition cursor-pointer">
            📱
          </span>

          <span className="hover:scale-110 transition cursor-pointer">
            💰
          </span>

        </div>

      </div>

    </footer>
  );
}