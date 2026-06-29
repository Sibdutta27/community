"use client";

import Image from "next/image";

import { motion } from "framer-motion";

import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";

export function HomeGuainiaMapSection() {
  return (
    <motion.section
      className="overflow-hidden bg-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeInUpContainer}
    >
      <motion.div
        className="w-full pt-0 pb-12 sm:pb-14 lg:pb-16"
        variants={fadeInUpItem}
      >
        <Image
          alt="Illustrated Guainia regional map"
          className="h-auto w-full"
          height={871}
          priority={false}
          src="/images/guainia-map.svg"
          width={1808}
        />
      </motion.div>
    </motion.section>
  );
}
