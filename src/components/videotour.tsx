import { useId } from "react";
import { Reveal } from "./reveal";
import poster from "../assets/images/livingroom1.webp";

export const YOUTUBE_URL = "https://youtube.com/shorts/1vVHA4Kxwi0";

/*
  Performance notes
  - The file lives in /public/videos, so it is never bundled and is cached by the CDN.
  - preload="none": zero video bytes are downloaded until the guest presses play,
    so the page loads exactly as fast as it did before.
  - The YouTube link is a plain link (no iframe), so no YouTube scripts are loaded.
*/
const VIDEO_SRC = "/videos/apartment-tour.mp4";

export default function VideoTour() {
  const id = useId();

  return (
    <section id="video-tour" aria-labelledby={`${id}-title`} className="scroll-mt-32">
      <Reveal>
        <p className="eyebrow">Video tour</p>
        <h2 id={`${id}-title`} className="mt-2 text-h2 md:text-[42px] md:leading-[1.1]">
          Walk through the house
        </h2>
      </Reveal>

      <Reveal delay={0.08} className="mt-8 grid items-center gap-8 sm:grid-cols-[minmax(0,300px)_1fr] md:gap-12">
        {/* Portrait (9:16) phone video */}
        <div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-2xl bg-navy-950 shadow-lg sm:mx-0">
          <video
            className="aspect-[9/16] w-full object-cover"
            controls
            playsInline
            preload="none"
            poster={poster}
            width={720}
            height={1280}
            aria-label="Video tour of the Aklass house"
          >
            <source src={VIDEO_SRC} type="video/mp4" />
            Your browser can't play this video.{" "}
            <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer">Watch it on YouTube</a>.
          </video>
        </div>

        <div className="flex flex-col gap-5">
          <p className="max-w-[32rem] text-body-lg text-ink-muted">
            Get a feel for the space before you arrive, from the living rooms and kitchen to every
            bedroom and the garden. Press play for the full tour.
          </p>
          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline self-start"
            aria-label="Watch the tour on YouTube (opens in a new tab)"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
              <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
            </svg>
            Watch on YouTube
          </a>
        </div>
      </Reveal>
    </section>
  );
}
