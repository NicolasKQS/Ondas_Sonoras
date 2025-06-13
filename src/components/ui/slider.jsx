
import React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

const Slider = React.forwardRef(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex w-full touch-none select-none items-center group py-1.5',
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2.5 w-full grow overflow-hidden rounded-full bg-indigo-400/30 shadow-inner">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-sky-400 to-lime-400 rounded-full transition-all duration-300 group-hover:opacity-100 opacity-80" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-indigo-200 bg-white ring-offset-background transition-all duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-md group-hover:scale-110 group-active:scale-125" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
