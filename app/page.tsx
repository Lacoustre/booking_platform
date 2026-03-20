"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<{[key: string]: boolean}>({});
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  // Page loader
  useEffect(() => {
    const timer = setTimeout(() => setPageLoaded(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Fade-in observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".fade-in");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [pageLoaded]);

  // Image loading handler
  const handleImageLoad = (imageKey: string) => {
    setImagesLoaded(prev => ({ ...prev, [imageKey]: true }));
  };

  // Review form submission
  const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rating) { alert("Please select a star rating"); return; }
    setReviewSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          rating,
          message: formData.get('message')
        })
      });
      if (res.ok) {
        setReviewDone(true);
        setRating(0);
        (e.target as HTMLFormElement).reset();
      }
    } catch {
      alert("Failed to submit review. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Glitter particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2.2 + 0.4,
      dx: (Math.random() - 0.5) * 0.35,
      dy: -Math.random() * 0.55 - 0.15,
      opacity: Math.random() * 0.7 + 0.1,
      hue: Math.random() > 0.5 ? "214,63,168" : "212,168,67",
    }));

    let raf: number;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        p.opacity -= 0.0015;
        if (p.opacity <= 0) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 10;
          p.opacity = Math.random() * 0.7 + 0.2;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.hue},${p.opacity})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);



// Scroll reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const packages = [
    {
      category: "Single Day Wedding",
      subtitle: "Traditional or White Wedding",
      items: [
        { name: "Gold - 3 Hours", price: "2,000", desc: "Three hours only with the bride with no touch ups. Perfect for intimate ceremonies where you want to look stunning without additional services during the event." },
        { name: "Gold + Hair", price: "2,600", desc: "Gold package with hairstyling included. Complete bridal transformation combining makeup and professional hairstyling for a cohesive, stunning look." },
        { name: "Gold + Mum", price: "3,100", desc: "Gold package including bride's mum. Both the bride and her mother receive full glam treatment with premium makeup application for your special day." },
        { name: "Premium Full Day", price: "3,400", desc: "A full day with the bride includes touch ups in between the event for 7 hours. Complete peace of mind with continuous touch-ups throughout your celebration.", featured: true },
      ],
    },
    {
      category: "Two Days Wedding",
      subtitle: "Traditional & White Wedding",
      items: [
        { name: "Gold Package", price: "3,600", desc: "For both traditional and white wedding. 3 hours session for each day. Experience two distinct, stunning looks tailored for each unique celebration." },
        { name: "Premium Package", price: "5,000", desc: "For both engagement and white wedding. Including staying to touch up the bride for reception or few touch ups in between till the event is over.", featured: true },
      ],
    },
    {
      category: "Makeup & Hairstyling",
      subtitle: "Complete Bridal Experience",
      items: [
        { name: "Two Days Styling", price: "4,300", desc: "For both traditional and white wedding with two different hairstyles. Each day features a unique, expertly crafted hairstyle designed to complement your look." },
        { name: "Full Day + Touch-ups", price: "5,500", desc: "Both makeup and 2 different hairstyles with full day touch ups in between (max 8hrs). The ultimate beauty package with continuous care throughout your celebration.", featured: true },
      ],
    },
    {
      category: "Bridesmaids Glam",
      subtitle: "Group Packages (4+ bridesmaids)",
      items: [
        { name: "Gold (Soft Glam)", price: "450", desc: "For each bridesmaid (soft glam) for 4 and more bridesmaids. Beautiful, natural makeup that complements the bride while allowing each bridesmaid's beauty to shine." },
        { name: "Premium (Full Glam)", price: "500", desc: "For each bridesmaid (full glam) for 4 and more bridesmaids. Dramatic, statement-making makeup for bridesmaids who want to make an unforgettable impression." },
      ],
    },
  ];

  const portfolioItems = [
    { img: "bridal-preparation.jpg",   name: "Bridal Prep",   cat: "Full Day Coverage", pos: "center 20%" },
    { img: "elegant-black-glam.jpg",   name: "Noir Elegance", cat: "Editorial", pos: "center 35%" },
    { img: "eye-makeup-gold-glam.jpg", name: "Gold Eye Art",  cat: "Detail Shot", pos: "center 35%" },
    { img: "glam-clients-smiling.jpg", name: "Bridal Party",  cat: "Group Glam", pos: "center 25%" },
    { img: "glam-closeup.jpg",         name: "Flawless",      cat: "Signature Look", pos: "center 35%" },
    { img: "glam-pink.jpg",            name: "Soft Blush",    cat: "Soft Glam", pos: "center 35%" },
    { img: "green-traditional.jpg",    name: "Traditional",   cat: "Cultural Glam", pos: "center 20%" },
  ];

  const reviews = [
    { q: "Tracy made me feel like the most beautiful version of myself. My bridal makeup was absolutely flawless — I couldn't stop smiling all day.", n: "Ama Mensah", year: "2024", rating: 5 },
    { q: "She understood my vision before I even finished explaining. Pure artistry that exceeded every expectation.", n: "Abena Kwarteng", year: "2024", rating: 5 },
    { q: "I've never felt so confident on any day of my life. Tracy is a true gift to every bride.", n: "Efua Darko", year: "2023", rating: 5 },
    { q: "The whole room stopped when I walked in. I was glowing from the inside out. Absolutely magical.", n: "Maame Adjei", year: "2024", rating: 5 },
    { q: "Tracy's attention to detail is unmatched. She made my traditional and white wedding looks completely different yet equally stunning.", n: "Akosua Boateng", year: "2023", rating: 5 },
    { q: "Professional, talented, and so sweet. My makeup lasted the entire 12-hour celebration without a single touch-up needed.", n: "Nana Yaa Asante", year: "2024", rating: 5 },
    { q: "I was nervous about my makeup, but Tracy calmed all my fears. The result was beyond my wildest dreams.", n: "Adwoa Osei", year: "2023", rating: 5 },
    { q: "Every photo came out perfect. Tracy knows how to make makeup camera-ready while still looking natural and radiant.", n: "Kukua Mensah", year: "2024", rating: 5 },
  ];

  const contacts = [
    { 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>,
      lbl: "WhatsApp", 
      val: "+233 54 236 1468", 
      href: "https://wa.me/233542361468" 
    },
    { 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><defs><radialGradient id="ig-gradient" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fdf497"/><stop offset="5%" stopColor="#fdf497"/><stop offset="45%" stopColor="#fd5949"/><stop offset="60%" stopColor="#d6249f"/><stop offset="90%" stopColor="#285AEB"/></radialGradient></defs><path fill="url(#ig-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
      lbl: "Instagram", 
      val: "@trayart_gh", 
      href: "https://instagram.com/trayart_gh" 
    },
    { 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ffffff"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>,
      lbl: "TikTok", 
      val: "@trayart_gh", 
      href: "https://www.tiktok.com/@trayart_gh" 
    },
    { 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
      lbl: "Facebook", 
      val: "trayart_gh", 
      href: "https://www.facebook.com/trayart_gh" 
    },
  ];

  return (
    <>
      {/* Page Loader */}
      <div className={`page-loader ${pageLoaded ? 'hidden' : ''}`}>
        <div className="loader-spinner"></div>
        <div className="loader-text">Loading Trayart GH</div>
      </div>

      <main style={{ background: "#07000a", color: "#f9f0f6", fontFamily: "'Didact Gothic', sans-serif" }}>

      {/* Glitter canvas */}
      <canvas ref={canvasRef} className="glitter-canvas" />

{/* ── LUXURY NAVBAR ── */}
      <nav className="nav">
        <div className="nav-container">
          {/* Brand on far left */}
          <a href="#" className="nav-brand">
            <div className="nav-brand-name">Trayart GH Makeover</div>
          </a>
          
          {/* All navigation on far right */}
          <div className="nav-right">
            <ul className="nav-links">
              <li><a href="#portfolio">Portfolio</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#footer">Contact</a></li>
            </ul>
            <a href="/booking" className="nav-btn nav-btn-desktop" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              textDecoration: 'none'
            }}>
              ✦ Book Appointment
            </a>
            <button
              className={`hamburger ${menuOpen ? 'active' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      <div className={`mobile-menu-backdrop ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(false)} />
      
      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? 'active' : ''}`}>
        <button className="mobile-menu-close" onClick={() => setMenuOpen(false)}>
          ×
        </button>
        <div className="mobile-menu-brand">Trayart GH</div>
        <div className="mobile-menu-links">
          <a href="#portfolio" onClick={() => setMenuOpen(false)}>Portfolio</a>
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#footer" onClick={() => setMenuOpen(false)}>Contact</a>
          <a href="/booking" className="nav-btn" onClick={() => setMenuOpen(false)}>
            ✦ Book Appointment
          </a>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="hero fade-in" style={{ position: "relative", zIndex: 1 }}>
        <div className="hero-mesh" />
        <div className="hero-ghost">GLOW</div>
        <div className="glitter-line gl1" />
        <div className="glitter-line gl2" />
        <div className="glitter-line gl3" />

        <div className="hero-left">
          <div className="hero-eyebrow">Award-Winning Bridal Artistry · Accra</div>
          <h1 className="hero-h1">
            <span className="h1-plain">Where</span>
            <span className="h1-grad">Beauty</span>
            <span className="h1-stroke">Reigns.</span>
          </h1>
          <div className="hero-script">Every Bride, a Masterpiece.</div>
          <p className="hero-desc">
            Tracy transforms faces into living art — blending precision technique with deep glamour for the most important day of your life.
          </p>
          <div className="hero-actions">
            <a href="/booking" className="btn-glam" style={{ textDecoration: 'none' }}>✦ Book Appointment</a>
            <a href="#portfolio" className="btn-ghost-glam">View Portfolio →</a>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-img-a image-container">
            {!imagesLoaded['hero-a'] && <div className="image-skeleton"></div>}
            <Image 
              src="/portfolio/bridal-preparation.jpg" 
              fill 
              alt="Bridal hero" 
              style={{ objectFit: "cover", objectPosition: "center 20%" }} 
              priority 
              className={`image-progressive ${imagesLoaded['hero-a'] ? 'loaded' : ''}`}
              onLoad={() => handleImageLoad('hero-a')}
            />
          </div>
          <div className="hero-img-b image-container">
            {!imagesLoaded['hero-b'] && <div className="image-skeleton"></div>}
            <Image 
              src="/portfolio/glam-closeup.jpg" 
              fill 
              alt="Glam closeup" 
              style={{ objectFit: "cover", objectPosition: "center 35%" }} 
              className={`image-progressive ${imagesLoaded['hero-b'] ? 'loaded' : ''}`}
              onLoad={() => handleImageLoad('hero-b')}
            />
          </div>
          {/* Spinning SVG badge */}
          <div className="spin-badge">
            <svg viewBox="0 0 200 200">
              <defs>
                <path id="arc" d="M 100,100 m -75,0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0" />
              </defs>
              <circle cx="100" cy="100" r="90" fill="rgba(42,0,64,0.9)" stroke="rgba(214,63,168,0.5)" strokeWidth="1" />
              <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(212,168,67,0.2)" strokeWidth="0.5" />
              <text fill="#f0c96a" fontSize="12" fontFamily="Bebas Neue, sans-serif" letterSpacing="5">
                <textPath href="#arc">✦ LUXURY BRIDAL · TRAYART GH · ACCRA · </textPath>
              </text>
              <text x="100" y="112" textAnchor="middle" fill="#fcd4ee" fontSize="26"
                fontFamily="Cormorant, serif" fontStyle="italic" fontWeight="700">TGH</text>
            </svg>
          </div>
        </div>

        <div className="hero-stats">
          {[{ n: "8+", l: "Years" }, { n: "500+", l: "Brides" }, { n: "★5.0", l: "Rating" }].map(({ n, l }) => (
            <div className="hst" key={l}>
              <div className="hst-n">{n}</div>
              <div className="hst-l">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SHIMMER + MARQUEE ── */}
      <div className="shimmer-band" />
      <div className="marquee">
        <div className="marquee-inner">
          {Array(8).fill(null).map((_, i) => (
            <span key={i} className="m-item">
              BRIDAL GLAM <span className="m-gem">✦</span> SOFT GLAM <span className="m-gem">✦</span> TRADITIONAL <span className="m-gem">✦</span> EDITORIAL <span className="m-gem">✦</span> EVENT MAKEUP <span className="m-gem">✦</span>
            </span>
          ))}
        </div>
      </div>
      <div className="shimmer-band" />

      {/* ── ABOUT ── */}
      <section className="about reveal fade-in" style={{ position: "relative", zIndex: 1 }}>
        <div className="about-visual image-container">
          {!imagesLoaded['about'] && <div className="image-skeleton"></div>}
          <Image 
            src="/portfolio/elegant-black-glam.jpg" 
            fill 
            alt="Tracy" 
            style={{ objectFit: "cover", objectPosition: "center 30%" }} 
            className={`image-blur ${imagesLoaded['about'] ? 'loaded' : ''}`}
            onLoad={() => handleImageLoad('about')}
          />
        </div>
        <div className="about-text">
          <div className="about-bg-num">8</div>
          <div className="about-label">The Artist Behind the Brush</div>
          <h2 className="about-h2">
            Not just makeup —<br /><em>a transformation.</em>
          </h2>
          <p className="about-p">
            With over 8 years dedicated to the craft in Accra, Tracy has built a reputation that speaks in silence — through every flawless complexion, every radiant bride, every look that makes a room stop. Her artistry is intuitive, precise, and unmistakably hers.
          </p>
          <div className="about-sig">— Tracy</div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="services reveal fade-in" style={{ position: "relative", zIndex: 1 }}>
        <div className="services-bg-text">LUXURY PACKAGES</div>
        <div className="svc-top">
          <div>
            <div className="pre-label">Bridal Packages</div>
            <h2 className="svc-h2">Choose Your<br /><em>Radiance</em></h2>
          </div>
          <p className="svc-note">
            Every package is a promise — to show up fully, to see your vision, and to deliver beauty beyond expectation.
          </p>
        </div>
        <div className="pricing-wrapper">
          {packages.map((pkg, idx) => (
            <div key={idx} className="price-section">
              <div className="price-section-header">
                <h3 className="price-category">{pkg.category}</h3>
                <p className="price-subtitle">{pkg.subtitle}</p>
              </div>
              <div className="price-items">
                {pkg.items.map((item, i) => (
                  <div key={i} className="price-card">
                    <div className="price-card-index">0{i + 1}</div>
                    <div className="price-card-body">
                      <span className="price-card-name">{item.name}</span>
                      <p className="price-card-desc">{item.desc}</p>
                    </div>
                    <div className="price-card-price">GHS {item.price}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="pricing-notes">
          <div className="pricing-note-item">
            <span className="note-icon">✦</span>
            <span>All bookings outside Accra attract an extra charge for transportation</span>
          </div>
          <div className="pricing-note-item">
            <span className="note-icon">✦</span>
            <span>If sleepovers are required, client provides suitable accommodation for MUA</span>
          </div>
          <div className="pricing-note-item highlight">
            <span className="note-icon">♛</span>
            <span>For all bridal bookings, a non-refundable payment of 1,000 cedis is required to secure booking.</span>
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO ── */}
      <section id="portfolio" className="portfolio reveal" style={{ position: "relative", zIndex: 1 }}>
        <div className="port-bg-word">ARTISTRY</div>
        <div className="port-header">
          <div>
            <div className="pre-label">Gallery</div>
            <h2 className="svc-h2">The <em>Work</em></h2>
          </div>
          <p className="port-note">
            Real brides. Real moments. Every image a testament to the art of transformation.
          </p>
        </div>
        <div className="port-grid">
          {portfolioItems.map(({ img, name, cat, pos }, i) => (
            <div 
              className="pi image-container" 
              key={i}
              onClick={() => setLightboxImg(`/portfolio/${img}`)}
              style={{ cursor: 'pointer' }}
            >
              {!imagesLoaded[`portfolio-${i}`] && <div className="image-skeleton"></div>}
              <Image 
                src={`/portfolio/${img}`} 
                fill 
                alt={name} 
                style={{ objectFit: "cover", objectPosition: pos }} 
                className={`image-progressive ${imagesLoaded[`portfolio-${i}`] ? 'loaded' : ''}`}
                onLoad={() => handleImageLoad(`portfolio-${i}`)}
              />
              <div className="pi-over">
                <div className="pi-name">{name}</div>
                <div className="pi-cat">{cat}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="port-cta">
          <a href="/booking" className="btn-glam" style={{ textDecoration: "none" }}>✦ Reserve Your Date</a>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testi reveal" style={{ position: "relative", zIndex: 1 }}>
        <div className="testi-header">
          <div className="pre-label" style={{ fontSize: '11px', letterSpacing: '8px' }}>Client Love</div>
          <h2 className="svc-h2">What Brides<br /><em>Are Saying</em></h2>
          <p className="testi-note">
            Real experiences from real brides who trusted Tracy with their most important day.
          </p>
        </div>
        
        <div className="reviews-slideshow">
          <div className="reviews-track">
            {[...reviews, ...reviews].map((review, index) => (
              <div key={index} className="review-oval">
                <div className="review-stars">
                  {Array(review.rating).fill(null).map((_, i) => (
                    <span key={i} className="star">★</span>
                  ))}
                </div>
                <blockquote className="review-quote">
                  &ldquo;{review.q}&rdquo;
                </blockquote>
                <div className="review-author">
                  <div className="review-name">{review.n}</div>
                  <div className="review-year">Bride • {review.year}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WRITE REVIEW ── */}
      <section className="write-review reveal" style={{ position: "relative", zIndex: 1, padding: 'clamp(80px, 10vw, 120px) clamp(20px, 5vw, 60px)', background: 'var(--ink)' }}>
        <div style={{ textAlign: 'left', marginBottom: 'clamp(40px, 8vw, 80px)' }}>
          <div className="pre-label" style={{ fontSize: '12px', letterSpacing: '8px' }}>Share Your Experience</div>
        </div>
        
        <div style={{ 
          maxWidth: '900px', 
          margin: '0 auto', 
          background: 'linear-gradient(135deg, rgba(42,0,64,0.4), rgba(16,0,24,0.6))', 
          borderRadius: 'clamp(16px, 4vw, 32px)', 
          padding: 'clamp(40px, 8vw, 80px) clamp(30px, 6vw, 60px)', 
          border: '1px solid rgba(214,63,168,0.2)',
          boxShadow: '0 20px 60px rgba(214,63,168,0.15)'
        }}>
          <h2 style={{ 
            fontFamily: 'Cormorant, serif', 
            fontSize: 'clamp(36px, 8vw, 72px)', 
            fontWeight: 700, 
            textAlign: 'center', 
            marginBottom: 'clamp(30px, 6vw, 50px)',
            color: 'var(--cream)'
          }}>Write a <em style={{ 
            fontStyle: 'italic',
            background: 'linear-gradient(100deg, var(--hot), var(--rose), var(--lavender), var(--gold2))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Review</em></h2>
          
          <form onSubmit={handleReviewSubmit}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: 'clamp(20px, 4vw, 30px)', 
              marginBottom: 'clamp(30px, 5vw, 40px)' 
            }} className="review-grid-responsive">
              <input 
                name="name"
                type="text" 
                placeholder="Your Name" 
                required
                style={{
                  padding: 'clamp(16px, 3vw, 20px) clamp(20px, 4vw, 24px)',
                  background: 'rgba(7,0,10,0.7)',
                  border: '2px solid rgba(214,63,168,0.2)',
                  borderRadius: 'clamp(12px, 2vw, 16px)',
                  color: 'var(--cream)',
                  fontFamily: 'Cormorant, serif',
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  transition: 'all 0.3s',
                  outline: 'none',
                  width: '100%'
                }}
                onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = 'var(--fuchsia)'}
                onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'rgba(214,63,168,0.2)'}
              />
              <input 
                name="email"
                type="email" 
                placeholder="Email Address" 
                required
                style={{
                  padding: 'clamp(16px, 3vw, 20px) clamp(20px, 4vw, 24px)',
                  background: 'rgba(7,0,10,0.7)',
                  border: '2px solid rgba(214,63,168,0.2)',
                  borderRadius: 'clamp(12px, 2vw, 16px)',
                  color: 'var(--cream)',
                  fontFamily: 'Cormorant, serif',
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  transition: 'all 0.3s',
                  outline: 'none',
                  width: '100%'
                }}
                onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = 'var(--fuchsia)'}
                onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'rgba(214,63,168,0.2)'}
              />
            </div>
          
          <div style={{ textAlign: 'center', marginBottom: 'clamp(30px, 5vw, 40px)' }}>
            <div style={{ 
              fontFamily: 'Cormorant, serif', 
              fontSize: 'clamp(16px, 3vw, 20px)', 
              fontStyle: 'italic', 
              color: 'var(--cream)', 
              marginBottom: 'clamp(15px, 3vw, 20px)' 
            }}>How would you rate your experience?</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(4px, 1vw, 8px)', flexWrap: 'wrap' }}>
              {[1,2,3,4,5].map(star => (
                <button 
                  key={star} 
                  onClick={() => setRating(rating === star ? 0 : star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{ 
                    background: 'none',
                    border: 'none',
                    padding: 'clamp(4px, 1vw, 8px)',
                    fontSize: 'clamp(28px, 6vw, 40px)',
                    color: star <= (hoverRating || rating) ? '#d4a843' : 'rgba(214,63,168,0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    filter: star <= (hoverRating || rating) ? 'drop-shadow(0 0 8px #d4a843)' : 'none',
                    transform: star <= (hoverRating || rating) ? 'scale(1.1)' : 'scale(1)'
                  }}
                >★</button>
              ))}
            </div>
          </div>
          
          <textarea 
            name="message"
            placeholder="Share your experience with Tracy's artistry..." 
            required
            style={{
              width: '100%',
              padding: 'clamp(20px, 4vw, 24px)',
              background: 'rgba(7,0,10,0.7)',
              border: '2px solid rgba(214,63,168,0.2)',
              borderRadius: 'clamp(12px, 2vw, 16px)',
              color: 'var(--cream)',
              fontFamily: 'Didact Gothic, sans-serif',
              fontSize: 'clamp(14px, 2vw, 15px)',
              lineHeight: '1.7',
              minHeight: 'clamp(120px, 20vw, 140px)',
              resize: 'vertical',
              marginBottom: 'clamp(30px, 5vw, 40px)',
              transition: 'all 0.3s',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => (e.target as HTMLTextAreaElement).style.borderColor = 'var(--fuchsia)'}
            onBlur={(e) => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(214,63,168,0.2)'}
          ></textarea>
          
          <div style={{ textAlign: 'center' }}>
            {reviewDone ? (
              <p style={{ fontFamily: 'Cormorant, serif', fontSize: '20px', fontStyle: 'italic', color: 'var(--gold2)' }}>
                ✦ Thank you! Your review has been submitted for approval.
              </p>
            ) : (
            <button type="submit" disabled={reviewSubmitting} style={{
              padding: 'clamp(16px, 3vw, 20px) clamp(40px, 8vw, 50px)',
              background: 'linear-gradient(135deg, var(--fuchsia), var(--violet))',
              border: 'none',
              borderRadius: '50px',
              color: 'white',
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 'clamp(12px, 2vw, 14px)',
              letterSpacing: 'clamp(2px, 0.5vw, 4px)',
              cursor: reviewSubmitting ? 'not-allowed' : 'pointer',
              opacity: reviewSubmitting ? 0.7 : 1,
              transition: 'all 0.4s',
              textTransform: 'uppercase',
              boxShadow: '0 10px 30px rgba(214,63,168,0.3)'
            }}
            onMouseEnter={(e) => {
              if (!reviewSubmitting) {
                (e.target as HTMLButtonElement).style.transform = 'translateY(-4px)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 20px 40px rgba(214,63,168,0.5)';
              }
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 10px 30px rgba(214,63,168,0.3)';
            }}
            >{reviewSubmitting ? 'Submitting...' : '✦ Submit Review ✦'}</button>
            )}
          </div>
        </form>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="contact reveal fade-in" style={{ position: "relative", zIndex: 1 }}>
        <div className="contact-img image-container">
          {!imagesLoaded['contact'] && <div className="image-skeleton"></div>}
          <Image 
            src="/portfolio/long-hair-glam.jpg" 
            fill 
            alt="Contact" 
            style={{ objectFit: "cover", objectPosition: "center 30%" }} 
            className={`image-blur ${imagesLoaded['contact'] ? 'loaded' : ''}`}
            onLoad={() => handleImageLoad('contact')}
          />
          <div className="contact-img-text">
            <div className="contact-img-big">YOUR DAY.<br />YOUR GLOW.<br />YOUR ART.</div>
            <div className="contact-img-sub">Asheley Botwe, Accra · By appointment only</div>
          </div>
        </div>
        <div className="contact-form">
          <div className="pre-label">Get In Touch</div>
          <h2 className="svc-h2">Ready to Look<br /><em>Stunning?</em></h2>
          <p className="contact-note">
            Tracy&rsquo;s calendar fills fast. Reach out now to lock in your date — and let&rsquo;s create something truly unforgettable together.
          </p>
          <a href="/booking" className="btn-final">✦ Book Now ✦</a>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImg && (
        <div className="lightbox" onClick={() => setLightboxImg(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxImg(null)}>×</button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightboxImg} alt="Full size" style={{ maxWidth: "90vw", maxHeight: "90vh", width: "auto", height: "auto", objectFit: "contain", display: "block" }} />
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer id="footer" className="footer" style={{ position: "relative", zIndex: 1 }}>
        <div>
          <div className="footer-big">TRAYART GH</div>
          <div className="footer-sub">Luxury Bridal Makeup · Accra, Ghana · Est. 2016</div>
        </div>
        <div className="footer-center">
          <div className="footer-diamond">✦</div>
          <div className="footer-copy">© {new Date().getFullYear()} Trayart GH Makeover. All Rights Reserved.</div>
        </div>
        <div className="footer-socs">
          <a href="https://instagram.com/trayart_gh" className="fsoc" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><defs><radialGradient id="ig-gradient-footer" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fdf497"/><stop offset="5%" stopColor="#fdf497"/><stop offset="45%" stopColor="#fd5949"/><stop offset="60%" stopColor="#d6249f"/><stop offset="90%" stopColor="#285AEB"/></radialGradient></defs><path fill="url(#ig-gradient-footer)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="https://wa.me/233542361468" className="fsoc" aria-label="WhatsApp">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
          </a>
          <a href="https://www.tiktok.com/@trayart_gh" className="fsoc" aria-label="TikTok">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#ffffff"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>
          </a>
          <a href="https://www.facebook.com/trayart_gh" className="fsoc" aria-label="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
        </div>
      </footer>
    </main>
    </>
  );
}