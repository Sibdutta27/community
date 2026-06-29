"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { motion } from "framer-motion";

import { fadeInScaleItem, fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { montserrat, poppins } from "@/styles/fonts";

import sharedStyles from "../styles/home-shared.module.scss";

const memberStories = [
  {
    name: "Isabela Rivera",
    imageSrc: "/images/member1.png",
    story:
      "Joining the platform helped me organize my maternal lineage, reconnect with family stories, and feel a real sense of belonging within the Taíno community.",
  },
  {
    name: "Daniel Morales",
    imageSrc: "/images/member2.png",
    story:
      "I had always known pieces of my ancestry, but this space gave me the confidence to explore it fully and connect with descendants who share that same journey.",
  },
  {
    name: "Mariana Santos",
    imageSrc: "/images/member3.png",
    story:
      "Through the platform, I found cultural resources, regional connections, and a stronger relationship with my heritage than I had ever experienced before.",
  },
] as const;

export function HomeMemberStoriesSection() {
  const [activeStoryIndex, setActiveStoryIndex] = useState(1);
  const activeStory = memberStories[activeStoryIndex];

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveStoryIndex((currentIndex) =>
        currentIndex === memberStories.length - 1 ? 0 : currentIndex + 1,
      );
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <motion.section
      className="overflow-hidden bg-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={fadeInUpContainer}
    >
      <div
        className={cn(sharedStyles.sectionContainer, "py-9 sm:py-10 lg:py-12")}
      >
        <div className="mx-auto max-w-5xl text-center">
          <motion.span
            className={cn(
              sharedStyles.sectionBadge,
              poppins.className,
              "bg-[#DDF4EF] px-4.5 py-1.5 text-[0.8rem] tracking-[-0.02em] text-[#163B35] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]",
            )}
            variants={fadeInUpItem}
          >
            Community Voices
          </motion.span>

          <motion.h2
            className={cn(
              montserrat.className,
              "mx-auto mt-5 max-w-4xl text-[clamp(1.55rem,3.3vw,2.75rem)] leading-[1.06] font-semibold tracking-[-0.05em] text-[#083B34]",
            )}
            variants={fadeInUpItem}
          >
            Stories from Our Members
          </motion.h2>

          <motion.p
            className={cn(
              poppins.className,
              "mx-auto mt-3.5 max-w-4xl text-[clamp(0.88rem,1.15vw,0.98rem)] leading-[1.45] tracking-[-0.02em] text-[#23201B]",
            )}
            variants={fadeInUpItem}
          >
            Hear from Taíno descendants who have reconnected with their heritage
            through our platform and found belonging in our community.
          </motion.p>
        </div>

        <motion.div
          className="mx-auto mt-7 max-w-4xl text-center"
          variants={fadeInUpContainer}
        >
          <motion.div
            className="mx-auto flex h-12 w-12 items-center justify-center"
            variants={fadeInScaleItem}
          >
            <Image
              alt=""
              aria-hidden="true"
              className="h-11 w-11 object-contain opacity-85"
              height={44}
              src="/icons/quotation.svg"
              width={44}
            />
          </motion.div>

          <motion.blockquote
            className={cn(
              poppins.className,
              "mx-auto mt-4.5 max-w-3xl text-[clamp(0.96rem,1.35vw,1.18rem)] leading-[1.45] tracking-[-0.02em] text-[#11110F]",
            )}
            variants={fadeInUpItem}
          >
            {activeStory.story}
          </motion.blockquote>

          <motion.p
            className={cn(
              montserrat.className,
              "mt-4.5 text-[1.15rem] leading-none font-semibold tracking-[-0.04em] text-[#11110F]",
            )}
            variants={fadeInUpItem}
          >
            {activeStory.name}
          </motion.p>

          <motion.div
            className="mt-4.5 flex justify-center"
            variants={fadeInScaleItem}
          >
            <div className="overflow-hidden rounded-full shadow-[0_14px_32px_-24px_rgba(18,33,31,0.35)]">
              <Image
                alt={`${activeStory.name} portrait`}
                className="h-14 w-14 object-cover sm:h-16 sm:w-16"
                height={64}
                src={activeStory.imageSrc}
                width={64}
              />
            </div>
          </motion.div>

          <motion.div
            className="mt-4.5 flex items-center justify-center gap-2.5"
            variants={fadeInUpItem}
          >
            {memberStories.map((story, index) => {
              const isActive = index === activeStoryIndex;

              return (
                <button
                  key={story.name}
                  aria-label={`Show story from ${story.name}`}
                  aria-pressed={isActive}
                  className={cn(
                    "cursor-pointer rounded-full transition-all duration-200",
                    isActive
                      ? "h-3 w-3 bg-[#4C4744]"
                      : "h-2.5 w-2.5 bg-[#D5D2D0] hover:bg-[#BEB9B5]",
                  )}
                  type="button"
                  onClick={() => setActiveStoryIndex(index)}
                />
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
