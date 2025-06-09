import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const logos = [
  {
    id: "eap",
    description: "ΕΑΠ",
    image: "/local-uploads/carousel/eap.png",
    className: "h-10 w-auto",
  },
  {
    id: "harvard",
    description: "Harvard",
    image: "/local-uploads/carousel/harvard.png", 
    className: "h-10 w-auto",
  },
  {
    id: "mit",
    description: "MIT",
    image: "/local-uploads/carousel/mit.png",
    className: "h-10 w-auto",
  },
  {
    id: "nyu",
    description: "NYU",
    image: "/local-uploads/carousel/nyu.png",
    className: "h-10 w-auto",
  },
  {
    id: "oxford",
    description: "Oxford",
    image: "/local-uploads/carousel/oxford.png",
    className: "h-10 w-auto",
  },
  {
    id: "stanford",
    description: "Stanford",
    image: "/local-uploads/carousel/stanford.png",
    className: "h-10 w-auto",
  },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export function LogosSlider() {
  const isMobile = useIsMobile();
  return (
    <div className='relative h-[100px] w-full overflow-hidden bg-transparent'>
      <InfiniteSlider 
        className='flex h-full w-full items-center' 
        duration={30}
        gap={isMobile ? 24 : 36}
      >
        {logos.map((logo) => (
          <div 
            key={logo.id} 
            className='flex flex-row items-center justify-center w-32 sm:w-40 mx-8'
          >
            <img
              src={logo.image}
              alt={logo.description}
              className={`${logo.className}`}
            />
            <span className='ml-4 text-gray-400 font-medium text-xs sm:text-sm md:text-base text-left whitespace-nowrap'>
              {logo.description}
            </span>
          </div>
        ))}
      </InfiniteSlider>
    </div>
  );
}
