"use client";

import Image from "next/image";

import { motion } from "framer-motion";

import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { HomeMemberServiceCard } from "@/features/home/components/home-member-service-card";

import sharedStyles from "../styles/home-shared.module.scss";

const memberServices = [
  {
    title: "Health & Wellness",
    description: "Holistic healthcare services for mind, body, and spirit",
    iconSrc: "/icons/home/support/health-wellness.svg",
    toneClassName: "bg-foreground",
    buttonLabel: "Explore Health Services",
    href: "/services?category=health#popular-services",
    bullets: [
      "Traditional healing practices and herbal medicine consultations",
      "Mental health counseling and wellness programs",
      "Healthcare navigation and insurance assistance",
      "Community health workshops and preventive care education",
    ],
  },
  {
    title: "Legal Assistance",
    description: "Expert guidance on Indigenous rights and legal matters",
    iconSrc: "/icons/home/support/legal-assistance.svg",
    toneClassName: "bg-foreground",
    buttonLabel: "Explore Legal Support",
    href: "/services?category=legal#popular-services",
    bullets: [
      "Tribal sovereignty and Indigenous rights advocacy",
      "Land claims and ancestral territory documentation support",
      "Legal referrals and consultation services",
      "Document preparation and notary services",
    ],
  },
  {
    title: "Education & Training",
    description: "Learning opportunities for all ages and skill levels",
    iconSrc: "/icons/home/support/education-training.svg",
    toneClassName: "bg-foreground",
    buttonLabel: "Explore Education Programs",
    href: "/services?category=education_training#popular-services",
    bullets: [
      "Taíno language preservation and instruction programs",
      "Cultural workshops on traditional crafts, music, and ceremonies",
      "Scholarship opportunities for higher education",
      "Vocational training and career development programs",
    ],
  },
  {
    title: "Community Support",
    description: "Resources to help members thrive and succeed",
    iconSrc: "/icons/home/support/community-support.svg",
    toneClassName: "bg-foreground",
    buttonLabel: "Explore Community Support",
    href: "/services?category=community_support#popular-services",
    bullets: [
      "Emergency assistance and crisis intervention services",
      "Housing support and homelessness prevention programs",
      "Food security initiatives and community gardens",
      "Elder care and youth mentorship programs",
    ],
  },
] as const;

const supportActions = [
  {
    label: "Email Support",
    iconSrc: "/icons/home/support/email.svg",
    className: "border-background/80 text-background border bg-transparent",
  },
] as const;

export function HomeMemberServicesSection() {
  return (
    <motion.section
      className="bg-background overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeInUpContainer}
    >
      <div
        className={cn(sharedStyles.sectionContainer, "py-10 sm:py-12 lg:py-14")}
      >
        <div className="mx-auto max-w-5xl text-center">
          <motion.p
            className="text-muted-foreground text-xs font-semibold tracking-[0.3em] uppercase"
            variants={fadeInUpItem}
          >
            Member Services
          </motion.p>

          <motion.h2
            className="text-foreground mx-auto mt-3 max-w-4xl text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl"
            variants={fadeInUpItem}
          >
            Comprehensive Support for Our Community
          </motion.h2>

          <motion.p
            className="text-muted-foreground mx-auto mt-4 max-w-4xl text-sm leading-6 sm:text-base"
            variants={fadeInUpItem}
          >
            As an enrolled member of the Taíno Nation, you will be part of a
            growing services hub created to support health, wellbeing,
            education, cultural connection, and community care. This space will
            be built collectively over time, guided by the needs of our members
            and strengthened by community leaders, practitioners, educators, and
            service providers who wish to offer their knowledge in service to
            one another.
          </motion.p>
        </div>

        <motion.div
          className="mt-10 grid gap-4 lg:grid-cols-2"
          variants={fadeInUpContainer}
        >
          {memberServices.map((service) => (
            <HomeMemberServiceCard key={service.title} {...service} />
          ))}
        </motion.div>

        <motion.article
          className="bg-foreground text-background shadow-card mt-10 rounded-2xl p-6 text-center sm:p-8 lg:p-10"
          variants={fadeInUpItem}
        >
          <div className="mx-auto max-w-3xl">
            <div className="border-background/20 bg-background/10 mx-auto flex h-11 w-11 items-center justify-center rounded-full border">
              <span
                aria-hidden="true"
                className="text-background/90 text-[1.4rem] leading-none"
              >
                i
              </span>
            </div>

            <h3 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              Need Help Accessing Services?
            </h3>

            <p className="text-background/80 mx-auto mt-3 max-w-2xl text-sm leading-6 sm:text-base">
              Our Member Services team is here to help you navigate available
              resources and connect you with the support you need.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {supportActions.map((action) => (
                <button
                  key={action.label}
                  className={cn(
                    "focus-visible:ring-ring flex min-h-12 min-w-[15rem] cursor-pointer items-center justify-center gap-2.5 rounded-full px-6 text-[0.92rem] font-semibold transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transform-none",
                    action.className,
                  )}
                  type="button"
                >
                  <Image
                    alt=""
                    aria-hidden="true"
                    className="h-4.5 w-4.5 object-contain"
                    height={18}
                    src={action.iconSrc}
                    width={18}
                  />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.article>
      </div>
    </motion.section>
  );
}
