"use client";

import Image from "next/image";

import { motion } from "framer-motion";

import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { montserrat, poppins } from "@/styles/fonts";

import { HomeMemberServiceCard } from "@/features/home/components/home-member-service-card";

import sharedStyles from "../styles/home-shared.module.scss";

const memberServices = [
  {
    title: "Health & Wellness",
    description: "Holistic healthcare services for mind, body, and spirit",
    iconSrc: "/icons/home/support/health-wellness.svg",
    toneClassName: "bg-[linear-gradient(135deg,#C34844_0%,#FF5B63_100%)]",
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
    toneClassName: "bg-[linear-gradient(135deg,#4D628A_0%,#6DD3C4_100%)]",
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
    toneClassName: "bg-[linear-gradient(135deg,#154A8F_0%,#1E81F6_100%)]",
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
    toneClassName: "bg-[linear-gradient(135deg,#C2573D_0%,#F79525_100%)]",
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
    label: "Call: 109 02001",
    iconSrc: "/icons/home/support/call.svg",
    className:
      "bg-white text-[#5C9C8A] shadow-[0_18px_38px_-26px_rgba(0,0,0,0.45)]",
  },
  {
    label: "Email Support",
    iconSrc: "/icons/home/support/email.svg",
    className: "border border-white/85 bg-transparent text-white",
  },
] as const;

export function HomeMemberServicesSection() {
  return (
    <motion.section
      className="overflow-hidden bg-[#ede6dc]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeInUpContainer}
    >
      <div
        className={cn(sharedStyles.sectionContainer, "py-10 sm:py-12 lg:py-14")}
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
            Member Services
          </motion.span>

          <motion.h2
            className={cn(
              montserrat.className,
              "mx-auto mt-5 max-w-4xl text-[clamp(1.7rem,3.5vw,2.9rem)] leading-[1.06] font-semibold tracking-[-0.05em] text-[#0B3B33]",
            )}
            variants={fadeInUpItem}
          >
            Comprehensive <span className="text-primary">Support</span> for Our
            Community
          </motion.h2>

          <motion.p
            className={cn(
              poppins.className,
              "mx-auto mt-4 max-w-4xl text-[clamp(0.92rem,1.35vw,1.05rem)] leading-[1.5] tracking-[-0.02em] text-[#26231E]",
            )}
            variants={fadeInUpItem}
          >
            As an enrolled member of the Taíno Nation, you gain access to a wide
            range of services designed to support your health, wellbeing,
            education, and cultural connection.
          </motion.p>
        </div>

        <motion.div
          className="mt-8 grid gap-3 lg:grid-cols-2"
          variants={fadeInUpContainer}
        >
          {memberServices.map((service) => (
            <HomeMemberServiceCard key={service.title} {...service} />
          ))}
        </motion.div>

        <motion.article
          className="mt-10 rounded-[1.45rem] bg-[radial-gradient(circle_at_top_left,rgba(197,49,51,0.2),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(111,175,196,0.16),transparent_38%),linear-gradient(135deg,#2d2018_0%,#1f1712_100%)] px-4 py-8 text-center text-white shadow-[0_28px_64px_-40px_rgba(27,18,13,0.42)] sm:px-6 sm:py-9 lg:px-8 lg:py-10"
          variants={fadeInUpItem}
        >
          <div className="mx-auto max-w-3xl">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/6">
              <span className="text-[1.4rem] leading-none text-white/92">
                i
              </span>
            </div>

            <h3
              className={cn(
                montserrat.className,
                "mt-4 text-[clamp(1.7rem,3.4vw,2.8rem)] leading-[1.06] font-semibold tracking-[-0.05em]",
              )}
            >
              Need Help Accessing Services?
            </h3>

            <p
              className={cn(
                poppins.className,
                "mx-auto mt-3 max-w-2xl text-[0.94rem] leading-[1.3] text-white/82 sm:text-[1rem]",
              )}
            >
              Our Member Services team is here to help you navigate available
              resources and connect you with the support you need.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {supportActions.map((action) => (
                <button
                  key={action.label}
                  className={cn(
                    montserrat.className,
                    "flex min-h-12 min-w-[15rem] cursor-pointer items-center justify-center gap-2.5 rounded-full px-6 text-[0.92rem] font-semibold tracking-[-0.03em] transition-transform duration-200 hover:-translate-y-0.5",
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
