// Define an interface for the breakpoints
interface SwiperBreakpoints {
  [width: number]: {
    slidesPerView: number;
    spaceBetween: number;
  };
}

// Define an interface for the SwiperOptions
interface SwiperOptions {
  slidesPerView: number;
  spaceBetween: number;
  breakpoints: {
    [width: number]: {
      slidesPerView: number;
      spaceBetween: number;
    };
  };
  navigation: {
    nextEl: string;
    prevEl: string;
  };
  scrollbar: {
    el: string;
  };
}

// Define a function to create the SwiperOptions
const createSwiperOptions = (
  slidesPerView: number,
  spaceBetween: number,
  breakpoints: SwiperBreakpoints
): SwiperOptions => {
  return {
    slidesPerView,
    spaceBetween,
    breakpoints,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    scrollbar: {
      el: '.swiper-scrollbar',
    },
  };
};

// Create the SwiperOptions object using the createSwiperOptions function
export const SwiperOptions = {
  cast: createSwiperOptions(6, 50, {
    240: { slidesPerView: 2, spaceBetween: 10 },
    320: { slidesPerView: 2, spaceBetween: 10 },
    480: { slidesPerView: 3, spaceBetween: 20 },
    640: { slidesPerView: 2, spaceBetween: 20 },
    768: { slidesPerView: 4, spaceBetween: 40 },
    1024: { slidesPerView: 6, spaceBetween: 50 },
  }),
  similar: createSwiperOptions(5, 50, {
    240: { slidesPerView: 1, spaceBetween: 10 },
    320: { slidesPerView: 1, spaceBetween: 10 },
    480: { slidesPerView: 1, spaceBetween: 20 },
    640: { slidesPerView: 2, spaceBetween: 20 },
    768: { slidesPerView: 3, spaceBetween: 40 },
    1024: { slidesPerView: 4, spaceBetween: 50 },
    1280: { slidesPerView: 5, spaceBetween: 50 },
  }),
  knownFor: createSwiperOptions(5, 50, {
    240: { slidesPerView: 1, spaceBetween: 10 },
    320: { slidesPerView: 1, spaceBetween: 10 },
    480: { slidesPerView: 1, spaceBetween: 20 },
    640: { slidesPerView: 2, spaceBetween: 20 },
    768: { slidesPerView: 3, spaceBetween: 40 },
    1024: { slidesPerView: 4, spaceBetween: 50 },
    1280: { slidesPerView: 5, spaceBetween: 50 },
  }),
};

// Create the SwiperNavigation object
export const SwiperNavigation = {
  nextEl: '.swiper-button-next',
  prevEl: '.swiper-button-prev',
};

