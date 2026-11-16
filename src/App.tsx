import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ShoppingBag, User } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoSecondRef = useRef<HTMLVideoElement | null>(null);
  const targetScrollFractionRef = useRef(0);
  const currentScrollFractionRef = useRef(0);
  const targetVideoRatioRef = useRef(0);
  const currentVideoTimeRef = useRef(0);
  const targetVideoSecondRatioRef = useRef(0);
  const currentVideoSecondTimeRef = useRef(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Target and current frame indices for smooth linear interpolation (lerp)
  const targetFrameRef = useRef(1);
  const currentFrameRef = useRef(1);
  const totalFrames = 480; // 240 in /main directory (now video), 240 in /second directory (now second video)
  const imagesRef = useRef<HTMLImageElement[]>([]);

  // Set loaded state on mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Smooth animation frame loop for drawing the interpolated frame and seeking video
  useEffect(() => {
    let animationFrameId: number;

    const smoothUpdate = () => {
      // Smoothly interpolate the scroll progress itself to absorb jittery mouse wheel jumps
      const scrollDiff = targetScrollFractionRef.current - currentScrollFractionRef.current;
      if (Math.abs(scrollDiff) > 0.0001) {
        // Tweak to 0.05 for a majestic, weighted, high-luxury cinematic fluid slide
        currentScrollFractionRef.current += scrollDiff * 0.05;
        if (Math.abs(scrollDiff) < 0.0002) {
          currentScrollFractionRef.current = targetScrollFractionRef.current;
        }
      } else {
        currentScrollFractionRef.current = targetScrollFractionRef.current;
      }

      const activeProgress = currentScrollFractionRef.current;
      setProgress(activeProgress);

      // Dynamically calculate interactive target video positions and frames on each frame
      let targetFrame = 1;
      if (activeProgress <= 0.40) {
        const ratio = activeProgress / 0.40;
        targetVideoRatioRef.current = ratio;
        targetVideoSecondRatioRef.current = 0;
        targetFrame = 1 + ratio * 239;
      } else if (activeProgress > 0.40 && activeProgress < 0.50) {
        targetVideoRatioRef.current = 1.0;
        targetVideoSecondRatioRef.current = 0;
        targetFrame = 240;
      } else if (activeProgress >= 0.50 && activeProgress <= 0.90) {
        targetVideoRatioRef.current = 1.0;
        const ratio = (activeProgress - 0.50) / 0.40;
        targetVideoSecondRatioRef.current = ratio;
        targetFrame = 241 + ratio * 239;
      } else {
        targetVideoRatioRef.current = 1.0;
        targetVideoSecondRatioRef.current = 1.0;
        targetFrame = 480;
      }
      targetFrameRef.current = targetFrame;

      // Smooth linear interpolation of the active video frame
      const video = videoRef.current;
      if (video && video.duration && !video.seeking) {
        const targetTime = targetVideoRatioRef.current * video.duration;
        const vDiff = targetTime - currentVideoTimeRef.current;
        if (Math.abs(vDiff) > 0.001) {
          currentVideoTimeRef.current += vDiff * 0.08;
          video.currentTime = currentVideoTimeRef.current;
        } else {
          currentVideoTimeRef.current = targetTime;
          video.currentTime = targetTime;
        }
      }

      // Smooth linear interpolation of the active second video frame
      const videoSecond = videoSecondRef.current;
      if (videoSecond && videoSecond.duration && !videoSecond.seeking) {
        const targetTime = targetVideoSecondRatioRef.current * videoSecond.duration;
        const vDiff = targetTime - currentVideoSecondTimeRef.current;
        if (Math.abs(vDiff) > 0.001) {
          currentVideoSecondTimeRef.current += vDiff * 0.08;
          videoSecond.currentTime = currentVideoSecondTimeRef.current;
        } else {
          currentVideoSecondTimeRef.current = targetTime;
          videoSecond.currentTime = targetTime;
        }
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameId = requestAnimationFrame(smoothUpdate);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationFrameId = requestAnimationFrame(smoothUpdate);
        return;
      }

      // Smooth linear interpolation of the active frame
      const diff = targetFrameRef.current - currentFrameRef.current;
      if (Math.abs(diff) > 0.05) {
        currentFrameRef.current += diff * 0.08;
        if (currentFrameRef.current < 1) currentFrameRef.current = 1;
        if (currentFrameRef.current > totalFrames) currentFrameRef.current = totalFrames;
      } else {
        currentFrameRef.current = targetFrameRef.current;
      }

      animationFrameId = requestAnimationFrame(smoothUpdate);
    };

    animationFrameId = requestAnimationFrame(smoothUpdate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Update target frame representation on scroll with 2-phase mapping
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight || document.documentElement.clientHeight;

      const totalScrollableHeight = scrollHeight - clientHeight;
      if (totalScrollableHeight <= 0) return;

      const currentScrollFraction = scrollTop / totalScrollableHeight;
      const clampedFraction = Math.max(0, Math.min(1, currentScrollFraction));
      
      targetScrollFractionRef.current = clampedFraction;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Recheck immediately after boot
    const timer = setTimeout(handleScroll, 500);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  // Determine if the side panel jewelry card is triggered to open
  const isFirstCard = progress >= 0.40 && progress < 0.50;
  const isSecondCard = progress >= 0.90;
  const isCardOpen = isFirstCard || isSecondCard;

  // Dynamic product contents based on current scroll position
  const activeProduct = isSecondCard ? {
    category: "Atelier Core Edition",
    title: "Sterling Silver Sculpture Ring",
    description: "A meticulously hand-sculpted sterling silver ring, showcasing bold architectural facets, raw organic textures, and a brilliantly polished inner band reflecting pure, uncompromising luxury.",
    image: "https://res.cloudinary.com/dbfd996z4/image/upload/q_auto/f_auto/v1781019866/2606091843_kfonxp.jpg",
    price: 1350,
    alt: "Hand-sculpted Sterling Silver Sculpture Architectural Ring"
  } : {
    category: "Aura Fine Earrings",
    title: "18K White Gold & Pink Sapphire",
    description: "A bespoke pair of masterfully crafted drop-stud earrings, showcasing exceptional step-cut pink sapphires encircled by a radiant, light-catching halo of hand-set micro-diamonds.",
    image: "https://res.cloudinary.com/dbfd996z4/image/upload/q_auto/f_auto/v1781017114/202606091756_msbh8b.jpg",
    price: 1850,
    alt: "18K White Gold Pink Sapphire & Diamond Halo Stud Earrings"
  };

  // Reset quantity back to 1 when changing between different products
  useEffect(() => {
    setQuantity(1);
  }, [activeProduct.title]);

  // Staggered scroll-linked animation helper for smooth fading out line-by-line
  const getStaggerStyle = (start: number, end: number) => {
    const clamped = Math.max(start, Math.min(end, progress));
    const ratio = (clamped - start) / (end - start); // 0 at start, 1 at end
    const opacity = 1 - ratio;
    const translateY = -75 * ratio; // Increased movement offset for a much deeper scroll-travel experience
    const blurAmount = ratio * 16; // Elegant melting blurring dissolution effect
    return {
      opacity,
      transform: `translateY(${translateY}px)`,
      filter: `blur(${blurAmount}px)`,
      willChange: 'transform, opacity, filter',
      transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), filter 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      pointerEvents: opacity < 0.15 ? 'none' as const : 'auto' as const
    };
  };

  // Smoothly scroll back out of the earrings panel based on active slot
  const handleClosePanel = () => {
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const totalScrollableHeight = scrollHeight - clientHeight;
    
    if (progress >= 0.90) {
      window.scrollTo({
        top: totalScrollableHeight * 0.82, // Scroll back to continue playing preceding frames
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: totalScrollableHeight * 0.35, // Scroll back to play initial seq frames
        behavior: 'smooth'
      });
    }
  };

  return (
    <div id="scroll-workspace" className="relative w-full h-[650vh] bg-[#020202] text-white overflow-x-hidden antialiased font-sans select-text">
      
      {/* Background Frame Sequence Canvas/Video - Always fixed to the background */}
      <div id="video-stage" className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          ref={videoRef}
          src="https://res.cloudinary.com/dbfd996z4/video/upload/q_auto/f_auto/v1781009724/11111111_gvewuj.mp4"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700 ease-in-out"
          style={{ 
            opacity: progress < 0.48 ? 0.85 : 0,
            willChange: 'opacity'
          }}
          muted
          playsInline
          preload="auto"
        />
        <video
          ref={videoSecondRef}
          src="https://res.cloudinary.com/dbfd996z4/video/upload/q_auto/f_auto/v1781009724/2222222_x4qpet.mp4"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700 ease-in-out"
          style={{ 
            opacity: progress >= 0.48 ? 0.85 : 0,
            willChange: 'opacity'
          }}
          muted
          playsInline
          preload="auto"
        />
        <canvas
          id="scrolling-background-canvas"
          ref={canvasRef}
          className="hidden"
          style={{ display: 'none' }}
        />
        {/* Sleek shadow overlays to ensure typography contrast */}
        <div id="ambient-shadow-top" className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-black/85 via-black/35 to-transparent pointer-events-none" />
        <div id="ambient-shadow-bottom" className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
        <div id="ambient-shadow-left" className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none hidden lg:block" />
      </div>

      {/* Modern Top Minimalist Progress Bar */}
      <div 
        id="scroll-progress-bar"
        className="fixed top-0 left-0 h-[2.5px] bg-[#FBFF8D] z-50 transition-all duration-75 pointer-events-none"
        style={{ width: `${progress * 100}%` }}
      />

      {/* MAIN SCREEN EDITORIAL LAYOUT LAYER */}
      <div 
        id="editorial-overlay" 
        className="fixed inset-0 w-full h-full z-10 overflow-y-auto lg:overflow-hidden flex flex-col justify-between p-6 md:p-10 lg:p-12"
        style={{ 
          pointerEvents: progress > 0.45 ? 'none' : 'auto',
          visibility: progress >= 0.45 ? 'hidden' : 'visible'
        }}
      >
        
        {/* HEADER SECTION */}
        <header id="brand-header" className="w-full flex justify-between items-start pointer-events-auto mt-2 lg:mt-0">
          
          {/* Left section: Logo Group with the Sub-header text directly underneath (exactly 40px gap-10) */}
          <div className="flex flex-col items-start gap-10">
            {/* Logo Group */}
            <div className="flex items-center" style={getStaggerStyle(0.00, 0.12)}>
              {/* Luxury brand crest logo SVG in 48x48px */}
              <svg className="w-12 h-12 text-white" viewBox="0 0 61 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_953_37012)">
                  <g clipPath="url(#clip1_953_37012)">
                    <path d="M59.8601 21.75C58.9473 18.9208 57.1619 16.4534 54.7599 14.7017C52.3579 12.9501 49.4629 12.0043 46.4901 12H45.7801C45.8756 12.6625 45.9257 13.3307 45.9301 14C45.9242 17.6898 44.6015 21.2563 42.1999 24.0575C39.7983 26.8587 36.4757 28.7107 32.8301 29.28C32.9201 29.65 33.0101 30.02 33.1301 30.38C33.354 31.0659 33.6281 31.7343 33.9501 32.38C33.9501 32.38 33.9501 32.38 33.9501 32.46C34.1001 32.75 34.2601 33.04 34.4301 33.32L34.5001 33.44C35.0023 34.2564 35.5852 35.0202 36.2401 35.72L36.5401 36.04L37.0301 36.49C37.1801 36.63 37.3401 36.77 37.5101 36.9L37.9501 37.26C38.1601 37.42 38.3801 37.57 38.6001 37.72L39.0001 38C39.3601 38.22 39.7301 38.44 40.1101 38.63C41.7527 39.4713 43.5455 39.9794 45.3852 40.1253C47.225 40.2712 49.0754 40.0519 50.8301 39.48C51.1704 39.3726 51.5043 39.2457 51.8301 39.1C55.1185 37.7646 57.7769 35.23 59.2677 32.0091C60.7584 28.7881 60.9702 25.1212 59.8601 21.75Z" fill="white"/>
                    <path d="M51.2805 40.8101C49.7308 41.3169 48.111 41.5768 46.4805 41.5801C43.6205 41.5725 40.8186 40.7722 38.386 39.2682C35.9534 37.7641 33.9853 35.6152 32.7005 33.0601C32.3705 33.2601 32.0605 33.4701 31.7005 33.7001C31.1303 34.1195 30.5922 34.5808 30.0905 35.0801L30.0305 35.1401C29.7905 35.3701 29.5705 35.6101 29.3505 35.8601L29.2705 35.9601C28.6443 36.692 28.0948 37.4862 27.6305 38.3301C27.5605 38.4601 27.4905 38.5801 27.4305 38.7101C27.3705 38.8401 27.2305 39.1101 27.1405 39.3101C27.0505 39.5101 26.9705 39.7001 26.9005 39.9001C26.8305 40.1001 26.7605 40.2501 26.7005 40.4301C26.6405 40.6101 26.5305 40.9301 26.4605 41.1801C26.3905 41.4301 26.3705 41.4701 26.3405 41.6201C26.2289 42.0312 26.1421 42.4486 26.0805 42.8701C25.7885 44.6929 25.86 46.5556 26.2908 48.3507C26.7215 50.1459 27.5031 51.8382 28.5905 53.3301C28.7905 53.6001 29.0105 53.8701 29.2305 54.1201C31.3322 56.7597 34.3165 58.5515 37.6343 59.1658C40.9521 59.78 44.3801 59.1753 47.2875 57.463C50.195 55.7507 52.3861 53.0459 53.4579 49.8465C54.5296 46.647 54.4098 43.1682 53.1205 40.0501C52.5256 40.3461 51.9108 40.6 51.2805 40.8101Z" fill="white"/>
                    <path d="M24.7197 42.6402C25.2301 39.3967 26.769 36.4029 29.1097 34.1002C28.8197 33.8602 28.5197 33.6102 28.2097 33.3902C26.3192 32.0104 24.111 31.1299 21.7897 30.8302H21.4997C20.9997 30.7802 20.4997 30.7402 19.9797 30.7402C17.7589 30.7452 15.5702 31.2717 13.5901 32.2774C11.61 33.2831 9.89376 34.7398 8.57972 36.5302C8.37972 36.8102 8.19972 37.1002 8.01972 37.3902C6.22276 40.206 5.4918 43.5716 5.95884 46.8791C6.42587 50.1866 8.06012 53.2182 10.5665 55.4263C13.0729 57.6345 16.2862 58.8737 19.6262 58.9203C22.9662 58.9669 26.2128 57.8177 28.7797 55.6802C28.3127 55.2062 27.8815 54.6981 27.4897 54.1602C26.2883 52.5191 25.4247 50.6556 24.9492 48.6781C24.4737 46.7005 24.3957 44.6482 24.7197 42.6402Z" fill="white"/>
                    <path d="M7.43005 35.6599C9.59682 32.6726 12.7619 30.5602 16.352 29.7053C19.942 28.8505 23.7195 29.3097 27 30.9999C27.15 30.6499 27.29 30.2999 27.41 29.9299C28.0719 27.917 28.2735 25.7812 28 23.6799C28 23.5799 28 23.4799 28 23.3899C28 23.1499 27.91 22.9099 27.8601 22.6799C27.8101 22.4499 27.78 22.2999 27.73 22.1199C27.68 21.9399 27.63 21.7299 27.57 21.5299C27.51 21.3299 27.41 21.0499 27.33 20.8099C27.25 20.5699 27.22 20.5099 27.16 20.3699C27.0096 19.9734 26.8359 19.5861 26.64 19.2099C25.8108 17.5595 24.6613 16.0905 23.2587 14.8887C21.856 13.6869 20.2282 12.7763 18.47 12.2099C18.16 12.1099 17.86 12.0299 17.55 11.9599C16.4327 11.6718 15.2839 11.524 14.13 11.5199C11.075 11.4638 8.08548 12.4088 5.61766 14.2106C3.14985 16.0123 1.33927 18.572 0.462195 21.499C-0.414881 24.426 -0.310283 27.5595 0.760026 30.4215C1.83033 33.2835 3.80758 35.7167 6.39005 37.3499C6.69839 36.7639 7.04584 36.1993 7.43005 35.6599Z" fill="white"/>
                    <path d="M27.8404 18.5598C29.3322 21.4847 29.8507 24.8096 29.3204 28.0498C29.6904 28.0498 30.0704 28.1098 30.4604 28.1098C31.1705 28.1004 31.879 28.0402 32.5804 27.9298C35.791 27.433 38.7288 25.835 40.8904 23.4098L41.1004 23.1798C41.2804 22.9698 41.4504 22.7498 41.6204 22.5198C41.7904 22.2898 41.8104 22.2798 41.9004 22.1498C41.9904 22.0198 42.1904 21.7298 42.3204 21.5198C42.4504 21.3098 42.5204 21.1998 42.6104 21.0398C42.7004 20.8798 42.8404 20.6398 42.9404 20.4298C43.0404 20.2198 43.1304 20.0498 43.2204 19.8598C43.3104 19.6698 43.3904 19.4698 43.4804 19.2698C43.5704 19.0698 43.6404 18.8398 43.7104 18.6198C43.7804 18.3998 43.8504 18.2298 43.9104 18.0398C43.9704 17.8498 44.0404 17.5498 44.1004 17.2998C44.1604 17.0498 44.1904 16.9398 44.2204 16.7598C44.2504 16.5798 44.3204 16.1798 44.3604 15.8798C44.4004 15.5798 44.3604 15.5798 44.4204 15.4198C44.4204 14.9698 44.4904 14.5198 44.4904 14.0498C44.4904 13.5798 44.4904 13.3498 44.4904 13.0498C44.2971 9.71136 42.9151 6.55239 40.5946 4.1445C38.2741 1.73661 35.1683 0.238872 31.8393 -0.0777185C28.5102 -0.394309 25.1778 0.491167 22.4451 2.41849C19.7123 4.34581 17.7596 7.18765 16.9404 10.4298C17.5906 10.5461 18.232 10.7065 18.8604 10.9098C20.7878 11.5297 22.5735 12.5248 24.1147 13.8377C25.6558 15.1506 26.9221 16.7555 27.8404 18.5598Z" fill="white"/>
                  </g>
                </g>
                <defs>
                  <clipPath id="clip0_953_37012">
                    <rect width="60.55" height="59.12" fill="white"/>
                  </clipPath>
                  <clipPath id="clip1_953_37012">
                    <rect width="60.55" height="59.12" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>

            {/* SUB-HEADER DISCIPLINE PROSE (Placed exactly 40px below the logo) */}
            <div className="max-w-[420px] pointer-events-auto" style={getStaggerStyle(0.06, 0.18)}>
              <h3 className="font-sans text-xs lg:text-[13px] font-semibold tracking-[-0.03em] text-white/95 mb-3">
                Contemporary Luxury For The<br />Discerning Minimalist
              </h3>
              <p className="font-sans text-[11px] lg:text-[11.5px] leading-relaxed text-white/50 font-light w-[260px]">
                Exclusive creations tailored for true aesthetes. We forge more than simple ornaments; we build tactile artifacts of your personal legacy.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-5 sm:gap-6 md:gap-7 lg:gap-8 text-xs lg:text-[13px] font-medium tracking-wide text-white/70 pt-2" style={getStaggerStyle(0.03, 0.15)}>
            <div className="flex items-center gap-5 sm:gap-6 md:gap-7 lg:gap-8">
              {['Collections', 'Atelier', 'Our story', 'Contact'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase().replace(' ', '-')}`} 
                  className="hover:text-white transition-all hover:scale-105 duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-white after:transition-all hover:after:w-full"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Subtle separator */}
            <span className="h-4 w-[1px] bg-white/20 select-none mx-1" />

            {/* User Login & Cart Quick Actions */}
            <div className="flex items-center gap-4 sm:gap-5">
              <a 
                href="#login" 
                aria-label="Account Login" 
                className="hover:text-white transition-all hover:scale-[1.12] duration-300 flex items-center justify-center p-0.5"
              >
                <User className="w-[17px] h-[17px]" />
              </a>
              <button 
                onClick={() => {
                  const scrollHeight = document.documentElement.scrollHeight;
                  const clientHeight = window.innerHeight;
                  const totalScrollableHeight = scrollHeight - clientHeight;
                  window.scrollTo({
                    top: totalScrollableHeight,
                    behavior: 'smooth'
                  });
                }}
                aria-label="Open Atelier Bag" 
                className="hover:text-white transition-all hover:scale-[1.12] duration-300 flex items-center justify-center p-0.5 relative cursor-pointer"
              >
                <ShoppingBag className="w-[17px] h-[17px]" />
                <span className="absolute -top-[1.5px] -right-[1.5px] w-[6.5px] h-[6.5px] bg-[#FBFF8D] rounded-full scale-100 animate-pulse" />
              </button>
            </div>
          </nav>
        </header>

        {/* MID & BOTTOM HERO GRID */}
        <main className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 mt-12 lg:mt-auto mb-4 lg:mb-0 items-end">
          
          {/* LEFT SIDE CONTENT: COLUMNS 1-7 */}
          <div className="lg:col-span-7 flex flex-col justify-end h-full">

            {/* MONUMENTAL DISPLAY HEADING IN INSTRUMENT SERIF — Fluid sizing mapped strictly to viewport size */}
            <h1 
              id="sculpted-title"
              className="font-serif not-italic font-normal text-[3.2rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[5.8rem] xl:text-[6.8rem] 2xl:text-[7.5rem] leading-[0.88] text-[#FBFF8D] tracking-[-0.01em] uppercase mb-8 lg:mb-12"
              style={{
                textShadow: '0 4px 12px rgba(0,0,0,0.2)',
                fontSize: 'clamp(2.5rem, 5.6vw, 7.5rem)'
              }}
            >
              <div style={getStaggerStyle(0.09, 0.20)}>&nbsp;&nbsp;&nbsp;&nbsp;<span className="italic">SCULPTED</span></div>
              <div style={getStaggerStyle(0.12, 0.23)}>BY TIME. WORN</div>
              <div style={getStaggerStyle(0.15, 0.26)}>BY <span className="italic">YOU</span></div>
            </h1>

            {/* SECONDARY MANIFESTO PROSE (BOTTOM-LEFT) */}
            <div className="flex flex-col gap-4 max-w-[480px] mt-2 lg:mt-0 pointer-events-auto">
              <p className="font-sans text-[11px] lg:text-[11.5px] leading-relaxed text-white/50 font-light w-[260px]" style={getStaggerStyle(0.18, 0.29)}>
                We craft modern jewelry that speaks volumes through silence. Our vision merges classical metalwork with a stark, avant-garde aesthetic. We find our deepest inspiration in the raw, untouched forces of nature.
              </p>
              <p className="font-sans text-[11px] lg:text-[11.5px] leading-relaxed text-white/50 font-light w-[260px]" style={getStaggerStyle(0.21, 0.32)}>
                Every piece acts as a personal manifesto. Forged from the earth's most resilient elements, we do not merely shape materials; we reveal their true, uncompromising character in every deliberate curve.
              </p>
            </div>

          </div>

          {/* RIGHT SIDE CONTENT: COLUMNS 8-12 (PRODUCT SPOTLIGHT CARD) */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-end w-full lg:pl-12">
            
            {/* Product description block */}
            <div className="w-full max-w-[240px] text-center mb-5 lg:mb-6 pointer-events-auto" style={getStaggerStyle(0.14, 0.25)}>
              <span className="block font-sans text-[10.5px] lg:text-[11px] tracking-[-0.03em] text-white/40 mb-2">
                Abyssal Silver Ring
              </span>
              <h2 className="font-sans text-xs lg:text-sm font-semibold text-white tracking-wide tracking-[-0.03em] mb-3">
                18K White Gold & Rough Onyx
              </h2>
              <p className="font-sans text-[10.5px] leading-[14px] text-white/50 font-light text-center w-[240px] mx-auto">
                Explore a series of adornments inspired by severe natural textures and stark minimalism. The coldness of raw steel and the reflection of dark water converge into one flawless shape.
              </p>
            </div>

            {/* Transparent Luxury Product Card Container - Reduced width by exactly 20% from 310px to 240px */}
            <div className="w-full max-w-[240px] pointer-events-auto group">
              <div 
                id="product-image-card" 
                className="aspect-[4/5] w-full flex items-center justify-center p-2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04]"
                style={getStaggerStyle(0.18, 0.29)}
              >
                <img 
                  id="product-display"
                  src="https://res.cloudinary.com/dbfd996z4/image/upload/q_auto/f_auto/v1781009782/rng_awymkj.png"
                  alt="High Luxury 18K White Gold Ring with Pink Gemstone" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain pointer-events-none transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
              </div>

              {/* Price Tag with matching premium styling centered and elegant serif */}
              <div className="flex justify-center w-full mt-1 lg:mt-2" style={getStaggerStyle(0.20, 0.31)}>
                <span 
                  id="price-label" 
                  className="font-serif text-2xl md:text-3xl lg:text-[2.1rem] tracking-tight font-normal text-white transition-colors duration-300 group-hover:text-[#FBFF8D]"
                >
                  $1,850
                </span>
              </div>
            </div>

          </div>

        </main>

      </div>

      {/* LUXURIOUS PRODUCT SLIDE-IN SHEET (Slides in from the left when active) */}
      <div 
        id="earrings-panel"
        className={`fixed top-0 left-0 h-full w-full sm:w-[600px] lg:w-[648px] bg-[#FAF9F5] text-[#121212] z-30 shadow-[12px_0_45px_rgba(0,0,0,0.22)] flex flex-col justify-between p-8 md:p-11 lg:p-12 transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto ${
          isCardOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* FLOATING CLOSE / BACK BUTTON */}
        <button 
          id="panel-back-button"
          onClick={handleClosePanel}
          className="absolute top-6 left-6 z-40 flex items-center gap-2 text-[10px] sm:text-[11px] font-bold tracking-[0.16em] text-black/50 hover:text-black transition-all duration-300 group cursor-pointer uppercase"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          BACK TO SERIES
        </button>

        {/* DYNAMIC PRODUCT PRESENTATION */}
        <div id="earrings-product-card" className="flex flex-col gap-5 mt-10 mb-auto w-full">
          
          {/* Header text elements centered exactly like mockup reference */}
          <div className="flex flex-col items-center text-center pt-2 select-none">
            <span className="font-sans text-[11px] sm:text-[12px] font-medium tracking-[0.15em] text-[#8E8B84] uppercase">
              {activeProduct.category}
            </span>
            <h2 className="font-serif text-3xl sm:text-[34px] font-normal text-black mt-2 tracking-tight">
              {activeProduct.title}
            </h2>
            <p className="font-sans text-[11.5px] sm:text-[12px] leading-relaxed text-[#73716C] font-light max-w-[430px] mt-3.5 px-2">
              {activeProduct.description}
            </p>
          </div>

          {/* Central high resolution luxury photograph */}
          <div className="w-full flex items-center justify-center py-2">
            <img 
              id="earrings-image"
              src={activeProduct.image}
              alt={activeProduct.alt}
              className="w-full max-w-[460px] h-auto object-contain pointer-events-none select-none transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              referrerPolicy="no-referrer"
            />
          </div>

        </div>

        {/* ATELIER TRANSACTION CONTROL ROW (Flex block matching mockup footer with full-width border) */}
        <div 
          id="panel-actions" 
          className="flex items-center justify-between gap-3 pt-6 border-t border-black/10 mt-auto -mx-8 md:-mx-11 lg:-mx-12 px-8 md:px-11 lg:px-12"
        >
          {/* Add to Atelier bag CTA */}
          <button 
            id="panel-btn-add"
            className="h-[50px] flex-1 bg-black text-white font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-zinc-900 transition-colors duration-300 flex items-center justify-center cursor-pointer shrink-0"
          >
            ADD TO ATELIER BAG
          </button>
          
          {/* Quantity selector custom block */}
          <div className="h-[50px] bg-[#E5E5E2] flex items-center px-4 shrink-0 text-black text-sm select-none">
            <button 
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="hover:text-black/60 transition-colors cursor-pointer px-2.5 font-semibold text-[15px]"
            >
              -
            </button>
            <span className="w-5 text-center font-sans font-medium tracking-wide">{quantity}</span>
            <button 
              onClick={() => setQuantity(q => q + 1)}
              className="hover:text-black/60 transition-colors cursor-pointer px-2.5 font-semibold text-[15px]"
            >
              +
            </button>
          </div>

          {/* Luxury Serif dynamic price badge */}
          <div className="font-serif text-[32px] sm:text-[38px] lg:text-[42px] font-normal leading-none text-black pl-3 tracking-tight shrink-0 select-none">
            ${(activeProduct.price * quantity).toLocaleString()}
          </div>
        </div>

      </div>

      {/* Global Embedded Animations and subtle styling tweaks */}
      <style>{`
        @keyframes scrollLine {
          0% { transform: translateY(-100%); }
          80% { transform: translateY(200%); }
          100% { transform: translateY(200%); }
        }
        /* Custom scrollbar to match luxury dark theme */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #020202;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 99px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 255, 141, 0.4);
        }
        
        /* Fine tune layout on smaller heights or widescreen */
        @media (max-height: 780px) and (min-width: 1024px) {
          #sculpted-title {
            margin-bottom: 1.5rem;
          }
          #product-image-card {
            padding: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
