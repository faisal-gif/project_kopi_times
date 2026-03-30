import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/Components/ui/carousel";

const slides = [
  [
    { src: 'https://cdn2.timesmedia.co.id/cdn-times/uploads/assets/2026/03/30/testimonial-cdn-1-kmcwo5oq.webp', alt: "Testimoni dr. Karolon Margret Natasa, MH. - Bupati Kabupaten Landak, Kalbar" },
    { src: 'https://cdn2.timesmedia.co.id/cdn-times/uploads/assets/2026/03/30/testimonial-cdn-2-8sir22zk.webp', alt: "Testimoni Drs. Cornelis, M.H. - Anggota Banggar dan Komisi XII DPR RI" },
    { src: 'https://cdn2.timesmedia.co.id/cdn-times/uploads/assets/2026/03/30/testimonial-cdn-3-avlvrauf.webp', alt: "Testimoni Tri Gunadi - Psikolog dan Dosen Universitas 17 Agustus 1945 Surabaya" },
    { src: 'https://cdn2.timesmedia.co.id/cdn-times/uploads/assets/2026/03/30/testimonial-cdn-4-vvj9jkxo.webp', alt: "Testimoni dr. Karolon Margret Natasa, MH. (2)" },
  ],
  [
    { src: 'https://cdn2.timesmedia.co.id/cdn-times/uploads/assets/2026/03/30/testimonial-cdn-5-r2jxoqpx.webp', alt: "Testimoni Drs. Cornelis, M.H. (2)" },
    { src: 'https://cdn2.timesmedia.co.id/cdn-times/uploads/assets/2026/03/30/testimonial-cdn-6-18r7wr2s.webp', alt: "Testimoni Tri Gunadi (2)" },
    { src: 'https://cdn2.timesmedia.co.id/cdn-times/uploads/assets/2026/03/30/testimonial-cdn-7-4xehf3cr.webp', alt: "Testimoni dr. Karolon Margret Natasa, MH. (3)" },
    { src: 'https://cdn2.timesmedia.co.id/cdn-times/uploads/assets/2026/03/30/testimonial-cdn-8-1qd6seur.webp', alt: "Testimoni Drs. Cornelis, M.H. (3)" },
  ],
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Testimoni
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3 mb-6">
            Apa Kata Mereka?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Tokoh-tokoh nasional yang telah merasakan manfaat bergabung di ekosistem AJP.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <Carousel opts={{ loop: true }}>
            <CarouselContent>
              {slides.map((slide, slideIndex) => (
                <CarouselItem key={slideIndex}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {slide.map((item, imgIndex) => (
                      <div
                        key={imgIndex}
                        className="rounded-2xl overflow-hidden border border-border shadow-sm"
                      >
                        <img
                          src={item.src}
                          alt={item.alt}
                          className="w-full h-auto object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
