import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';

const logos = [
  {
    id: "eap",
    description: "EAP",
    image: "/local-uploads/carousel/eap.png",
    className: "h-7 w-auto",
  },
  {
    id: "harvard",
    description: "Harvard",
    image: "/local-uploads/carousel/harvard.png", 
    className: "h-7 w-auto",
  },
  {
    id: "mit",
    description: "MIT",
    image: "/local-uploads/carousel/mit.png",
    className: "h-7 w-auto",
  },
  {
    id: "nyu",
    description: "NYU",
    image: "/local-uploads/carousel/nyu.png",
    className: "h-7 w-auto",
  },
  {
    id: "oxford",
    description: "Oxford",
    image: "/local-uploads/carousel/oxford.png",
    className: "h-7 w-auto",
  },
  {
    id: "stanford",
    description: "Stanford",
    image: "/local-uploads/carousel/stanford.png",
    className: "h-7 w-auto",
  },
];

export function LogosSlider() {
  return (
    <div className='relative h-[100px] w-full overflow-hidden'>
      <InfiniteSlider 
        className='flex h-full w-full items-center' 
        duration={30}
        gap={48}
      >
        {logos.map((logo) => (
          <div 
            key={logo.id} 
            className='flex w-32 items-center justify-center'
          >
            <img
              src={logo.image}
              alt={logo.description}
              className={logo.className}
            />
          </div>
        ))}
      </InfiniteSlider>
      <ProgressiveBlur
        className='pointer-events-none absolute top-0 left-0 h-full w-[200px]'
        direction='left'
        blurIntensity={1}
      />
      <ProgressiveBlur
        className='pointer-events-none absolute top-0 right-0 h-full w-[200px]'
        direction='right'
        blurIntensity={1}
      />
    </div>
  );
}
